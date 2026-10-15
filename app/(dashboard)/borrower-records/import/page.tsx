import { logsPage } from "@/constants";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ImportForm from "./ImportForm";

async function Suspended() {
   const session = await auth();
   if (session?.user.userType !== "Admin") redirect(logsPage);

   return <ImportForm />;
}
export default function ImportPage() {
   return (
      <Suspense>
         <Suspended />
      </Suspense>
   );
}
