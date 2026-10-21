import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Result } from "@/types/types";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
   req: NextRequest,
): Promise<NextResponse<Result<{ title: string; authors: string }>>> {
   const bookCode = req.nextUrl.searchParams.get("code")?.trim();
   if (!bookCode)
      return NextResponse.json(
         {
            ok: false,
            error: "VALIDATION",
            message: "Please provide the book's barcode in search params",
         },
         { status: 400 },
      );

   const session = await auth();
   if (!session?.user)
      return NextResponse.json(
         {
            ok: false,
            error: "AUTH",
            message: "Unauthorized",
         },
         { status: 401 },
      );

   try {
      const data = await getBook(bookCode);
      if (!data)
         return NextResponse.json(
            {
               ok: false,
               error: "NOT_FOUND",
               message: "Not found",
            },
            { status: 404 },
         );

      return NextResponse.json({
         ok: true,
         data: { title: data.title, authors: data.author },
      });
   } catch (e) {
      console.error(e);
      return NextResponse.json(
         {
            ok: false,
            error: "DATABASE",
            message: "Unexpected error",
         },
         { status: 500 },
      );
   }
}

async function getBook(bookCode: string) {
   "use cache: remote";
   cacheLife("days");
   cacheTag(`book:${bookCode}`);

   return prisma.bookRecord.findUnique({
      where: { copyCode: bookCode },
      select: { title: true, author: true },
   });
}

export function updateBookCache(bookCode: string) {
   updateTag(`book:${bookCode}`);
}
