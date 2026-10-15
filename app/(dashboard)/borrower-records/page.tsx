import {
   BORROWERS_PAGE_SIZE,
   getBorrowerRecords,
} from "@/data-access-layer/BorrowerRecords";
import { adminLoginPage } from "@/constants";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DialogProvider } from "./_components/DialogProvider";
import BorrowerRows from "./_components/BorrowerRows";
import Table from "@/components/table/table";
import FallbackRow from "@/components/table/fallbackRow";
import { File } from "lucide-react";
import Filter from "./_components/Filter";
import Pagination from "./_components/Pagination";

type SearchParameters = Promise<{
   idNumber?: string;
   name?: string;
   program?: string;
   college?: string;
   page?: string;
   pageSize?: string;
}>;

async function Suspended({ searchParams }: { searchParams: SearchParameters }) {
   const { idNumber, name, program, college, page, pageSize } =
      await searchParams;
   const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
   const currentPageSize = pageSize
      ? Math.max(1, Number.parseInt(pageSize, 10) || BORROWERS_PAGE_SIZE)
      : BORROWERS_PAGE_SIZE;
   const res = await getBorrowerRecords(
      idNumber,
      name,
      program,
      college,
      currentPage,
      currentPageSize,
   );
   if (!res.ok) {
      if (res.error === "AUTH") redirect(adminLoginPage);
      return <>Error</>;
   }
   if (res.data.borrowers.length === 0)
      return (
         <tr>
            <td colSpan={10} className="py-2">
               <div className="mx-auto flex w-fit items-center gap-1 font-medium">
                  <span>
                     <File size={15} />
                  </span>
                  Empty
               </div>
            </td>
         </tr>
      );
   return (
      <BorrowerRows
         records={res.data.borrowers}
         startIndex={(currentPage - 1) * currentPageSize}
      />
   );
}

async function SuspendedPagination({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const { idNumber, name, program, college, page, pageSize } =
      await searchParams;
   const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
   const currentPageSize = pageSize
      ? Math.max(1, Number.parseInt(pageSize, 10) || BORROWERS_PAGE_SIZE)
      : BORROWERS_PAGE_SIZE;
   const res = await getBorrowerRecords(
      idNumber,
      name,
      program,
      college,
      currentPage,
      currentPageSize,
   );
   if (!res.ok) return null;

   return (
      <Pagination
         page={currentPage}
         pageSize={currentPageSize}
         total={res.data.total}
         filters={{ idNumber, name, program, college }}
      />
   );
}

async function SuspendedBorrowerRecords({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const { idNumber, name, program, college, pageSize } = await searchParams;

   return (
      <>
         <Filter
            key={JSON.stringify(await searchParams)}
            idNumber={idNumber}
            name={name}
            program={program}
            college={college}
            pageSize={pageSize}
         />
         <div className="overflow-x-auto">
            <Table
               headers={["ID", "Name", "Year", "College", "Program"]}
               extraStyling="min-w-150"
            >
               <Suspense fallback={<FallbackRow />}>
                  <Suspended searchParams={searchParams} />
               </Suspense>
            </Table>
         </div>
         <Suspense>
            <SuspendedPagination searchParams={searchParams} />
         </Suspense>
      </>
   );
}

export default async function BorrowerRecordsPage({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <DialogProvider>
         <Suspense
            fallback={
               <div className="overflow-x-auto">
                  <Table
                     headers={[
                        "No.",
                        "ID",
                        "Name",
                        "Program",
                        "Year",
                        "College",
                        "Action",
                     ]}
                     extraStyling="min-w-150"
                  >
                     <FallbackRow />
                  </Table>
               </div>
            }
         >
            <SuspendedBorrowerRecords searchParams={searchParams} />
         </Suspense>
      </DialogProvider>
   );
}
