/*
   Validates an XLSX workbook and creates a short-lived import job.
*/

"use server";

import {
   type BookImportError,
   type BookImportRow,
   validateBookWorkbook,
} from "@/lib/book-import";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Result } from "@/types/types";

const MAX_ERROR_DETAILS = 1_000;
const IMPORT_TOKEN_TTL_MS = 15 * 60 * 1000;

export type BookImportValidationResult = {
   filename: string;
   importToken?: string;
   totalRows: number;
   insertCount: number;
   updateCount: number;
   firstRows: BookImportRow[];
   lastRows: BookImportRow[];
   errors: BookImportError[];
   errorCount: number;
};

export default async function validateBookImport(
   formData: FormData,
): Promise<Result<BookImportValidationResult>> {
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

   const file = formData.get("file");
   if (!(file instanceof File)) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Please select an XLSX file",
      };
   }
   if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Only .xlsx files are supported",
      };
   }

   let validation: ReturnType<typeof validateBookWorkbook>;
   try {
      validation = validateBookWorkbook(await file.arrayBuffer());
   } catch (error) {
      console.error("Error reading book import workbook", error);
      return {
         ok: false,
         error: "VALIDATION",
         message:
            error instanceof Error
               ? `Unable to read the workbook: ${error.message}`
               : "Unable to read the workbook",
      };
   }

   try {
      await prisma.bookImport.deleteMany({
         where: {
            OR: [
               { consumedAt: { not: null } },
               { expiresAt: { lte: new Date() } },
            ],
         },
      });

      const errors = validation.errors.slice(0, MAX_ERROR_DETAILS);

      if (validation.errorCount > 0) {
         return {
            ok: true,
            data: {
               filename: file.name,
               totalRows: validation.totalRows,
               insertCount: 0,
               updateCount: 0,
               firstRows: validation.firstRows,
               lastRows: validation.lastRows,
               errors,
               errorCount: validation.errorCount,
            },
         };
      }

      const copyCodes = validation.rows.map((row) => row.copyCode);
      const existingCount =
         copyCodes.length === 0
            ? 0
            : await prisma.bookRecord.count({
                 where: { copyCode: { in: copyCodes } },
              });
      const updateCount = existingCount;
      const importJob = await prisma.bookImport.create({
         data: {
            filename: file.name,
            rows: validation.rows,
            totalRows: validation.totalRows,
            insertCount: validation.rows.length - updateCount,
            updateCount,
            expiresAt: new Date(Date.now() + IMPORT_TOKEN_TTL_MS),
            createdById: session.user.id,
         },
         select: { id: true },
      });

      return {
         ok: true,
         data: {
            filename: file.name,
            importToken: importJob.id,
            totalRows: validation.totalRows,
            insertCount: validation.rows.length - updateCount,
            updateCount,
            firstRows: validation.firstRows,
            lastRows: validation.lastRows,
            errors,
            errorCount: validation.errorCount,
         },
      };
   } catch (error) {
      console.error("Error staging book import", error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to validate the workbook due to a database error",
      };
   }
}
