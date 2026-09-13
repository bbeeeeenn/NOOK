import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { cacheLife, cacheTag, updateTag } from "next/cache";

export async function getPendingBorrowerRecords(): Promise<
   Result<
      (Prisma.PickEnumerable<
         Prisma.PendingBorrowLogGroupByOutputType,
         "idNumber"[]
      > & {
         _count: number;
      })[]
   >
> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }

   try {
      const pendingRegistrations = await getCachedPendingBorrowerRecords();
      return { ok: true, data: pendingRegistrations };
   } catch (e) {
      console.error("Error on getPendingStudentRecords()", e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
         return {
            ok: false,
            error: "OTHER",
            message: `Database error (${e.code})`,
         };
      }
      return { ok: false, error: "OTHER", message: "Unexpected error" };
   }
}

async function getCachedPendingBorrowerRecords() {
   "use cache";
   cacheLife("days");
   cacheTag("pedingBorrowerRecords");

   return prisma.pendingBorrowLog.groupBy({ by: ["idNumber"], _count: true });
}

export function updatePendingBorrowerRecordsCache() {
   updateTag("pedingBorrowerRecords");
}
