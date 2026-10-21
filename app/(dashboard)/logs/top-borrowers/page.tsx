import FallbackRow from "@/components/table/fallbackRow";
import Table from "@/components/table/table";
import TableRow from "@/components/table/tableRow";
import { adminLoginPage } from "@/constants";
import getTopBorrowers from "@/data-access-layer/topBorrowers";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type SearchParameters = Promise<{ from?: string; to?: string }>;

async function SuspendedTopRows({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   const { from: initialFrom, to: initialTo } = await searchParams;
   const from = initialFrom ? parseISO(initialFrom) : undefined;
   const to = initialTo ? parseISO(initialTo) : undefined;
   const top = await getTopBorrowers(
      from ? startOfDay(from) : undefined,
      to ? endOfDay(to) : undefined,
   );
   if (!top.ok) {
      if (top.error === "AUTH") redirect(adminLoginPage);
      return <>Error</>;
   }
   return top.data.map((t, i) => (
      <TableRow
         index={i}
         key={t.idNumber}
         data={[i + 1, t.idNumber, t._count.bookBarcode]}
      />
   ));
}

export default function TopBorrowersPage({
   searchParams,
}: {
   searchParams: SearchParameters;
}) {
   return (
      <>
         <Table headers={["No.", "ID-Number", "Times Borrowed"]}>
            <Suspense fallback={<FallbackRow />}>
               <SuspendedTopRows searchParams={searchParams} />
            </Suspense>
         </Table>
      </>
   );
}
