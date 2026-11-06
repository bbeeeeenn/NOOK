import { PillTabContainer } from "@/components/pill-tab/container";
import { Pill } from "@/components/pill-tab/pill";
import { allLogsPage, logsPage } from "@/constants";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
   return (
      <div className="p-3 pb-5">
         <PillTabContainer cols={3}>
            <Pill targetRoute={logsPage} label="Today" />
            <Pill targetRoute={allLogsPage} label="All" />
         </PillTabContainer>
         {children}
      </div>
   );
}
