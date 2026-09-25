"use server";
import { configurationsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { getSheetService } from "@/lib/googlesheetsapi";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { GaxiosError } from "gaxios";
import { revalidatePath } from "next/cache";

export default async function setSheetIdAction(
   id: string,
): Promise<Result<{ id: string }>> {
   const newSpreadsheetId = id.trim();
   if (!newSpreadsheetId) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Please provide an id",
      };
   }

   const session = await auth();
   if (!session?.user) {
      return { ok: false, error: "AUTH", message: "Not authenticated" };
   }

   try {
      // Test the sheet
      const testRange = "A1";

      const sheetsService = getSheetService(session);
      const existing = await sheetsService.spreadsheets.values.get({
         spreadsheetId: newSpreadsheetId,
         range: testRange,
      });
      const originalValue = existing.data.values?.[0]?.[0] ?? "";

      // Attempt the write
      await sheetsService.spreadsheets.values.update({
         spreadsheetId: newSpreadsheetId,
         range: testRange,
         valueInputOption: "RAW",
         requestBody: { values: [[originalValue]] },
      });

      await prisma.configuration.upsert({
         where: { adminAccountId: session.user.id },
         update: { spreadsheetId: newSpreadsheetId },
         create: {
            spreadsheetId: newSpreadsheetId,
            adminAccountId: session.user.id,
         },
      });

      revalidatePath(configurationsPage);

      return {
         ok: true,
         data: {
            id: newSpreadsheetId,
         },
      };
   } catch (err) {
      if (err instanceof GaxiosError) {
         const status = err.response?.status;
         const message = err.response?.data?.error?.message ?? err.message;

         switch (status) {
            case 403:
               return {
                  ok: false,
                  error: "FORBIDDEN",
                  message:
                     "Permission denied — share the sheet with the service account email and grant it Editor access",
               };
            case 404:
               return {
                  ok: false,
                  error: "NOT_FOUND",
                  message: "Sheet not found — check the Sheet ID",
               };
            case 429:
               return {
                  ok: false,
                  error: "RATE_LIMITED",
                  message: "Rate limit exceeded — try again shortly",
               };
            default:
               return {
                  ok: false,
                  error: "OTHER",
                  message: `Google Sheets API error: ${message}`,
               };
         }
      }

      console.error("Unexpected error setting Sheet ID:", err);
      return { ok: false, error: "OTHER", message: "Something went wrong" };
   }
}
