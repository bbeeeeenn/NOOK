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
               image: user.image,
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
      async jwt({ user, account, token, profile }) {
         if (user) {
            token.id = user.id!;
         }

         // Store Google tokens on initial Google sign-in
         if (account?.provider === "google") {
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
         return session;
      },
   },
   // More configurations
   secret: process.env.AUTH_SECRET,
   session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
   pages: {
      signIn: adminLoginPage,
      // error: adminLoginPage,
      signOut: adminLoginPage,
   },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers, unstable_update } =
   NextAuth(authOptions);
