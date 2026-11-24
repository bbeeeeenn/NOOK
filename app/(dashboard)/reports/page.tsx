import {
   byClassNumbersReportPage,
   perCollegeAndUsersReportPage,
} from "@/constants";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ReportsPage() {
   return (
      <>
         <Link
            href={perCollegeAndUsersReportPage}
            className="flex w-fit items-center gap-2 rounded-sm bg-gray-100 px-4 py-3 text-lg font-medium shadow-sm outline"
         >
            In-house utilization per college and other library users
            <span>
               <ChevronRight />
            </span>
         </Link>
         <Link
            href={byClassNumbersReportPage}
            className="mt-4 flex w-fit items-center gap-2 rounded-sm bg-gray-100 px-4 py-3 text-lg font-medium shadow-sm outline"
         >
            In-house utilization per DDC
            <span>
               <ChevronRight />
            </span>
         </Link>
      </>
   );
}
