/*
   Applies a validated BookImport job and records the result in its audit table.
*/

"use server";

import { bookRecordsPage, importBookRecordsPage } from "@/constants";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/auth";
import { BOOK_IMPORT_HEADERS, type BookImportRow } from "@/lib/book-import";
import { prisma } from "@/lib/prisma";
import type { Result } from "@/types/types";
import { revalidatePath } from "next/cache";

export type BookImportResult = {
   filename: string;
   totalRows: number;
   insertCount: number;
   updateCount: number;
};

function isBookImportRow(value: unknown): value is BookImportRow {
   if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
   }
   return BOOK_IMPORT_HEADERS.every((field) => {
      const fieldValue = (value as Record<string, unknown>)[field];
      return typeof fieldValue === "string" && fieldValue.trim().length > 0;
   });
}

export default async function confirmBookImport(
   importToken: string,
): Promise<Result<BookImportResult>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }
   if (session.user.userType !== "Admin") {
      return {
         ok: false,
         error: "FORBIDDEN",
         message: "Admin access required",
      };
   }
   if (!importToken) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Import token is required",
      };
   }

   try {
      const importJob = await prisma.bookImport.findFirst({
         where: {
            id: importToken,
            createdById: session.user.id,
            consumedAt: null,
         },
      });

      if (!importJob) {
         return {
            ok: false,
            error: "NOT_FOUND",
            message: "Import validation was not found or has already been used",
         };
      }
      if (importJob.expiresAt <= new Date()) {
         return {
            ok: false,
            error: "VALIDATION",
            message:
               "Import validation has expired; please upload the file again",
         };
      }

      const rows: unknown = importJob.rows;
      if (
         !Array.isArray(rows) ||
         rows.length !== importJob.totalRows ||
         !rows.every(isBookImportRow)
      ) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Import data is invalid; please upload the file again",
         };
      }

      await prisma.$transaction(
         async (transaction) => {
            const claim = await transaction.bookImport.updateMany({
               where: {
                  id: importJob.id,
                  consumedAt: null,
                  expiresAt: { gt: new Date() },
               },
               data: { consumedAt: new Date() },
            });
            if (claim.count !== 1) {
               throw new Error("IMPORT_ALREADY_CONSUMED");
            }

            const importRows = rows as BookImportRow[];
            const batchSize = 500;
            for (
               let offset = 0;
               offset < importRows.length;
               offset += batchSize
            ) {
               const batch = importRows.slice(offset, offset + batchSize);
               await transaction.$executeRaw(Prisma.sql`
                  INSERT INTO "BookRecord"
                     ("copyCode", "callnumber", "title", "author", "sublocation", "circulationType")
                  VALUES ${Prisma.join(
                     batch.map(
                        (row) => Prisma.sql`(
                           ${row.copyCode},
                           ${row.callnumber},
                           ${row.title},
                           ${row.author},
                           ${row.sublocation},
                           ${row.circulationType}
                        )`,
                     ),
                  )}
                  ON CONFLICT ("copyCode") DO UPDATE SET
                     "callnumber" = EXCLUDED."callnumber",
                     "title" = EXCLUDED."title",
                     "author" = EXCLUDED."author",
                     "sublocation" = EXCLUDED."sublocation",
                     "circulationType" = EXCLUDED."circulationType"
               `);
            }

            await transaction.bookImportAudit.create({
               data: {
                  filename: importJob.filename,
                  totalRows: importJob.totalRows,
                  insertCount: importJob.insertCount,
                  updateCount: importJob.updateCount,
                  status: "SUCCESS",
                  createdById: session.user.id,
               },
            });
            await transaction.bookImport.delete({
               where: { id: importJob.id },
            });
         },
         {
            maxWait: 10_000,
            timeout: 120_000,
         },
      );

      revalidatePath(bookRecordsPage);
      revalidatePath(importBookRecordsPage);
      return {
         ok: true,
         data: {
            filename: importJob.filename,
            totalRows: importJob.totalRows,
            insertCount: importJob.insertCount,
            updateCount: importJob.updateCount,
         },
      };
   } catch (error) {
      if (
         error instanceof Error &&
         error.message === "IMPORT_ALREADY_CONSUMED"
      ) {
         return {
            ok: false,
            error: "CONFLICT",
            message: "This import has already been confirmed",
         };
      }
      console.error("Error confirming book import", error);
      return {
         ok: false,
         error: "DATABASE",
         message: "The import failed and no records were changed",
      };
   }
}
