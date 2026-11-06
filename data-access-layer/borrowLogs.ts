import { PAGE_SIZE } from "@/constants";
import { Prisma } from "@/generated/prisma/client";
import { BorrowLogGetPayload } from "@/generated/prisma/models";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";
import { cacheLife } from "next/cache";

type BorrowLog = BorrowLogGetPayload<{
   include: { borrower: true };
}>;

export type PaginatedBorrowLogs = {
   logs: BorrowLog[];
   total: number;
};

export default async function getLogs(
   idNumber?: string,
   from?: Date,
   to?: Date,
   page = 1,
   pageSize = PAGE_SIZE,
): Promise<Result<PaginatedBorrowLogs>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }

   try {
      const logsWithBorrower = await getCachedLogs(
         page,
         pageSize,
         idNumber,
         from,
         to,
      );
      return { ok: true, data: logsWithBorrower };
   } catch (e) {
      console.error("Error on getBorrowLogs()", e);
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

async function getCachedLogs(
   page: number,
   pageSize: number,
   idNumber?: string,
   from?: Date,
   to?: Date,
): Promise<PaginatedBorrowLogs> {
   "use cache: remote";
   cacheLife("days");

   const where = {
      idNumber,
      ...(from || to
         ? {
              date: {
                 gte: from,
                 lte: to,
              },
           }
         : {}),
   };
   const [total, logs] = await Promise.all([
      prisma.borrowLog.count({ where }),
      prisma.borrowLog.findMany({
         where,
         orderBy: [{ date: "desc" }, { id: "desc" }],
         skip: (page - 1) * pageSize,
         take: pageSize,
         include: { borrower: true },
      }),
   ]);

   return {
      total,
      logs,
   };
}
