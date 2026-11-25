import FallbackRow from "@/components/table/fallbackRow";
import Table from "@/components/table/table";
import TableRow from "@/components/table/tableRow";
import { adminLoginPage, logsPage } from "@/constants";
import getLogs from "@/data-access-layer/borrowLogs";
import toPHDateString from "@/lib/toPHDateString";
import { endOfDay, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { File } from "lucide-react";
import Pagination from "./_components/Pagination";
import DeleteLogButton from "./_components/DeleteLogButton";
import { ToastContainer } from "react-toastify";
import Filter from "./_components/Filter";
import { Location } from "@/generated/prisma/enums";

export type SearchParameters = Promise<{
   idNumber?: string;
   from?: string;
   to?: string;
   page?: string;
   type?: string;
}>;

async function ComponentGenerator(
   searchParams: Awaited<SearchParameters>,
): Promise<[React.ReactNode, React.ReactNode]> {
   const { idNumber, page: pageParam, type } = searchParams;
   const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
   const now = toPHDateString();
   const logsWithBorrower = await getLogs(
      idNumber,
      startOfDay(now),
      endOfDay(now),
      [Location.CIRCULATION, Location.FILIPINIANA].find((l) => l === type),
      page,
   );
   if (!logsWithBorrower.ok) {
      if (logsWithBorrower.error === "AUTH") redirect(adminLoginPage);
      return [null, null];
   }

   return [
      <Pagination
         key={0}
         page={page}
         total={logsWithBorrower.data.total}
         filters={{ idNumber }}
      />,
      logsWithBorrower.data.logs.length === 0 ? (
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
      ) : (
         logsWithBorrower.data.logs.map((row, i) => (
            <TableRow
               key={i}
               index={i}
               data={[
                  toPHDateString(row.date),
                  row.bookBarcode,
                  row.scannedId || "VISITOR",
                  row.scannedId
                     ? row.borrower
                        ? `${row.borrower.firstname} ${row.borrower.middlename ? row.borrower.middlename + " " : ""}${row.borrower.lastname}`
                        : "[NO DATA]"
                     : "VISITOR",
                  row.scannedId
                     ? (row.borrower?.program ?? "[NO DATA]")
                     : "VISITOR",
                  row.scannedId
                     ? (row.borrower?.yearLevel ?? "[NO DATA]")
                     : "VISITOR",
                  row.scannedId
                     ? (row.borrower?.college ?? "[NO DATA]")
                     : "VISITOR",
                  <>
                     <DeleteLogButton logId={row.id} />
                  </>,
               ]}
            />
         ))
      ),
   ];
}

async function Suspended({ searchParams }: { searchParams: SearchParameters }) {
   const awaitedSearchParams = await searchParams;
   const components = await ComponentGenerator(awaitedSearchParams);

   return (
      <>
         <Filter
            from={awaitedSearchParams.from}
            to={awaitedSearchParams.to}
            idNumber={awaitedSearchParams.idNumber}
            type={awaitedSearchParams.type}
         />
         <div className="overflow-x-auto">
            <Table
               headers={[
                  "Date",
                  "Book Barcode",
                  "ID-NUMBER",
                  "Name",
                  "Program",
                  "Year",
                  "College",
                  "Action",
               ]}
               extraStyling="min-w-230"
            >
               {components[1]}
            </Table>
         </div>
         {components[0]}
      </>
   );
}

export default async function Logs({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <>
         <Suspense
            fallback={
               <div className="overflow-x-auto">
                  <Table
                     headers={[
                        "Date",
                        "Book Barcode",
                        "ID-NUMBER",
                        "Name",
                        "Program",
                        "Year",
                        "College",
                     ]}
                     extraStyling="min-w-230"
                  >
                     <FallbackRow />
                  </Table>
               </div>
            }
         >
            <Suspended searchParams={searchParams} />
         </Suspense>
         {/* Toast container for this page */}
         <ToastContainer
            containerId={logsPage}
            position="bottom-right"
            closeButton={false}
         />
      </>
   );
}
