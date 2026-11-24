import Table from "@/components/table/table";
import TableRow from "@/components/table/tableRow";
import { adminLoginPage, reportsPage } from "@/constants";
import getByDDC from "@/data-access-layer/byClassNumber";
import { Location } from "@/generated/prisma/enums";
import { endOfMonth, format, isValid, parse, startOfMonth } from "date-fns";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type SearchParameters = Promise<{ month?: string; type?: string }>;
const reportTitle = "In-house utilization per Dewey Decimal Classification";

const classifications: Record<number, string> = {
   0: "Generalities",
   100: "Philosophy",
   200: "Religion",
   300: "Social Sciences",
   400: "Language",
   500: "Pure Sciences",
   600: "Applied Sciences",
   700: "Arts",
   800: "Literature",
   900: "History",
};

function ReportSkeleton() {
   return (
      <div className="animate-pulse" aria-busy="true">
         <div className="mb-4 flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
               <div className="h-4 w-8 rounded bg-gray-200" />
               <div className="h-9 w-36 rounded-md bg-gray-200" />
            </div>
            <div className="flex flex-col gap-1">
               <div className="h-4 w-12 rounded bg-gray-200" />
               <div className="h-9 w-36 rounded-md bg-gray-200" />
            </div>
            <div className="h-9 w-24 rounded-md bg-gray-200" />
         </div>
         <Table
            headers={[
               "CLASS NUMBERS",
               "CLASSIFICATION",
               "NO. OF TITLES USED",
            ]}
         >
            {Array.from({ length: 10 }, (_, index) => (
               <TableRow
                  key={index}
                  index={index}
                  data={[
                     <div
                        key="class-number"
                        className="h-4 w-16 rounded bg-gray-200"
                     />,
                     <div
                        key="classification"
                        className="h-4 w-2/3 rounded bg-gray-200"
                     />,
                     <div
                        key="count"
                        className="mx-auto h-4 w-8 rounded bg-gray-200"
                     />,
                  ]}
               />
            ))}
            <TableRow
               index={10}
               data={[
                  <div key="total" className="h-5 w-16 rounded bg-gray-200" />,
                  "",
                  <div
                     key="total-count"
                     className="mx-auto h-5 w-10 rounded bg-gray-200"
                  />,
               ]}
               styles="font-bold text-base"
            />
         </Table>
      </div>
   );
}

function getSelectedMonth(month?: string) {
   const parsed = month ? parse(month, "yyyy-MM", new Date()) : new Date();
   return isValid(parsed) && /^\d{4}-\d{2}$/.test(month ?? "")
      ? parsed
      : new Date();
}

async function Suspended({ searchParams }: { searchParams: SearchParameters }) {
   const { month, type } = await searchParams;
   const selectedMonth = getSelectedMonth(month);

   const byDDCBorrowCounts = await getByDDC(
      startOfMonth(selectedMonth),
      endOfMonth(selectedMonth),
      ([Location.CIRCULATION, Location.FILIPINIANA] as Location[]).find(
         (l) => l === type,
      ),
   );

   if (!byDDCBorrowCounts.ok) {
      if (byDDCBorrowCounts.error === "AUTH") redirect(adminLoginPage);
      return <p className="p-4">Unable to load the report.</p>;
   }

   return (
      <>
         <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm font-medium">
               Type
               <select
                  name="type"
                  id="type"
                  defaultValue={type}
                  className="h-9 rounded-md border border-black/20 px-2"
               >
                  <option value="">All</option>
                  <option value="CIRCULATION">Circulation</option>
                  <option value="FILIPINIANA">Filipiniana</option>
               </select>
            </label>
            <label
               className="flex flex-col gap-1 text-sm font-medium"
               htmlFor="month"
            >
               Month
               <input
                  id="month"
                  name="month"
                  type="month"
                  defaultValue={format(selectedMonth, "yyyy-MM")}
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

         <Table
            headers={["CLASS NUMBERS", "CLASSIFICATION", "NO. OF TITLES USED"]}
         >
            {byDDCBorrowCounts.data.map((row, i) => (
               <TableRow
                  index={i}
                  key={row.rangeStart}
                  data={[
                     `${row.rangeStart}-${row.rangeStart + 99}`,
                     classifications[row.rangeStart],
                     row.count.toString(),
                  ]}
               />
            ))}
            {byDDCBorrowCounts.data.length > 0 && (
               <TableRow
                  index={byDDCBorrowCounts.data.length}
                  data={[
                     "TOTAL",
                     "",
                     byDDCBorrowCounts.data.reduce(
                        (total, row) => total + Number(row.count),
                        0,
                     ),
                  ]}
                  styles="font-bold text-base"
               />
            )}
         </Table>
      </>
   );
}

export default function ByClassNumbersPage({
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
