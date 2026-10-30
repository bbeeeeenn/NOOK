import { Prisma } from "@/generated/prisma/client";
import { BookRecordModel } from "@/generated/prisma/models";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { logsPage } from "@/constants";
import type { Result } from "@/types/types";

export const BOOKS_PAGE_SIZE = 20;

type PaginatedBooks = {
   books: BookRecordModel[];
   total: number;
};

export async function getBookRecords(
   copyCode?: string,
   callnumber?: string,
   title?: string,
   author?: string,
   sublocation?: string,
   circulationType?: string,
   page = 1,
   pageSize = BOOKS_PAGE_SIZE,
): Promise<Result<PaginatedBooks>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }
   if (session.user.userType !== "Admin") {
      redirect(logsPage);
   }

   try {
      const records = await getCachedBookRecords(
         copyCode,
         callnumber,
         title,
         author,
         sublocation,
         circulationType,
         page,
         pageSize,
      );
      return { ok: true, data: records };
   } catch (error) {
      console.error("Error on getBookRecords()", error);
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

async function getCachedBookRecords(
   copyCode?: string,
   callnumber?: string,
   title?: string,
   author?: string,
   sublocation?: string,
   circulationType?: string,
   page = 1,
   pageSize = BOOKS_PAGE_SIZE,
): Promise<PaginatedBooks> {
   "use cache: remote";
   cacheLife("days");

   const where = {
      copyCode: copyCode
         ? { contains: copyCode, mode: "insensitive" as const }
         : undefined,
      callnumber: callnumber
         ? { contains: callnumber, mode: "insensitive" as const }
         : undefined,
      title: title
         ? { contains: title, mode: "insensitive" as const }
         : undefined,
      author: author
         ? { contains: author, mode: "insensitive" as const }
         : undefined,
      sublocation: sublocation
         ? { contains: sublocation, mode: "insensitive" as const }
         : undefined,
      circulationType: circulationType
         ? { contains: circulationType, mode: "insensitive" as const }
         : undefined,
   };

   const [total, books] = await Promise.all([
      prisma.bookRecord.count({ where }),
      prisma.bookRecord.findMany({
         where,
         skip: (page - 1) * pageSize,
         take: pageSize,
         orderBy: [{ copyCode: "asc" }],
      }),
   ]);

   return { books, total };
}

export async function getBookRecordsCount(): Promise<Result<number>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }
   if (session.user.userType !== "Admin") {
      redirect(logsPage);
   }

   try {
      const count = await getCachedBookRecordsCount();
      return { ok: true, data: count };
   } catch (error) {
      console.error("Error on getBookRecordsCount()", error);
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

async function getCachedBookRecordsCount() {
   "use cache: remote";
   cacheLife("days");

   return prisma.bookRecord.count();
}
