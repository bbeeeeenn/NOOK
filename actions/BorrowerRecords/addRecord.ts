"use server";

import { borrowerRecordsPage } from "@/constants";
import { Gender } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function addBorrowerRecord(
   idNumber: string,
   name: string,
   yearLevel: number,
   program: string,
   college: string,
   gender: Gender,
): Promise<Result<{ message: string }>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   try {
      const newRecord = await prisma.borrowerRecord.create({
         data: {
            idNumber: idNumber.trim(),
            firstname: name.trim(),
            lastname: "",
            yearLevel: program === "INSTRUCTOR" ? 0 : yearLevel,
            program,
            college,
            gender,
         },
         select: { idNumber: true },
      });

      revalidatePath(borrowerRecordsPage);
      return { ok: true, data: { message: `Created ${newRecord.idNumber}` } };
   } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
         if (error.code === "P2002") {
            return {
               ok: false,
               error: "CONFLICT",
               message: "Record with that ID Number already exists",
            };
         }
         return {
            ok: false,
            error: "DATABASE",
            message: `Database error: ${error.code}`,
         };
      }
      console.error(error);
      return { ok: false, error: "OTHER", message: "Unexpected error occurred" };
   }
}
