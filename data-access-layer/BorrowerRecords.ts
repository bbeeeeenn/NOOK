import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { cacheLife } from "next/cache";
import type { Result } from "@/types/types";
import { BorrowerRecordModel } from "@/generated/prisma/models";
import { redirect } from "next/navigation";
import { logsPage } from "@/constants";

export const BORROWERS_PAGE_SIZE = 20;

type PaginatedBorrowers = {
   borrowers: BorrowerRecordModel[];
   total: number;
};

export async function getBorrowerRecords(
   idNumber?: string,
   name?: string,
   program?: string,
   college?: string,
   page = 1,
   pageSize = BORROWERS_PAGE_SIZE,
): Promise<Result<PaginatedBorrowers>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }
   if (session.user.userType !== "Admin") {
      redirect(logsPage);
   }

   try {
      const records = await getCachedBorrowerRecords(
         idNumber,
         name,
         program,
         college,
         page,
         pageSize,
      );
      return { ok: true, data: records };
   } catch (e) {
      console.error("Error on getStudentRecords()", e);
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

async function getCachedBorrowerRecords(
   idNumber?: string,
   name?: string,
   program?: string,
   college?: string,
   page = 1,
   pageSize = BORROWERS_PAGE_SIZE,
): Promise<PaginatedBorrowers> {
   "use cache: remote";
   cacheLife("days");

   const where = {
      idNumber,
      name: name ? { contains: name, mode: "insensitive" as const } : undefined,
      program,
      college,
   };

   const [total, borrowers] = await Promise.all([
      prisma.borrowerRecord.count({ where }),
      prisma.borrowerRecord.findMany({
         where,
         skip: (page - 1) * pageSize,
         take: pageSize,
         orderBy: [{ idNumber: "asc" }],
      }),
   ]);

   return { borrowers, total };
}

export async function getBorrowerRecordsCount(): Promise<Result<number>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }
   try {
      const count = await getCachedBorrowerRecordsCount();
      return { ok: true, data: count };
   } catch (e) {
      console.error("Error on getBorrowerRecordsCount()", e);
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

async function getCachedBorrowerRecordsCount() {
   "use cache: remote";
   cacheLife("days");

   return await prisma.borrowerRecord.count();
}
