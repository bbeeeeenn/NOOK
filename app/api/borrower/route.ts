import { BorrowerRecordGetPayload } from "@/generated/prisma/models";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
   req: NextRequest,
): Promise<
   NextResponse<
      Result<
         BorrowerRecordGetPayload<{ omit: { gender: true; idNumber: true } }>
      >
   >
> {
   const idNumberQuery = req.nextUrl.searchParams.get("idNumber")?.trim();
   if (!idNumberQuery)
      return NextResponse.json({
         ok: false,
         error: "VALIDATION",
         message: "Please provide an ID number in search params",
      }, { status: 400 });

   const session = await auth();
   if (!session?.user) {
      return NextResponse.json({
         ok: false,
         error: "AUTH",
         message: "Unauthorized",
      }, { status: 401 });
   }

   try {
      const borrower = await getBorrower(idNumberQuery);
      if (!borrower)
         return NextResponse.json({
            ok: false,
            error: "NOT_FOUND",
            message: "Borrower record not found",
         }, { status: 404 });

      const { firstname, middlename, lastname, yearLevel, program, college } =
         borrower;

      return NextResponse.json({
         ok: true,
         data: { firstname, middlename, lastname, yearLevel, program, college },
      });
   } catch (e) {
      console.error(e);
      return NextResponse.json({
         ok: false,
         error: "DATABASE",
         message: "Unexpected error",
      }, { status: 500 });
   }
}

async function getBorrower(idNumberQuery: string) {
   "use cache: remote";
   cacheLife("days");
   cacheTag(`borrower:${idNumberQuery}`);

   const borrower = await prisma.borrowerRecord.findUnique({
      where: { idNumber: idNumberQuery },
   });

   return borrower;
}

export function updateBorrowerCache(idNumberQuery: string) {
   updateTag(`borrower:${idNumberQuery}`);
}
