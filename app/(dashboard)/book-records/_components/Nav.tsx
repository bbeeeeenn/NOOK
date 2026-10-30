import { Suspense } from "react";
import { getBookRecordsCount } from "@/data-access-layer/bookRecords";
import { redirect } from "next/navigation";
import {
   adminLoginPage,
   bookRecordsPage,
   importBookRecordsPage,
} from "@/constants";
import { PillTabContainer } from "@/components/pill-tab/container";
import { Pill } from "@/components/pill-tab/pill";

async function AllBooksCount() {
   const bookCount = await getBookRecordsCount();
   if (!bookCount.ok) {
      if (bookCount.error === "AUTH") redirect(adminLoginPage);
      return null;
   }
   return <span className="opacity-80">{bookCount.data}</span>;
}

export default function Nav() {
   return (
      <PillTabContainer cols={2}>
         <Pill label="All" targetRoute={bookRecordsPage}>
            <Suspense>
               <AllBooksCount />
            </Suspense>
         </Pill>
         <Pill targetRoute={importBookRecordsPage} label="Import" />
      </PillTabContainer>
   );
}
