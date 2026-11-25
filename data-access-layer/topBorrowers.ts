import { PickEnumerable } from "@/generated/prisma/internal/prismaNamespace";
import {
   BorrowLogGroupByOutputType,
   BorrowLogWhereInput,
} from "@/generated/prisma/models";
import { Location } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";
import { cacheLife } from "next/cache";

export type TopBorrowers = (PickEnumerable<
   BorrowLogGroupByOutputType,
   "scannedId"[]
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
   type?: Location,
): Promise<Result<TopBorrowers>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   try {
      const where: BorrowLogWhereInput = {
         scannedId: { not: null },
         ...(from || to ? { date: { gte: from, lte: to } } : {}),
         ...(type ? { circulationType: type } : {}),
      };
      const top = await prisma.borrowLog.groupBy({
         by: ["scannedId"],
         where,
         _count: { bookBarcode: true },
         orderBy: { _count: { bookBarcode: "desc" } },
         skip: (page - 1) * pageSize,
         take: pageSize,
      });

      return { ok: true, data: top };
   } catch (error) {
      console.error("Error on getTopBorrowers()", error);
      return { ok: false, error: "OTHER", message: "Unexpected error" };
   }
}
