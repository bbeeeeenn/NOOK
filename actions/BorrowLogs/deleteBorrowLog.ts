"use server";

import { allLogsPage, logsPage } from "@/constants";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function deleteBorrowLog(
   logId: string,
): Promise<Result<{ message: string }>> {
   const session = await auth();
   if (!session?.user)
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   const normalizedLogId = logId.trim();
   if (!normalizedLogId)
      return {
         ok: false,
         error: "VALIDATION",
         message: "Log id is required",
      };

   try {
      const existingLog = await prisma.borrowLog.findUnique({
         where: { id: normalizedLogId },
      });

      if (!existingLog)
         return {
            ok: false,
            error: "NOT_FOUND",
            message: "Borrow log not found",
         };

      await prisma.borrowLog.delete({
         where: { id: normalizedLogId },
      });

      revalidatePath(logsPage);
      revalidatePath(allLogsPage);

      return {
         ok: true,
         data: { message: "Borrow log deleted successfully" },
      };
   } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
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
