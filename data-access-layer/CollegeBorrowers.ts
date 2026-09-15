import { Prisma } from "@/generated/prisma/client";
import { colleges } from "@/constants";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";

export type CollegeBorrowerCount = {
   college: string;
   borrowers: number;
};

export default async function getCollegeBorrowerCounts(
   from: Date,
   to: Date,
): Promise<Result<CollegeBorrowerCount[]>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }

   try {
      const borrowedBy = await prisma.borrowLog.findMany({
         where: { date: { gte: from, lte: to } },
         select: {
            idNumber: true,
            borrower: { select: { college: true } },
         },
      });

      const counts = new Map<string, number>();
      for (const college of colleges) {
         counts.set(college.shorthand, 0);
      }

      for (const row of borrowedBy) {
         counts.set(
            row.borrower.college,
            (counts.get(row.borrower.college) ?? 0) + 1,
         );
      }

      return {
         ok: true,
         data: [...counts.entries()]
            .map(([college, borrowers]) => ({ college, borrowers }))
            .sort(
               (a, b) =>
                  b.borrowers - a.borrowers ||
                  a.college.localeCompare(b.college),
            ),
      };
   } catch (error) {
      console.error("Error on getCollegeBorrowerCounts()", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         return {
            ok: false,
            error: "OTHER",
            message: `Database error (${error.code})`,
         };
      }
      return { ok: false, error: "OTHER", message: "Unexpected error" };
   }
}
