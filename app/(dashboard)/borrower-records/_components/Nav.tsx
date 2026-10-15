import { Suspense } from "react";
import { getBorrowerRecordsCount } from "@/data-access-layer/BorrowerRecords";
import { redirect } from "next/navigation";
import {
   adminLoginPage,
   borrowerRecordsPage,
   importBorrowerRecordsPage,
} from "@/constants";
import { PillTabContainer } from "@/components/pill-tab/container";
import { Pill } from "@/components/pill-tab/pill";

async function AllStudentsCount() {
   const studentCount = await getBorrowerRecordsCount();
   if (!studentCount.ok) {
      if (studentCount.error === "AUTH") redirect(adminLoginPage);
      return null;
   }
   return <span className="opacity-80">{studentCount.data}</span>;
}

export default function Nav() {
   return (
      <PillTabContainer cols={2}>
         <Pill label="All" targetRoute={borrowerRecordsPage}>
            <Suspense>
               <AllStudentsCount />
            </Suspense>
         </Pill>
         <Pill targetRoute={importBorrowerRecordsPage} label="Import" />
      </PillTabContainer>
   );
}
