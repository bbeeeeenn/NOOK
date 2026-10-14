// Reference: https://next-auth.js.org/configuration/nextjs#getserversession

import { adminLoginPage } from "@/constants";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { compareData } from "./bcrypt";
import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

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
               where: {
                  email: (credentials.email as string).trim().toLowerCase(),
               },
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
               image: user.image,
               userType: user.userType,
            };
         },
      }),
      // Google auth provider
      GoogleProvider({
         clientId: process.env.AUTH_GOOGLE_CLIENT!,
         clientSecret: process.env.AUTH_GOOGLE_SECRET!,
         allowDangerousEmailAccountLinking: true,
      }),
   ],

   callbacks: {
      // #Signin ##################################################
      async signIn({ user, account }) {
         if (account?.provider === "google" && user.email) {
            const allowedEmails = process.env
               .ALLOWED_EMAILS!.toLowerCase()
               .split(";");
            allowedEmails.push(process.env.ADMIN_EMAIL!.toLowerCase());
            return (
               allowedEmails.includes(user.email) || allowedEmails.includes("*")
            );
         }
         return true;
      },
      // #JWT #######################################################
      async jwt({ account, user, token, profile }) {
         if (user) {
            token.role = user.userType;
         }

         if (account?.provider === "google" && profile?.picture && token.sub) {
            const picture = profile.picture as string;
            if (token.picture !== picture) {
               await prisma.user.update({
                  where: { id: token.sub },
                  data: { image: picture },
               });
               token.picture = picture;
            }
         }
         return token;
      },
      // #Session ################################################
      async session({ session, token }) {
         session.user.id = token.sub!;
         session.user.userType = token.role;
         return session;
      },
   },
   // More configurations
   secret: process.env.AUTH_SECRET,
   session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
   pages: {
      signIn: adminLoginPage,
      error: process.env.NODE_ENV === "production" ? adminLoginPage : undefined,
      signOut: adminLoginPage,
   },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers, unstable_update } =
   NextAuth(authOptions);
