"use server";

import { borrowerRecordsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";
import registerPendingBorrower from "../PendingRegistration/registerPendingBorrower";

export default async function addBorrowerRecord(
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
      const pendingRegistration = await prisma.pendingBorrowLog.findMany({
         where: { idNumber: idNumber.trim() },
      });
      if (pendingRegistration.length > 0)
         return await registerPendingBorrower(
            idNumber,
            name,
            yearLevel,
            program,
            college,
         );
      const newRecord = await prisma.borrower.create({
         data: {
            idNumber: idNumber.trim(),
            name: name.trim(),
            yearLevel: program === "INSTRUCTOR" ? 0 : yearLevel,
            program,
            college,
         },
         select: { idNumber: true },
      });

      revalidatePath(borrowerRecordsPage);
      return { ok: true, data: { message: `Created ${newRecord.idNumber}` } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
         if (e.code === "P2002")
            return {
               ok: false,
               error: "AUTH",
               message: "Record with that ID Number already exists",
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
