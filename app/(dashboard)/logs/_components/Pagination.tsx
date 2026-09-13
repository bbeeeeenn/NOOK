import Link from "next/link";
import { LOGS_PAGE_SIZE } from "@/data-access-layer/BorrowLogs";

export default function Pagination({
   page,
   total,
   filters,
}: {
   page: number;
   total: number;
   filters: { idNumber?: string; from?: string; to?: string };
}) {
   const totalPages = Math.ceil(total / LOGS_PAGE_SIZE);
   if (totalPages <= 1) return null;

   function href(nextPage: number) {
      const params = new URLSearchParams();
      if (filters.idNumber) params.set("idNumber", filters.idNumber);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      params.set("page", String(nextPage));
      return `?${params.toString()}`;
   }

   return (
      <nav
         className="mt-3 flex items-center justify-between gap-3"
         aria-label="Log pages"
      >
         <Link
            href={href(page - 1)}
            aria-disabled={page === 1}
            className={`rounded-md border px-3 py-1 text-sm ${
               page === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
            }`}
         >
            Previous
         </Link>
         <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
         </span>
         <Link
            href={href(page + 1)}
            aria-disabled={page === totalPages}
            className={`rounded-md border px-3 py-1 text-sm ${
               page === totalPages
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-muted"
            }`}
         >
            Next
         </Link>
      </nav>
   );
}
