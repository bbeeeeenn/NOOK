import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import {
   adminLoginPage,
   logsPage,
   scannerPage,
   settingsPage,
   borrowerRecordsPage,
} from "./constants";

const protectedRoutes = [
   logsPage,
   borrowerRecordsPage,
   scannerPage,
   settingsPage,
];

export default async function proxy(req: NextRequest) {
   const url = new URL(req.url);
   const pathname = req.nextUrl.pathname;

   if (protectedRoutes.some((pr) => pathname.includes(pr))) {
      const session = await auth();
      if (!session) {
         return NextResponse.redirect(new URL(adminLoginPage, req.url));
      }
   }

   return NextResponse.next({
      headers: {
         "x-pathname": url.pathname + url.search,
      },
   });
}
