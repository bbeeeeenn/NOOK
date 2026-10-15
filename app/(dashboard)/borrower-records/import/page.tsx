import { logsPage } from "@/constants";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Suspended() {
   const session = await auth();
   if (session?.user.userType !== "Admin") redirect(logsPage);

   return <></>;
}
export default function ImportPage() {
   return (
      <Suspense>
         <Suspended />
      </Suspense>
   );
}
