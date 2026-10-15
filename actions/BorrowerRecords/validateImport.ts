"use server";

import {
   type BorrowerImportError,
   type BorrowerImportRow,
   validateBorrowerWorkbook,
} from "@/lib/borrower-import";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Result } from "@/lib/types";

const MAX_ERROR_DETAILS = 1_000;
const ID_QUERY_BATCH_SIZE = 1_000;
const IMPORT_TOKEN_TTL_MS = 15 * 60 * 1000;

export type BorrowerImportValidationResult = {
   filename: string;
   importToken?: string;
   totalRows: number;
   insertCount: number;
   updateCount: number;
   firstRows: BorrowerImportRow[];
   lastRows: BorrowerImportRow[];
   errors: BorrowerImportError[];
   errorCount: number;
};

export default async function validateBorrowerImport(
   formData: FormData,
): Promise<Result<BorrowerImportValidationResult>> {
   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Unauthorized" };
   }
   if (session.user.userType !== "Admin") {
      return { ok: false, error: "FORBIDDEN", message: "Admin access required" };
   }

   const file = formData.get("file");
   if (!(file instanceof File)) {
      return { ok: false, error: "VALIDATION", message: "Please select an XLSX file" };
   }

   if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Only .xlsx files are supported",
      };
   }

   try {
      const validation = validateBorrowerWorkbook(await file.arrayBuffer());
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

      const existingIds = new Set<string>();
      for (
         let offset = 0;
         offset < validation.rows.length;
         offset += ID_QUERY_BATCH_SIZE
      ) {
         const batch = validation.rows.slice(
            offset,
            offset + ID_QUERY_BATCH_SIZE,
         );
         const existing = await prisma.borrowerRecord.findMany({
            where: { idNumber: { in: batch.map((row) => row.idNumber) } },
            select: { idNumber: true },
         });
         for (const record of existing) existingIds.add(record.idNumber);
      }

      const updateCount = existingIds.size;
      const importJob = await prisma.borrowerImport.create({
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
      console.error("Error validating borrower import", error);
      return {
         ok: false,
         error: "VALIDATION",
         message:
            error instanceof Error
               ? `Unable to read the workbook: ${error.message}`
               : "Unable to read the workbook",
      };
   }
}
