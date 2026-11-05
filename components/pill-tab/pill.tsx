"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Pill({
   children,
   targetRoute,
   label,
}: {
   children?: React.ReactNode;
   targetRoute: string;
   label: string;
}) {
   const pathname = usePathname();
   const active = pathname === targetRoute;
   return (
      <Link
         href={targetRoute}
         className={clsx(
            "flex justify-center gap-1 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200/50 active:bg-gray-200/50",
            active && "bg-yellow-primary pointer-events-none shadow-sm",
         )}
      >
         <span className="truncate">{label}</span> {children}
      </Link>
   );
}
