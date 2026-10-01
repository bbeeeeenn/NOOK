import { SidebarContextProvider } from "./_components/Sidebar/SidebarContextProvider";
import Sidebar from "./_components/Sidebar/Sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminLoginPage } from "@/constants";
import React, { Suspense } from "react";

async function Authenticate({ children }: { children: React.ReactNode }) {
   const session = await auth();
   if (!session?.user) {
      return redirect(adminLoginPage);
   }

   return (
      <SidebarContextProvider>
         <Sidebar>{children}</Sidebar>
      </SidebarContextProvider>
   );
}

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <Suspense>
         <Authenticate>{children}</Authenticate>
      </Suspense>
   );
}
