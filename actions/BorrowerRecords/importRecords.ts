"use server";

import { borrowerRecordsPage, importBorrowerRecordsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { sheetsService } from "@/lib/googlesheetsapi";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import {
   PrismaClientKnownRequestError,
   PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import { GaxiosError } from "gaxios";
import { revalidatePath } from "next/cache";

import { DatabaseError, Pool } from "pg";
import { pipeline } from "stream/promises";
import { from as copyFrom } from "pg-copy-streams";
import { Readable } from "stream";
import cuid from "cuid";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function importRecords(
   sheetName: string,
   range: string,
): Promise<Result<{ message: string }>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   const user = await prisma.adminAccount.findUnique({
      where: { id: session.user.id },
      select: { id: true, configuration: { select: { spreadsheetId: true } } },
   });
   if (!user?.configuration)
      return {
         ok: false,
         error: "NOT_FOUND",
         message: "Please provide a spreadsheet ID before continuing.",
      };

   const client = await pool.connect(); // initialize the client

   try {
      const pendingRegistrationCount = await prisma.pendingBorrowLog.count();
      if (pendingRegistrationCount > 0)
         return {
            ok: false,
            error: "VALIDATION",
            message:
               "Please clear the pending registrations before continuing.",
         };

      const res = await sheetsService.spreadsheets.values.get({
         spreadsheetId: user.configuration.spreadsheetId!,
         range: `${sheetName}!${range}`,
      });

      const rows = res.data.values ?? [];
      if (rows.length === 0)
         return { ok: true, data: { message: "No records to sync" } };

      const records = rows.map((row) => ({
         id: cuid(), // only used if the borrower doesn't already exist
         idNumber: row[0],
         name: row[1],
         yearLevel: parseInt(row[2], 10),
         program: row[3],
         college: row[4],
      }));

      await client.query("BEGIN");

      await client.query(`
         CREATE TEMP TABLE staging_borrower (
            id TEXT,
            "idNumber" TEXT,
            name TEXT,
            "yearLevel" INT,
            program TEXT,
            college TEXT
         ) ON COMMIT DROP
      `);

      const copyStream = client.query(
         copyFrom(`COPY staging_borrower FROM STDIN WITH (FORMAT csv)`),
      );

      const csvData = records
         .map((r) =>
            [r.id, r.idNumber, r.name, r.yearLevel, r.program, r.college]
               .map(csvEscape)
               .join(","),
         )
         .join("\n");

      await pipeline(Readable.from([csvData]), copyStream);

      const result = await client.query(`
         INSERT INTO "Borrower" (id, "idNumber", name, "yearLevel", program, college)
         SELECT id, "idNumber", name, "yearLevel", program, college FROM staging_borrower
         ON CONFLICT ("idNumber") DO UPDATE SET
            name = EXCLUDED.name,
            "yearLevel" = EXCLUDED."yearLevel",
            program = EXCLUDED.program,
            college = EXCLUDED.college
      `);

      await client.query("COMMIT");

      revalidatePath(borrowerRecordsPage);
      revalidatePath(importBorrowerRecordsPage);
      return {
         ok: true,
         data: { message: `Synced ${result.rowCount ?? 0} records` },
      };
   } catch (err) {
      await client.query("ROLLBACK");

      if (err instanceof PrismaClientKnownRequestError) {
         console.error(err);
         return {
            ok: false,
            error: "DATABASE",
            message: `Database error: ${err.code}`,
         };
      }
      if (err instanceof PrismaClientValidationError) {
         return {
            ok: false,
            error: "DATABASE",
            message:
               "Couldn't import records. Check that the sheet name and range are correct and valid.",
         };
      }
      if (err instanceof GaxiosError) {
         const status = err.response?.status;
         if (status === 400) {
            return {
               ok: false,
               error: "VALIDATION",
               message:
                  "Couldn't sync records. Check that the sheet name and range are correct and valid.",
            };
         }
         if (status === 404) {
            return {
               ok: false,
               error: "NOT_FOUND",
               message: "Spreadsheet or range doesn't exist",
            };
         }
         if (status === 403) {
            return {
               ok: false,
               error: "FORBIDDEN",
               message: "Service account doesn't have access to this sheet",
            };
         }
         if (status === 429) {
            return {
               ok: false,
               error: "RATE_LIMITED",
               message: "Too many requests",
            };
         }

         console.error("Sheets API error:", status, err.response?.data);
         return { ok: false, error: "OTHER", message: err.message };
      }

      // raw postgres errors from pg/pg-copy-streams — these don't come through
      // as prisma error classes since this path bypasses prisma client
      if (err instanceof DatabaseError) {
         console.error("Postgres error:", err.code, err.message);
         if (err.code === "23505") {
            return {
               ok: false,
               error: "VALIDATION",
               message: "Duplicate idNumber found in the sheet data",
            };
         }
         if (err.code === "22P02" || err.code === "23502") {
            return {
               ok: false,
               error: "VALIDATION",
               message:
                  "Some rows have missing or invalid values (check yearLevel and required columns)",
            };
         }
         return {
            ok: false,
            error: "DATABASE",
            message: "Database error while importing records",
         };
      }

      console.error(err);
      return { ok: false, error: "OTHER", message: "Internal server error" };
   } finally {
      client.release();
   }
}

function csvEscape(val: unknown): string {
   const s = String(val ?? "");
   if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
   }
   return s;
}
