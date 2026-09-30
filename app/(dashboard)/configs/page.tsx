import { AddSheetId } from "./_components/AddSheetId";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import getSpreadsheetId from "@/lib/getSpreadsheetId";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminLoginPage } from "@/constants";
import { ChevronRight, Loader } from "lucide-react";

async function Suspended() {
   const session = await auth();
   if (!session?.user) redirect(adminLoginPage);
   const currentSpreadsheetId = await getSpreadsheetId(session.user.id);

   return (
      <div className="p-7">
         <AddSheetId currentId={currentSpreadsheetId} />
         {currentSpreadsheetId && (
            <Link
               href={`https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}/edit`}
               target="_blank"
               className="font-inter mt-5 flex w-fit items-center gap-2 font-medium underline"
            >
               <Image
                  src={"/Google_Sheets_Logo.svg"}
                  alt=""
                  width={17}
                  height={20}
                  draggable={false}
               />
               Go to Google Sheets
               <span>
                  <ChevronRight size={20} />
               </span>
            </Link>
         )}
      </div>
   );
}

export default async function ConfigurationsPage() {
   return (
      <Suspense
         fallback={
            <div className="font-inter max-w-150 p-7 select-none">
               <div className="mb-2 flex items-center gap-2 text-xl font-medium text-gray-600">
                  <Image
                     src={"/Google_Sheets_Logo.svg"}
                     alt=""
                     width={17}
                     height={20}
                     draggable={false}
                  />
                  <span className="self-end">Google Sheet ID</span>
               </div>
               <Loader className="mt-4 animate-spin" size={20} />
            </div>
         }
      >
         <Suspended />
      </Suspense>
   );
}
