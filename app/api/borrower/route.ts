import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/lib/types";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type BorrowerInfo = {
   name: string;
   yearLevel: number;
   program: string;
   college: string;
};

export async function GET(
   req: NextRequest,
): Promise<NextResponse<Result<BorrowerInfo>>> {
   const idNumberQuery = req.nextUrl.searchParams.get("idNumber");
   if (!idNumberQuery)
      return NextResponse.json({
         ok: false,
         error: "VALIDATION",
         message: "Please provide an idNumber in search params",
      });

   const session = await auth();
   if (!session?.user) {
      return NextResponse.json({
         ok: false,
         error: "AUTH",
         message: "Unauthorized",
      });
   }

   try {
      const borrower = await getBorrower(idNumberQuery);
      if (!borrower)
         return NextResponse.json({
            ok: false,
            error: "NOT_FOUND",
            message: "Record not found",
         });

      const { name, yearLevel, program, college } = borrower;

      return NextResponse.json({
         ok: true,
         data: { name, yearLevel, program, college },
      });
   } catch (e) {
      console.error(e);
      return NextResponse.json({
         ok: false,
         error: "OTHER",
         message: "Unexpected error",
      });
   }
}

async function getBorrower(idNumberQuery: string) {
   "use cache: remote";
   cacheLife("days");
   cacheTag(`borrower:${idNumberQuery}`);

   const borrower = await prisma.borrower.findUnique({
      where: { idNumber: idNumberQuery },
   });

   return borrower;
}

export function updateBorrowerCache(idNumberQuery: string) {
   updateTag(`borrower:${idNumberQuery}`);
}
