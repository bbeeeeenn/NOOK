"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";
import { SubmitEvent, useState, useTransition } from "react";
import { ListFilter, LoaderCircle } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

const filterFields = [
   ["copyCode", "Copy Code"],
   ["callnumber", "Call Number"],
   ["title", "Title"],
   ["author", "Author"],
   ["sublocation", "Sublocation"],
   ["circulationType", "Circulation Type"],
] as const;

type BookFilters = Partial<Record<(typeof filterFields)[number][0], string>>;

export default function Filter({
   initialFilters,
   pageSize: initialPageSize,
}: {
   initialFilters: BookFilters;
   pageSize?: string;
}) {
   const [showFilter, setShowFilter] = useState(
      filterFields.some(([key]) => !!initialFilters[key]),
   );
   const pathname = usePathname();
   const router = useRouter();
   const [isPendingFiltering, startTransitionFiltering] = useTransition();
   const [isPendingClearing, startTransitionClearing] = useTransition();
   const [filters, setFilters] = useState<BookFilters>(initialFilters);
   const [pageSize, setPageSize] = useState(initialPageSize ?? "20");

   function applyFilters(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      if (isPendingFiltering || isPendingClearing) return;
      const params = new URLSearchParams();
      Object.entries({ ...filters, pageSize }).forEach(([key, value]) => {
         if (value?.trim()) params.set(key, value.trim());
      });
      startTransitionFiltering(() =>
         router.replace(`${pathname}?${params.toString()}`),
      );
   }

   function clearFilters() {
      setFilters({});
      setPageSize("20");
      startTransitionClearing(() => router.replace(pathname));
   }

   return (
      <>
         <Button
            onClick={() => setShowFilter((previous) => !previous)}
            className="mb-3 flex items-center gap-2 bg-transparent text-black hover:bg-black/5"
         >
            <span>
               <ListFilter size={20} />
            </span>
            Filters
         </Button>
         <form
            className={clsx(
               "-mt-1 mb-3 flex flex-wrap items-end gap-2 select-none",
               !showFilter && "hidden",
            )}
            onSubmit={applyFilters}
         >
            {filterFields.map(([key, label]) => (
               <label key={key} className="w-44 text-xs">
                  {label}
                  <Input
                     value={filters[key] ?? ""}
                     spellCheck={false}
                     onChange={(event) =>
                        setFilters((previous) => ({
                           ...previous,
                           [key]: event.target.value,
                        }))
                     }
                  />
               </label>
            ))}
            <label className="flex w-24 flex-col gap-1 text-xs">
               Per page
               <select
                  value={pageSize}
                  onChange={(event) => setPageSize(event.target.value)}
                  className="border-input h-8 rounded-lg border bg-transparent px-2 text-sm select-none"
               >
                  {[10, 20, 50].map((size) => (
                     <option key={size} value={size}>
                        {size}
                     </option>
                  ))}
               </select>
            </label>
            <Button
               disabled={isPendingClearing || isPendingFiltering}
               type="submit"
               className={clsx(
                  "bg-green-primary hover:bg-green-primary/80 h-8 rounded-md px-3 text-sm font-medium text-white",
                  (isPendingFiltering || isPendingClearing) && "opacity-80",
               )}
            >
               {isPendingFiltering && (
                  <span>
                     <LoaderCircle className="animate-spin" size={20} />
                  </span>
               )}
               Filter
            </Button>
            <Button
               type="button"
               disabled={isPendingClearing || isPendingFiltering}
               onClick={clearFilters}
               className="h-8 rounded-md bg-transparent px-3 text-sm text-black hover:bg-black/5"
            >
               Clear
            </Button>
         </form>
      </>
   );
}
