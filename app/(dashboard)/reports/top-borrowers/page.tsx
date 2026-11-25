import Table from "@/components/table/table";
import TableRow from "@/components/table/tableRow";
import { PAGE_SIZE, adminLoginPage, reportsPage } from "@/constants";
import getTopBorrowers from "@/data-access-layer/topBorrowers";
import { Location } from "@/generated/prisma/enums";
import {
   endOfDay,
   format,
   isAfter,
   isValid,
   parseISO,
   startOfDay,
} from "date-fns";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type SearchParameters = Promise<{
   from?: string;
   to?: string;
   type?: string;
}>;
const reportTitle = "Top Borrowers";

function getSelectedDate(date?: string) {
   if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
   const parsed = parseISO(date);
   return isValid(parsed) && format(parsed, "yyyy-MM-dd") === date
      ? parsed
      : undefined;
}

function ReportSkeleton() {
   return (
      <div className="animate-pulse" aria-busy="true">
         <div className="mb-4 flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
               <div className="h-4 w-12 rounded bg-gray-200" />
               <div className="h-9 w-36 rounded-md bg-gray-200" />
            </div>
            <div className="flex flex-col gap-1">
               <div className="h-4 w-12 rounded bg-gray-200" />
               <div className="h-9 w-36 rounded-md bg-gray-200" />
            </div>
            <div className="flex flex-col gap-1">
               <div className="h-4 w-12 rounded bg-gray-200" />
               <div className="h-9 w-36 rounded-md bg-gray-200" />
            </div>
            <div className="h-9 w-24 rounded-md bg-gray-200" />
         </div>
         <Table headers={["RANK", "ID NUMBER", "NO. OF BOOKS BORROWED"]}>
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
               <TableRow
                  key={index}
                  index={index}
                  data={[
                     <div key="rank" className="h-4 w-5 rounded bg-gray-200" />,
                     <div
                        key="id-number"
                        className="h-4 w-24 rounded bg-gray-200"
                     />,
                     <div
                        key="count"
                        className="h-4 w-8 rounded bg-gray-200"
                     />,
                  ]}
               />
            ))}
         </Table>
      </div>
   );
}

async function Suspended({ searchParams }: { searchParams: SearchParameters }) {
   const { from, to, type } = await searchParams;
   const selectedFrom = getSelectedDate(from);
   const selectedTo = getSelectedDate(to);
   const invalidDate = (!!from && !selectedFrom) || (!!to && !selectedTo);
   const fromDate = selectedFrom ? startOfDay(selectedFrom) : undefined;
   const toDate = selectedTo ? endOfDay(selectedTo) : undefined;
   const selectedType = (
      [Location.CIRCULATION, Location.FILIPINIANA] as Location[]
   ).find((location) => location === type);

   const filters = (
      <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
         <label className="flex flex-col gap-1 text-sm font-medium">
            Type
            <select
               name="type"
               id="type"
               defaultValue={selectedType}
               className="h-9 rounded-md border border-black/20 px-2"
            >
               <option value="">All</option>
               <option value="CIRCULATION">Circulation</option>
               <option value="FILIPINIANA">Filipiniana</option>
            </select>
         </label>
         <label
            className="flex flex-col gap-1 text-sm font-medium"
            htmlFor="from"
         >
            From
            <input
               id="from"
               name="from"
               type="date"
               defaultValue={
                  selectedFrom ? format(selectedFrom, "yyyy-MM-dd") : ""
               }
               max={selectedTo ? format(selectedTo, "yyyy-MM-dd") : undefined}
               className="h-9 rounded-md border border-black/20 px-2"
            />
         </label>
         <label
            className="flex flex-col gap-1 text-sm font-medium"
            htmlFor="to"
         >
            To
            <input
               id="to"
               name="to"
               type="date"
               defaultValue={selectedTo ? format(selectedTo, "yyyy-MM-dd") : ""}
               min={
                  selectedFrom ? format(selectedFrom, "yyyy-MM-dd") : undefined
               }
               className="h-9 rounded-md border border-black/20 px-2"
            />
         </label>
         <button
            type="submit"
            className="bg-green-primary h-9 rounded-md px-3 text-sm font-medium text-white hover:brightness-110"
         >
            View report
         </button>
      </form>
   );

   if (
      invalidDate ||
      (selectedFrom && selectedTo && isAfter(selectedFrom, selectedTo))
   ) {
      return (
         <>
            {filters}
            <p className="p-4">
               {invalidDate
                  ? "Enter valid dates for the report."
                  : "The start date must be on or before the end date."}
            </p>
         </>
      );
   }

   const topBorrowers = await getTopBorrowers(
      fromDate,
      toDate,
      1,
      PAGE_SIZE,
      selectedType,
   );

   if (!topBorrowers.ok) {
      if (topBorrowers.error === "AUTH") redirect(adminLoginPage);
      return <p className="p-4">Unable to load the report.</p>;
   }

   return (
      <>
         {filters}
         <Table headers={["RANK", "ID NUMBER", "NO. OF BOOKS BORROWED"]}>
            {topBorrowers.data.length === 0 ? (
               <TableRow
                  index={0}
                  data={["", "No borrowers found for this period.", ""]}
               />
            ) : (
               topBorrowers.data.map((borrower, index) => (
                  <TableRow
                     key={borrower.scannedId}
                     index={index}
                     data={[
                        index + 1,
                        borrower.scannedId,
                        borrower._count.bookBarcode,
                     ]}
                  />
               ))
            )}
         </Table>
      </>
   );
}

export default function TopBorrowersPage({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <>
         <Link
            href={reportsPage}
            className="flex w-fit items-center gap-2 rounded-sm bg-gray-100 px-3 py-2 font-medium shadow-sm outline"
         >
            <span>
               <ChevronLeft size={20} />
            </span>
            Back
         </Link>
         <h1 className="my-3 mt-5 text-xl font-bold uppercase">
            {reportTitle}
         </h1>
         <Suspense fallback={<ReportSkeleton />}>
            <Suspended searchParams={searchParams} />
         </Suspense>
      </>
   );
}
