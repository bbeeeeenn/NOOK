"use server";

import {
   borrowerRecordsPage,
   importBorrowerRecordsPage,
   logsPage,
} from "@/constants";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import type { Result } from "@/lib/types";
import { revalidatePath } from "next/cache";

type ImportRow = {
   idNumber: string;
   firstname: string;
   middlename: string;
   lastname: string;
   gender: "MALE" | "FEMALE";
   college: string;
   program: string;
   yearLevel: number;
};

export type BorrowerImportResult = {
   filename: string;
   totalRows: number;
   insertCount: number;
   updateCount: number;
   linkedBorrowLogs: number;
};

export default async function confirmBorrowerImport(
   importToken: string,
): Promise<Result<BorrowerImportResult>> {
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
      const importJob = await prisma.borrowerImport.findFirst({
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

      const rows = importJob.rows as unknown;
      if (!Array.isArray(rows)) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Import data is invalid; please upload the file again",
         };
      }

      let linkedBorrowLogs = 0;
      await prisma.$transaction(
         async (transaction) => {
         const claim = await transaction.borrowerImport.updateMany({
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

         const importRows = rows as ImportRow[];
         const batchSize = 500;
         for (let offset = 0; offset < importRows.length; offset += batchSize) {
            const batch = importRows.slice(offset, offset + batchSize);
            await transaction.$executeRaw(Prisma.sql`
               INSERT INTO "BorrowerRecord"
                  ("idNumber", "firstname", "middlename", "lastname", "yearLevel", "program", "college", "gender")
               VALUES ${Prisma.join(
                  batch.map(
                     (row) => Prisma.sql`(
                        ${row.idNumber},
                        ${row.firstname},
                        ${row.middlename || null},
                        ${row.lastname},
                        ${row.yearLevel},
                        ${row.program},
                        ${row.college},
                        ${row.gender}::"Gender"
                     )`,
                  ),
               )}
               ON CONFLICT ("idNumber") DO UPDATE SET
                  "firstname" = EXCLUDED."firstname",
                  "middlename" = EXCLUDED."middlename",
                  "lastname" = EXCLUDED."lastname",
                  "yearLevel" = EXCLUDED."yearLevel",
                  "program" = EXCLUDED."program",
                  "college" = EXCLUDED."college",
                  "gender" = EXCLUDED."gender"
            `);
         }

         linkedBorrowLogs = await transaction.$executeRaw(Prisma.sql`
            UPDATE "BorrowLog" AS logs
            SET "idNumber" = borrowers."idNumber"
            FROM "BorrowerRecord" AS borrowers
            WHERE logs."idNumber" IS NULL
              AND logs."scannedId" IS NOT NULL
              AND logs."scannedId" = borrowers."idNumber"
              AND borrowers."idNumber" = ANY(
                 ARRAY[${Prisma.join(importRows.map((row) => row.idNumber))}]::text[]
              )
         `);

         await transaction.borrowerImportAudit.create({
            data: {
               filename: importJob.filename,
               totalRows: importJob.totalRows,
               insertCount: importJob.insertCount,
               updateCount: importJob.updateCount,
               status: "SUCCESS",
               details: `Linked ${linkedBorrowLogs} orphaned borrow logs by scannedId`,
               createdById: session.user.id,
            },
         });
         await transaction.borrowerImport.delete({
            where: { id: importJob.id },
         });
         },
         {
            maxWait: 10_000,
            timeout: 120_000,
         },
      );

      revalidatePath(borrowerRecordsPage);
      revalidatePath(importBorrowerRecordsPage);
      revalidatePath(logsPage);
      return {
         ok: true,
         data: {
            filename: importJob.filename,
            totalRows: importJob.totalRows,
            insertCount: importJob.insertCount,
            updateCount: importJob.updateCount,
            linkedBorrowLogs,
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
      console.error("Error confirming borrower import", error);
      return {
         ok: false,
         error: "DATABASE",
         message: "The import failed and no records were changed",
      };
   }
}
