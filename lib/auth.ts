// Reference: https://next-auth.js.org/configuration/nextjs#getserversession

import { adminLoginPage } from "@/constants";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { compareData } from "./bcrypt";
import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

const authScopes = {
   openid: "openid",
   email: "email",
   profile: "profile",
   sheets: "https://www.googleapis.com/auth/spreadsheets",
};

export const authOptions = {
   adapter: PrismaAdapter(prisma),
   providers: [
      // Credentials Auth provider
      CredentialsProvider({
         credentials: {
            email: {
               type: "email",
               required: true,
            },
            password: {
               type: "password",
               required: true,
            },
         },
         // Authorization logic
         async authorize(credentials) {
            if (!credentials?.password || !credentials.email) {
               return null;
            }
            const user = await prisma.user.findUnique({
               where: { email: credentials.email as string },
            });
            if (
               !user ||
               !user.password ||
               !(await compareData(
                  credentials.password as string,
                  user.password,
               ))
            ) {
               return null;
            }
            return {
               id: user.id,
               email: user.email,
               name: user.name,
            };
         },
      }),
      // Google auth provider
      GoogleProvider({
         clientId: process.env.AUTH_GOOGLE_CLIENT!,
         clientSecret: process.env.AUTH_GOOGLE_SECRET!,
         authorization: {
            params: {
               scope: Object.values(authScopes).join(" "),
               access_type: "offline",
               prompt: "consent",
            },
         },
         allowDangerousEmailAccountLinking: true,
      }),
   ],

   callbacks: {
      // #Signin ##################################################
      async signIn({ user, account }) {
         if (account?.provider === "google" && user.email) {
            if (!account.scope?.split(" ").includes(authScopes.sheets)) {
               // Prevent missing Google Sheet access scope
               // This is an ugly workaround since user won't know the reason why the login attempt has failed
               // A clean approach should be putting a hint in the JWT token saying that the access token has some missing scope. Then giving them a chance to re-grant the required missing scope.
               // But I won't bother for now.
               return false;
            }
            const allowEmails = process.env
               .ALLOWED_EMAILS!.toLowerCase()
               .split(";");
            return (
               allowEmails.includes(user.email) || allowEmails.includes("*")
            );
         }
         return true;
      },

      // #JWT #######################################################
      async jwt({ user, account, token, trigger, profile }) {
         token.error = undefined;

         if (user) {
            token.id = user.id!;
         }

         // Store Google tokens on initial Google sign-in
         if (account?.provider === "google") {
            token.accessToken = account.access_token;
            token.refreshToken = account.refresh_token;
            token.expiresAt = account.expires_at; // seconds since epoch

            if (token.id) {
               await prisma.account.updateMany({
                  where: {
                     userId: token.id,
                     provider: "google",
                     providerAccountId: account.providerAccountId,
                  },
                  data: {
                     ...(account.access_token && {
                        access_token: account.access_token,
                     }),
                     ...(account.refresh_token && {
                        refresh_token: account.refresh_token,
                     }),
                     ...(account.expires_at != null && {
                        expires_at: account.expires_at,
                     }),
                  },
               });
            }

            // Capture the current profile picture and sync it to the DB
            if (profile?.picture) {
               token.picture = profile.picture as string;
               if (token.id) {
                  await prisma.user.update({
                     where: { id: token.id as string },
                     data: { image: profile.picture as string },
                  });
               }
            }
         }

         // On credentials sign-in, pull any linked Google tokens from the DB
         if (
            trigger === "signIn" &&
            account?.provider === "credentials" &&
            token.id
         ) {
            const googleAccount = await prisma.account.findFirst({
               where: {
                  userId: token.id as string,
                  provider: "google",
               },
               select: {
                  access_token: true,
                  refresh_token: true,
                  expires_at: true,
               },
            });

            if (googleAccount) {
               token.accessToken = googleAccount.access_token ?? undefined;
               token.refreshToken = googleAccount.refresh_token ?? undefined;
               token.expiresAt = googleAccount.expires_at ?? undefined;
            }

            // Pull whatever image is currently stored, regardless of token state
            const dbUser = await prisma.user.findUnique({
               where: { id: token.id as string },
               select: { image: true },
            });

            if (dbUser?.image) {
               token.picture = dbUser.image;
            }
         }

         // Refresh if expired
         if (
            token.expiresAt &&
            Date.now() >= (token.expiresAt as number) * 1000 &&
            token.refreshToken
         ) {
            try {
               const res = await fetch("https://oauth2.googleapis.com/token", {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({
                     client_id: process.env.AUTH_GOOGLE_CLIENT!,
                     client_secret: process.env.AUTH_GOOGLE_SECRET!,
                     grant_type: "refresh_token",
                     refresh_token: token.refreshToken as string,
                  }),
               });
               const refreshed = await res.json();
               if (res.ok) {
                  token.error = undefined;
                  token.accessToken = refreshed.access_token;
                  token.expiresAt =
                     Math.floor(Date.now() / 1000) + refreshed.expires_in;
                  if (refreshed.refresh_token) {
                     token.refreshToken = refreshed.refresh_token;
                  }

                  // keep the DB row in sync so future lookups get the fresh token
                  await prisma.account.updateMany({
                     where: { userId: token.id as string, provider: "google" },
                     data: {
                        access_token: refreshed.access_token,
                        expires_at: token.expiresAt as number,
                        ...(refreshed.refresh_token && {
                           refresh_token: refreshed.refresh_token,
                        }),
                     },
                  });

                  // Pull the current picture along with the refreshed token
                  try {
                     const userinfoRes = await fetch(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        {
                           headers: {
                              Authorization: `Bearer ${refreshed.access_token}`,
                           },
                        },
                     );
                     if (userinfoRes.ok) {
                        const info = await userinfoRes.json();
                        if (info.picture) {
                           token.picture = info.picture;
                           await prisma.user.update({
                              where: { id: token.id as string },
                              data: { image: info.picture },
                           });
                        }
                     }
                  } catch {
                     // non-fatal, keep old picture
                  }
               } else {
                  token.error = "RefreshAccessTokenError";
               }
            } catch {
               token.error = "RefreshAccessTokenError";
            }
         }

         return token;
      },

      // #Session ################################################
      async session({ session, token }) {
         if (session.user) {
            session.user.id = token.id as string;
            session.user.name = token.name;
            session.user.email = token.email ?? session.user.email;
            session.user.image =
               (token.picture as string) ?? session.user.image;
         }
         session.accessToken = token.accessToken as string;
         session.error = token.error as string | undefined;
         return session;
      },
   },
   // More configurations
   secret: process.env.AUTH_SECRET,
   session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
   pages: {
      signIn: adminLoginPage,
      error: adminLoginPage,
      signOut: adminLoginPage,
   },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);
