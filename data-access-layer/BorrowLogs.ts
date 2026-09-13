import { Prisma } from "@/generated/prisma/client";
import { BorrowLogGetPayload } from "@/generated/prisma/models";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";

export const LOGS_PAGE_SIZE = 20;

type BorrowLog = BorrowLogGetPayload<{
   include: { borrower: true };
}>;

export type PaginatedBorrowLogs = {
   logs: BorrowLog[];
   total: number;
};

export default async function getLogsWithBorrower(
   idNumber?: string,
   from?: Date,
   to?: Date,
   page = 1,
   pageSize = LOGS_PAGE_SIZE,
): Promise<Result<PaginatedBorrowLogs>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }

   try {
      const logsWithBorrower = await getCachedLogsWithBorrower(
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

async function getCachedLogsWithBorrower(
   page: number,
   pageSize: number,
   idNumber?: string,
   from?: Date,
   to?: Date,
): Promise<PaginatedBorrowLogs> {
   // "use cache";
   // cacheLife("days");

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
