"use server";

import { borrowerRecordsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function deleteBorrowerRecord(
   id: string,
): Promise<Result<{ message: string }>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   try {
      const newRecord = await prisma.borrower.delete({
         where: { id },
         select: { idNumber: true },
      });

      revalidatePath(borrowerRecordsPage);
      return { ok: true, data: { message: `Deleted ${newRecord.idNumber}` } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
         if (e.code === "P2025")
            return {
               ok: false,
               error: "NOT_FOUND",
               message: "Borrower record with such id not found",
            };
         if (e.code === "P2003") {
            return {
               ok: false,
               error: "CONFLICT",
               message:
                  "This record can't be deleted because it has connected logs",
            };
         }
         console.error(e);
         return {
            ok: false,
            error: "DATABASE",
            message: `Database error: ${e.code}`,
         };
      }
      console.error(e);
      return { ok: false, error: "OTHER", message: "Unexpected error occured" };
   }
}
