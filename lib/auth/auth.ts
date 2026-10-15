import { adminLoginPage } from "@/constants";
import { prisma } from "../prisma";
import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "./providers/Credentials";
import GoogleProvider from "./providers/Google";

export const authOptions = {
   secret: process.env.AUTH_SECRET,
   session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
   pages: {
      signIn: adminLoginPage,
      error: process.env.NODE_ENV === "production" ? adminLoginPage : undefined,
      signOut: adminLoginPage,
   },
   adapter: PrismaAdapter(prisma),
   providers: [CredentialsProvider, GoogleProvider],
   callbacks: {
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
      async jwt({ account, user, token, profile }) {
         if (user) {
            token.role =
               process.env.ADMIN_EMAIL === user.email ? "Admin" : "Staff";
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
      async session({ session, token }) {
         session.user.id = token.sub!;
         session.user.userType = token.role;
         return session;
      },
   },
} satisfies NextAuthConfig;

export const { auth, signIn, signOut, handlers, unstable_update } =
   NextAuth(authOptions);
