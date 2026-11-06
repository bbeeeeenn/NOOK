"use client";
import { TABLE_PAGE_SIZE } from "@/constants";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

export default function Pagination({
   page,
   total,
   filters,
}: {
   page: number;
   total: number;
   filters: { idNumber?: string; from?: string; to?: string };
}) {
   const router = useRouter();
   const pathname = usePathname();
   const [isNavigating, startTransition] = useTransition();
   const totalPages = Math.ceil(total / TABLE_PAGE_SIZE);
   if (totalPages <= 1) return null;

   const onChangePage = (page: number) => {
      const params = new URLSearchParams();
      if (filters.idNumber) params.set("idNumber", filters.idNumber);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      params.set("page", String(page));
      startTransition(() => router.push(pathname + `?${params.toString()}`));
   };
   return (
      <nav
         className={clsx(
            "mt-3 flex items-center justify-between gap-3",
            isNavigating && "opacity-50",
         )}
         inert={isNavigating}
         aria-label="Log pages"
      >
         <button
            onClick={() => onChangePage(page - 1)}
            aria-disabled={page === 1}
            className={`rounded-md border px-3 py-1 text-sm ${
               page === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
            }`}
         >
            Previous
         </button>
         <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
         </span>
         <button
            onClick={() => onChangePage(page + 1)}
            aria-disabled={page === totalPages}
            className={`rounded-md border px-3 py-1 text-sm ${
               page === totalPages
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-muted"
            }`}
         >
            Next
         </button>
      </nav>
   );
}
