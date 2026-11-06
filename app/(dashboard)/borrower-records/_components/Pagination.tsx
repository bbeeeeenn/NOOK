import Link from "next/link";

export default function Pagination({
   page,
   pageSize,
   total,
   filters,
}: {
   page: number;
   pageSize: number;
   total: number;
   filters: {
      idNumber?: string;
      name?: string;
      program?: string;
      college?: string;
   };
}) {
   const totalPages = Math.ceil(total / pageSize);
   if (totalPages <= 1) return null;

   function href(nextPage: number) {
      const params = new URLSearchParams({
         page: String(nextPage),
         pageSize: String(pageSize),
      });
      Object.entries(filters).forEach(([key, value]) => {
         if (value) params.set(key, value);
      });
      return `?${params}`;
   }

   return (
      <nav
         className="mt-3 flex items-center justify-between gap-3"
         aria-label="Borrower pages"
      >
         <Link
            href={href(page - 1)}
            aria-disabled={page === 1}
            className={`rounded-md border px-3 py-1 text-sm ${page === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"}`}
         >
            Previous
         </Link>
         <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
         </span>
         <Link
            href={href(page + 1)}
            aria-disabled={page === totalPages}
            className={`rounded-md border px-3 py-1 text-sm ${page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"}`}
         >
            Next
         </Link>
      </nav>
   );
}
