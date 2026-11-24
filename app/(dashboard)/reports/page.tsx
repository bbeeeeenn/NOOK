import {
   byClassNumbersReportPage,
   perCollegeAndUsersReportPage,
} from "@/constants";
import {
   Book,
   ChartNoAxesColumn,
   ChevronRight,
   LucideIcon,
   UsersRound,
} from "lucide-react";
import Link from "next/link";

function LinkCard(props: {
   href: string;
   icon: LucideIcon;
   children: React.ReactNode;
}) {
   return (
      <Link
         href={props.href}
         className="@container flex aspect-square flex-col justify-between gap-4 rounded-sm bg-gray-100 p-4 font-medium text-black/75 shadow-sm outline"
      >
         <span>
            <ChartNoAxesColumn size={50} />
         </span>
         <p className="text-xl @xs:text-2xl">{props.children}</p>
      </Link>
   );
}

export default async function ReportsPage() {
   return (
      <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @3xl:grid-cols-3">
         <LinkCard href={perCollegeAndUsersReportPage} icon={UsersRound}>
            In-house utilization per college and other library users
         </LinkCard>
         <LinkCard href={byClassNumbersReportPage} icon={Book}>
            In-house utilization per Dewey Decimal Classification
         </LinkCard>
      </div>
   );
}
