import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useMobileSidebarToggle } from "./SidebarContextProvider";
import { ChevronRight } from "lucide-react";

export default function LinkItem(
   props: LinkProps & {
      label: string;
      children: React.ReactNode; // Icon
   },
) {
   const pathname = usePathname();
   const toggleMobileSidebar = useMobileSidebarToggle();

   return (
      <Link
         className={cn(
            "font-funnel-sans flex items-center gap-2 rounded-sm p-3 text-white/83 outline-0",
            pathname.includes(props.href.toString())
               ? "bg-yellow-primary pointer-events-none text-gray-800 shadow-sm"
               : "hover:bg-white-primary/15 hover:text-white hover:shadow-sm focus-visible:bg-white/8",
         )}
         onClick={() => toggleMobileSidebar(false)}
         {...props}
      >
         <span>{props.children}</span>
         <span className="truncate">{props.label}</span>
         {!pathname.includes(props.href.toString()) && (
            <span className="ml-auto">
               <ChevronRight />
            </span>
         )}
      </Link>
   );
}
