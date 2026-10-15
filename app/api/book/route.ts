import { auth } from "@/lib/auth/auth";
import { fetchBook, normalizeIsbn } from "@/lib/fetchBook";
import { Result } from "@/lib/types";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
   req: NextRequest,
): Promise<NextResponse<Result<{ title: string; authors: string }>>> {
   const isbn = normalizeIsbn(req.nextUrl.searchParams.get("isbn") ?? "");
   if (!isbn)
      return NextResponse.json({
         ok: false,
         error: "VALIDATION",
         message: "Please provide an isbn in search params",
      });

   const session = await auth();
   if (!session?.user)
      return NextResponse.json({
         ok: false,
         error: "AUTH",
         message: "Unauthorized",
      });

   try {
      const data = await fetchBook(isbn);
      if (!data)
         return NextResponse.json({
            ok: false,
            error: "NOT_FOUND",
            message: "Not found",
         });

      return NextResponse.json({
         ok: true,
         data: { title: data.title, authors: data.authors },
      });
   } catch (e) {
      if (e instanceof AxiosError) {
         console.error(e);
         return NextResponse.json({
            ok: false,
            error: "OTHER",
            message: e.message,
         });
      }
      console.error(e);
      return NextResponse.json({
         ok: false,
         error: "OTHER",
         message: "Unexpected error",
      });
   }
}
