"use server";

import { updateBorrowerCache } from "@/app/api/borrower/route";
import { borrowerRecordsPage, logsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function editBorrowerRecord(
   id: string,
   idNumber: string,
   name: string,
   yearLevel: number,
   program: string,
   college: string,
): Promise<Result<{ message: string }>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   try {
      const newRecord = await prisma.borrower.update({
         where: { id },
         data: {
            idNumber,
            name,
            yearLevel,
            program,
            college,
         },
         select: { idNumber: true },
      });

      revalidatePath(borrowerRecordsPage);
      revalidatePath(logsPage);
      updateBorrowerCache(newRecord.idNumber);
      return { ok: true, data: { message: `Updated ${newRecord.idNumber}` } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
         if (e.code === "P2025")
            return {
               ok: false,
               error: "AUTH",
               message: "Borrower record with such id not found",
            };
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
