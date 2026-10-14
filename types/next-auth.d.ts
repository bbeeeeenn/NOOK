import { UserType } from "@/generated/prisma/enums";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
   interface User {
      userType: UserType;
   }

   interface Session {
      user: {
         id: string;
      } & DefaultSession["user"];
   }
}

declare module "@auth/core/jwt" {
   interface JWT {
      role: UserType;
   }
}
