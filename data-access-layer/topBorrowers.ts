import { PickEnumerable } from "@/generated/prisma/internal/prismaNamespace";
import { BorrowLogGroupByOutputType } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";
import { cacheLife } from "next/cache";

export type TopBorrowers = (PickEnumerable<
   BorrowLogGroupByOutputType,
   "idNumber"[]
> & {
   _count: {
      bookBarcode: number;
   };
})[];

export default async function getTopBorrowers(
   from?: Date,
   to?: Date,
   page = 1,
   pageSize = 20,
): Promise<
   Result<
      (PickEnumerable<BorrowLogGroupByOutputType, "idNumber"[]> & {
         _count: {
            bookBarcode: number;
         };
      })[]
   >
> {
   try {
      const top = await getCachedTopBorrowers(from, to, page, pageSize);
      return { ok: true, data: top };
   } catch (e) {
      console.error(e);
      return { ok: false, error: "OTHER", message: "Unexpected error" };
   }
}

async function getCachedTopBorrowers(
   from?: Date,
   to?: Date,
   page = 1,
   pageSize = 20,
) {
   "use cache: remote";
   cacheLife("days");
   const where = { ...(from || to ? { date: { gte: from, lte: to } } : {}) };
   return await prisma.borrowLog.groupBy({
      by: ["idNumber"],
      where,
      _count: { bookBarcode: true },
      orderBy: { _count: { bookBarcode: "desc" } },
      skip: (page - 1) * pageSize,
      take: pageSize,
   });
}
