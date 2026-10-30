"use client";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";
import { SubmitEvent, useState, useTransition } from "react";
import { ListFilter, LoaderCircle } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

export default function Filter({
   programs,
   colleges,
   idNumber: initialIdNumber,
   name: initialName,
   program: initialProgram,
   college: initialCollege,
   pageSize: initialPageSize,
}: {
   programs: string[];
   colleges: string[];
   idNumber?: string;
   name?: string;
   program?: string;
   college?: string;
   pageSize?: string;
}) {
   const [showFilter, setShowFilter] = useState(
      !!initialIdNumber ||
         !!initialName ||
         !!initialProgram ||
         !!initialCollege,
   );
   const pathname = usePathname();
   const router = useRouter();
   const [isPendingFiltering, startTransitionFiltering] = useTransition();
   const [isPendingClearing, startTransitionClearing] = useTransition();
   const [idNumber, setIdNumber] = useState(initialIdNumber ?? "");
   const [name, setName] = useState(initialName ?? "");
   const [program, setProgram] = useState(initialProgram ?? "");
   const [college, setCollege] = useState(initialCollege ?? "");
   const [pageSize, setPageSize] = useState(initialPageSize ?? "20");

   function applyFilters(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      if (isPendingFiltering || isPendingClearing) return;
      const params = new URLSearchParams();
      const values = { idNumber, name, program, college, pageSize };
      Object.entries(values).forEach(([key, value]) => {
         if (value.trim()) params.set(key, value.trim());
      });
      startTransitionFiltering(() => router.replace(`${pathname}?${params}`));
   }

   function clearFilters() {
      setIdNumber("");
      setName("");
      setProgram("");
      setCollege("");
      setPageSize("20");
      startTransitionClearing(() => router.replace(pathname));
   }

   return (
      <>
         <Button
            onClick={() => setShowFilter((prev) => !prev)}
            className={
               "mb-3 flex items-center gap-2 bg-transparent text-black hover:bg-black/5"
            }
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
            <label className="w-44 text-xs">
               ID Number
               <Input
                  value={idNumber}
                  spellCheck={false}
                  onChange={(e) => setIdNumber(e.target.value)}
               />
            </label>
            <label className="w-44 text-xs">
               Name
               <Input
                  value={name}
                  spellCheck={false}
                  onChange={(e) => setName(e.target.value)}
               />
            </label>
            <label className="flex w-44 flex-col gap-1 text-xs">
               Program
               <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="border-input h-8 rounded-lg border bg-transparent px-2 text-sm select-none"
               >
                  <option value="">All programs</option>
                  {programs.map((item) => (
                     <option key={item} value={item}>
                        {item}
                     </option>
                  ))}
               </select>
            </label>
            <label className="flex w-44 flex-col gap-1 text-xs">
               College
               <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="border-input h-8 rounded-lg border bg-transparent px-2 text-sm select-none"
               >
                  <option value="">All colleges</option>
                  {colleges.map((item) => (
                     <option key={item} value={item}>
                        {item}
                     </option>
                  ))}
               </select>
            </label>
            <label className="flex w-24 flex-col gap-1 text-xs">
               Per page
               <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
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
                  isPendingFiltering || (isPendingClearing && "opacity-80"),
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
