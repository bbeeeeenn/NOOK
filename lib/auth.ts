// Reference: https://next-auth.js.org/configuration/nextjs#getserversession

import { adminLoginPage } from "@/constants";
import type {
   GetServerSidePropsContext,
   NextApiRequest,
   NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { cache } from "react";
import { prisma } from "./prisma";
import { compareData } from "./bcrypt";

export const authOptions = {
   
   providers: [
      // Credentials Auth provider
      CredentialsProvider({
         credentials: {
            username: {
               type: "text",
               required: true,
            },
            password: {
               type: "password",
               required: true,
            },
         },
         // Authorization logic
         async authorize(credentials) {
            if (!credentials?.password || !credentials.username) {
               return null;
            }
            const user = await prisma.adminAccount.findUnique({
               where: { username: credentials.username },
            });
            if (
               !user ||
               !(await compareData(credentials.password, user.password))
            ) {
               return null;
            }
            return { id: user.id, email: user.email, name: user.name };
         },
      }),
      // Google auth provider
      GoogleProvider({
         clientId: process.env.AUTH_GOOGLE_CLIENT!,
         clientSecret: process.env.AUTH_GOOGLE_SECRET!,
         authorization: {
            params: {
               scope: "openid email profile https://www.googleapis.com/auth/spreadsheets",
               access_type: "offline",
               prompt: "consent",
            },
         },
      }),
   ],
   callbacks: {
      // Signin
      async signIn({ user, account }) {
         if (account?.provider === "google" && user.email) {
            const userFromDb = await prisma.adminAccount.findUnique({
               where: { email: user.email },
               select: { id: true },
            });

            return !!userFromDb;
         }
         return true;
      },
      // JWT
      async jwt({ user, account, token, session, trigger }) {
         if (user) {
            token.id = user.id;
         }

         if (trigger === "update" && session) {
            if (session.email) {
               token.email = session.email;
            }
         }

         if (
            trigger === "signIn" &&
            account?.provider === "google" &&
            user?.email
         ) {
            const userFromDb = await prisma.adminAccount.findUnique({
               where: { email: user.email },
               select: { id: true, name: true },
            });
            if (userFromDb) {
               token.id = userFromDb.id;
               token.name = userFromDb.name;
            }
         }

         // Store Google tokens on initial sign-in
         if (account?.provider === "google") {
            token.accessToken = account.access_token;
            token.refreshToken = account.refresh_token;
            token.expiresAt = account.expires_at; // seconds since epoch
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
                  token.accessToken = refreshed.access_token;
                  token.expiresAt =
                     Math.floor(Date.now() / 1000) + refreshed.expires_in;
                  // Google sometimes rotates the refresh token; keep it if returned
                  if (refreshed.refresh_token) {
                     token.refreshToken = refreshed.refresh_token;
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
      // Session
      async session({ session, token }) {
         if (session.user) {
            session.user.id = token.id as string;
            session.user.name = token.name;
            session.user.email = token.email;
         }
         session.accessToken = token.accessToken as string;
         session.error = token.error as string | undefined;
         return session;
      },
   },
   // More configurations
   secret: process.env.AUTH_SECRET,
   session: { strategy: "jwt" },
   pages: {
      signIn: adminLoginPage,
      error: adminLoginPage,
      signOut: adminLoginPage,
   },
} satisfies NextAuthOptions;

function _auth(
   ...args:
      | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
      | [NextApiRequest, NextApiResponse]
      | []
) {
   return getServerSession(...args, authOptions);
}

export const auth = cache(_auth);
