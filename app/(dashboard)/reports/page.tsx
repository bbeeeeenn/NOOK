import { perCollegeAndUsers } from "@/constants";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ReportsPage() {
   return (
      <div className="p-4">
         <Link
            href={perCollegeAndUsers}
            className="flex w-fit items-center gap-2 rounded-sm bg-gray-100 px-4 py-3 text-lg font-medium shadow-sm outline"
         >
            In-house utilization per college and other library users
            <span>
               <ChevronRight />
            </span>
         </Link>
      </div>
   );
}
