"use server";

import { logsPage } from "@/constants";
import { PatronType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function createBorrowLog(
   bookBarcode: string,
   type: PatronType,
   scannedId?: string,
): Promise<Result<{ message: string }>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   const normalizedBookBarcode = bookBarcode.toUpperCase().trim() || undefined;
   const normalizedScannedId = scannedId?.toUpperCase().trim() || undefined;

   if (!normalizedBookBarcode)
      return {
         ok: false,
         error: "VALIDATION",
         message: "Book barcode is required",
      };

   try {
      const existingBookRecord = await prisma.bookRecord.findUnique({
         where: { copyCode: normalizedBookBarcode },
      });

      if (!existingBookRecord)
         return {
            ok: false,
            error: "NOT_FOUND",
            message: "Book record not found",
         };

      const existingBorrower = normalizedScannedId
         ? await prisma.borrowerRecord.findUnique({
              where: { idNumber: normalizedScannedId },
           })
         : null;

      await prisma.borrowLog.create({
         data: {
            bookBarcode: normalizedBookBarcode,
            scannedId: normalizedScannedId,
            idNumber: existingBorrower?.idNumber,
            type,
         },
      });

      revalidatePath(logsPage);

      return {
         ok: true,
         data: { message: "Borrow recorded successfully" },
      };
   } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
         if (error.code === "P2002")
            return {
               ok: false,
               error: "CONFLICT",
               message: "A database uniqueness conflict occurred",
            };

         console.error(error);
         return {
            ok: false,
            error: "DATABASE",
            message: `Database error: ${error.code}`,
         };
      }

      console.error(error);
      return {
         ok: false,
         error: "OTHER",
         message: "Unexpected error occurred",
      };
   }
}
