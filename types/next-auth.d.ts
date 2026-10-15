import { DefaultSession } from "next-auth";

declare module "next-auth" {
   interface Session {
      user: {
         id: string;
         userType: "Admin" | "Staff";
      } & DefaultSession["user"];
   }
}

declare module "@auth/core/jwt" {
   interface JWT {
      role: "Admin" | "Staff";
   }
}
