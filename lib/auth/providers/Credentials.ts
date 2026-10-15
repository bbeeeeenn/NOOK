import { compareData } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";

export default Credentials({
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
         !(await compareData(credentials.password as string, user.password))
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
});
