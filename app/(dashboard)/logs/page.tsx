import FallbackRow from "@/components/table/fallbackRow";
import Table from "@/components/table/table";
import TableRow from "@/components/table/tableRow";
import { adminLoginPage } from "@/constants";
import getLogsWithBorrower from "@/data-access-layer/BorrowLogs";
import toPHDateString from "@/lib/toPHDateString";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Filter from "./_components/Filter";
import { File } from "lucide-react";
import Pagination from "./_components/Pagination";

type SearchParameters = Promise<{
   idNumber?: string;
   from?: string;
   to?: string;
   page?: string;
}>;

async function Suspended({ searchParams }: { searchParams: SearchParameters }) {
   const { from, to, idNumber, page: pageParam } = await searchParams;
   const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
   const logsWithBorrower = await getLogsWithBorrower(
      idNumber,
      from ? startOfDay(parseISO(from)) : undefined,
      to ? endOfDay(parseISO(to)) : undefined,
      page,
   );
   if (!logsWithBorrower.ok) {
      if (logsWithBorrower.error === "AUTH") redirect(adminLoginPage);
      return <>Error</>;
   }
   if (logsWithBorrower.data.logs.length === 0)
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

   return logsWithBorrower.data.logs.map((row, i) => (
      <TableRow
         key={i}
         index={i}
         data={[
            toPHDateString(row.date),
            row.idNumber,
            row.borrower?.name,
            row.borrower?.program,
            row.borrower?.yearLevel,
            row.borrower?.college,
            row.bookBarcode,
            // row.bookTitle,
            // row.bookAuthor,
         ]}
      />
   ));
}

async function SuspendedPagination({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const { from, to, idNumber, page: pageParam } = await searchParams;
   const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
   const logsWithBorrower = await getLogsWithBorrower(
      idNumber,
      from ? startOfDay(parseISO(from)) : undefined,
      to ? endOfDay(parseISO(to)) : undefined,
      page,
   );
   if (!logsWithBorrower.ok) return null;

   return (
      <Pagination
         page={page}
         total={logsWithBorrower.data.total}
         filters={{ idNumber, from, to }}
      />
   );
}

async function SuspendedFilter({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const { from, to, idNumber } = await searchParams;
   return (
      <Filter
         key={`${from ?? ""}:${to ?? ""}:${idNumber ?? ""}`}
         from={from}
         to={to}
         idNumber={idNumber}
      />
   );
}

export default async function Logs({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <>
         <Suspense>
            <SuspendedFilter searchParams={searchParams} />
         </Suspense>
         <div className="overflow-x-auto">
            <Table
               headers={[
                  "Date",
                  "ID",
                  "Name",
                  "Program",
                  "Year",
                  "College",
                  "Book Barcode",
                  // "Title",
                  // "Author",
               ]}
               extraStyling="min-w-230"
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
