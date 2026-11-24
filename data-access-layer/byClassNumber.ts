import { Location, Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";

export default async function getByDDC(
   from: Date,
   to: Date,
   type?: Location,
): Promise<Result<{ rangeStart: number; count: bigint }[]>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   try {
      const typeFilter = type
         ? Prisma.sql`AND b."circulationType" = ${type}`
         : Prisma.empty;
      const counts = await prisma.$queryRaw<
         { rangeStart: number; count: bigint }[]
      >`
        SELECT r.start AS "rangeStart", COUNT(b.id) AS count
        FROM generate_series(0, 900, 100) AS r(start)
        LEFT JOIN "BorrowLog" b
            ON b."classNumber" >= r.start
        AND b."classNumber" < r.start + 100
        AND b."date" >= ${from}
        AND b."date" <= ${to}
        ${typeFilter}
        GROUP BY r.start
        ORDER BY r.start
`;

      return { ok: true, data: counts };
   } catch (e) {
      console.error(e);
      return {
         ok: false,
         error: "OTHER",
         message: "Unexpected server error",
      };
   }
}
