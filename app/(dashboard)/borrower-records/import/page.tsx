import { logsPage } from "@/constants";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ImportForm from "./ImportForm";

function ImportFormSkeleton() {
   return (
      <div
         className="flex animate-pulse flex-col gap-5"
         aria-busy="true"
         aria-label="Loading borrower import form"
      >
         <div className="space-y-2">
            <div className="h-7 w-56 rounded bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-200" />
         </div>
         <div className="flex flex-col gap-4 rounded-md border border-black/20 bg-white p-5">
            <div className="h-5 w-20 rounded bg-gray-200" />
            <div className="h-11 w-full rounded-md bg-gray-200" />
            <div className="h-4 w-72 max-w-full rounded bg-gray-200" />
            <div className="flex flex-wrap gap-3">
               <div className="h-10 w-40 rounded-md bg-gray-200" />
               <div className="h-10 w-36 rounded-md bg-gray-200" />
            </div>
         </div>
      </div>
   );
}

async function Suspended() {
   const session = await auth();
   if (session?.user.userType !== "Admin") redirect(logsPage);

   return <ImportForm />;
}
export default function ImportPage() {
   return (
      <Suspense fallback={<ImportFormSkeleton />}>
         <Suspended />
      </Suspense>
   );
}
