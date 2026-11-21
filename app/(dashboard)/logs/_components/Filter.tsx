"use client";

import { format, parseISO } from "date-fns";
import {
   ChevronDown,
   ChevronDownIcon,
   ChevronUp,
   FilterIcon,
   LoaderCircle,
   X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";
import {
   type Dispatch,
   type SetStateAction,
   SubmitEvent,
   useState,
   useTransition,
} from "react";
import clsx from "clsx";

function DatePicker({
   label,
   date,
   setDate,
}: {
   label: string;
   date?: Date;
   setDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
   return (
      <Popover>
         <PopoverTrigger
            render={
               <Button
                  variant={"outline"}
                  data-empty={!date}
                  className="data-[empty=true]:text-muted-foreground w-50 justify-between text-left font-normal"
               >
                  {date ? format(date, "PPP") : <span>{label}</span>}
                  <ChevronDownIcon data-icon="inline-end" />
               </Button>
            }
         />
         <PopoverContent className="w-auto p-0" align="start">
            <Calendar
               mode="single"
               selected={date}
               onSelect={setDate}
               defaultMonth={date}
            />
         </PopoverContent>
      </Popover>
   );
}

export default function Filter({
   from: initialFrom,
   to: initialTo,
   idNumber: initialIdNumber,
   type,
}: {
   from: string | undefined;
   to: string | undefined;
   idNumber: string | undefined;
   type: string | undefined;
}) {
   const [showFilter, setShowFilter] = useState(
      !!initialFrom || !!initialTo || !!initialIdNumber,
   );
   const pathname = usePathname();
   const router = useRouter();
   const [from, setFrom] = useState<Date | undefined>(
      initialFrom ? parseISO(initialFrom) : undefined,
   );
   const [to, setTo] = useState<Date | undefined>(
      initialTo ? parseISO(initialTo) : undefined,
   );
   const [circType, setCircType] = useState(type);
   const [idNumber, setIdNumber] = useState(initialIdNumber ?? "");
   const [isPendingFiltering, startTransitionFiltering] = useTransition();
   const [isPendingClearing, startTransitionClearing] = useTransition();

   function applyFilters(event: SubmitEvent<HTMLFormElement>) {
      event.preventDefault();
      if (isPendingFiltering || isPendingClearing) return;

      const params = new URLSearchParams();

      if (idNumber.trim()) params.set("idNumber", idNumber.trim());
      if (from) params.set("from", format(from, "yyyy-MM-dd"));
      if (to) params.set("to", format(to, "yyyy-MM-dd"));
      if (circType) params.set("type", circType);
      const query = params.toString();
      startTransitionFiltering(() => {
         router.replace(query ? `${pathname}?${query}` : pathname);
      });
   }

   function clearFilters() {
      setFrom(undefined);
      setTo(undefined);
      setIdNumber("");
      startTransitionClearing(() => {
         router.replace(pathname);
      });
   }

   return (
      <div className="mb-2 overflow-x-auto p-1">
         <Button
            onClick={() => setShowFilter((prev) => !prev)}
            className={
               "flex items-center gap-2 bg-transparent text-black hover:bg-black/5"
            }
         >
            <span>
               <FilterIcon size={20} />
            </span>
            Filters
            <span>
               {showFilter ? (
                  <ChevronUp size={20} />
               ) : (
                  <ChevronDown size={20} />
               )}
            </span>
         </Button>
         <form
            className={clsx(
               "mt-2 flex flex-wrap items-end gap-2 **:[p]:ml-1 **:[p]:text-xs",
               !showFilter && "hidden",
            )}
            onSubmit={applyFilters}
         >
            <label className="flex w-44 flex-col gap-1 text-xs">
               Type
               <select
                  value={circType}
                  onChange={(e) => setCircType(e.target.value)}
                  className="border-input h-8 rounded-lg border bg-transparent px-2 text-sm select-none"
               >
                  <option value="">All</option>
                  <option value="circulation">Circulation</option>
                  <option value="filipiniana">Filipiniana</option>
               </select>
            </label>
            <div>
               <p>ID Number</p>
               <Input
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  placeholder="-"
                  className="block w-50 min-w-50"
               />
            </div>

            <div>
               <p>Date</p>
               <div className="flex gap-2">
                  <DatePicker label="From" date={from} setDate={setFrom} />
                  <DatePicker label="To" date={to} setDate={setTo} />
               </div>
            </div>
            <div className="flex gap-2">
               <Button
                  type="submit"
                  disabled={isPendingFiltering || isPendingClearing}
                  className="bg-green-primary hover:bg-green-primary flex items-center gap-1 rounded-md px-2 py-1 font-medium text-white shadow-sm hover:brightness-120"
               >
                  <span>
                     {isPendingFiltering ? (
                        <LoaderCircle size={20} className="animate-spin" />
                     ) : (
                        <FilterIcon size={20} />
                     )}
                  </span>
                  {isPendingFiltering ? "Filtering..." : "Filter"}
               </Button>
               {(initialIdNumber || initialFrom || initialTo) && (
                  <Button
                     type="button"
                     disabled={isPendingFiltering || isPendingClearing}
                     onClick={clearFilters}
                     className="flex items-center gap-1 rounded-md bg-transparent px-2 py-1 font-medium text-black hover:bg-transparent"
                  >
                     <span>
                        <X size={20} />
                     </span>
                     Clear
                  </Button>
               )}
            </div>
         </form>
      </div>
   );
}
