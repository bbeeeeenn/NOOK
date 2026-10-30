import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Result } from "@/types/types";

export default async function getProgramsAndColleges(): Promise<
   Result<{ colleges: string[]; programs: string[] }>
> {
   try {
      const res = await cachedProgramsAndColleges();
      return {
         ok: true,
         data: {
            programs: res[0].map((p) => p.program),
            colleges: res[1].map((c) => c.college),
         },
      };
   } catch (error) {
      console.error("Error on getProgramsAndColleges()", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         return {
            ok: false,
            error: "DATABASE",
            message: `Database error (${error.code})`,
         };
      }
      return { ok: false, error: "OTHER", message: "Unexpected error" };
   }
}

async function cachedProgramsAndColleges() {
   "use cache: remote";

   return await Promise.all([
      prisma.borrowerRecord.findMany({
         distinct: ["program"],
         select: { program: true },
      }),
      prisma.borrowerRecord.findMany({
         distinct: ["college"],
         select: { college: true },
      }),
   ]);
}
