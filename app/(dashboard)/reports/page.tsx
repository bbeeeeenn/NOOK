import FallbackRow from "@/components/table/fallbackRow";
import Table from "@/components/table/table";
import TableRow from "@/components/table/tableRow";
import { adminLoginPage } from "@/constants";
import getCollegeBorrowerCounts from "@/data-access-layer/CollegeBorrowers";
import { endOfMonth, format, isValid, parse, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type SearchParameters = Promise<{ month?: string }>;

function getSelectedMonth(month?: string) {
   const parsed = month ? parse(month, "yyyy-MM", new Date()) : new Date();
   return isValid(parsed) && /^\d{4}-\d{2}$/.test(month ?? "")
      ? parsed
      : new Date();
}

async function Suspended({ searchParams }: { searchParams: SearchParameters }) {
   const { month } = await searchParams;
   const selectedMonth = getSelectedMonth(month);
   const counts = await getCollegeBorrowerCounts(
      startOfMonth(selectedMonth),
      endOfMonth(selectedMonth),
   );

   if (!counts.ok) {
      if (counts.error === "AUTH") redirect(adminLoginPage);
      return <p className="p-4">Unable to load the report.</p>;
   }

   return (
      <>
         <form method="get" className="mb-4 flex items-end gap-2">
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

         <Table headers={["COLLEGE", "NO. OF TITLES USED"]}>
            {counts.data.length === 0 ? (
               <FallbackRow />
            ) : (
               counts.data.map((row, index) => (
                  <TableRow
                     key={row.college}
                     index={index}
                     data={[row.college, row.borrowers]}
                  />
               ))
            )}
            {counts.data.length > 0 && (
               <TableRow
                  index={counts.data.length}
                  data={[
                     "TOTAL",
                     counts.data.reduce(
                        (total, row) => total + row.borrowers,
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

export default async function ReportsPage({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <div className="p-4">
         <Suspense fallback={"Loading..."}>
            <Suspended searchParams={searchParams} />
         </Suspense>
      </div>
   );
}
