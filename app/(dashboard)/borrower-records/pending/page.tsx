import FallbackRow from "@/components/table/fallbackRow";
import Table from "@/components/table/table";
import { adminLoginPage } from "@/constants";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { File } from "lucide-react";
import { getPendingBorrowerRecords } from "@/data-access-layer/PendingBorrowerRecords";
import PendingBorrowerRows from "./PendingBorrowerRows";

async function Suspended() {
   const pendingRecords = await getPendingBorrowerRecords();
   if (!pendingRecords.ok) {
      if (pendingRecords.error === "AUTH") redirect(adminLoginPage);
      return <>Error</>;
   }
   if (pendingRecords.data.length === 0)
      return (
         <tr>
            <td colSpan={10} className="py-4">
               <div className="mx-auto flex w-fit items-center gap-1 font-medium">
                  <span>
                     <File size={15} />
                  </span>
                  Empty
               </div>
            </td>
         </tr>
      );
   return <PendingBorrowerRows pendingRecords={pendingRecords.data} />;
}

export default function PendingRegistrationPage() {
   return (
      <div className="mt-2 overflow-x-auto">
         <Table
            headers={["ID-Number", "Times borrowed", "Action"]}
            extraStyling="min-w-150"
         >
            <Suspense fallback={<FallbackRow />}>
               <Suspended />
            </Suspense>
         </Table>
      </div>
   );
}
