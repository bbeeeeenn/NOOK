"use client";
import { Scanner } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import { CheckSquare, Square } from "lucide-react";
import { useState } from "react";

export default function ScannerPage() {
   const [isVisitor, setIsVisitor] = useState(false);

   return (
      <div className="flex flex-wrap-reverse items-end justify-evenly gap-x-6 gap-y-8 pt-2">
         <form className="max-w-120 grow text-white">
            <label
               htmlFor=""
               className="font-inter mb-2 block text-sm font-normal"
            >
               Book Barcode
            </label>
            <input
               required
               type="text"
               name=""
               id=""
               spellCheck={false}
               className="border-green-primary bg-white-primary/10 font-roboto mb-8 w-full min-w-0 rounded-sm border px-2 py-1 text-xl font-medium tracking-widest uppercase outline-none"
            />
            <label
               htmlFor=""
               className={clsx(
                  "font-inter mb-2 block text-sm font-normal",
                  isVisitor && "opacity-50",
               )}
            >
               ID Number
            </label>
            <input
               required={!isVisitor}
               type="text"
               name=""
               id=""
               disabled={isVisitor}
               spellCheck={false}
               className="border-green-primary bg-white-primary/10 font-roboto mb-2 w-full min-w-0 rounded-sm border px-2 py-1 text-xl font-medium tracking-widest uppercase outline-none disabled:opacity-50"
            />
            <button
               type="button"
               className="mb-8 flex items-center gap-x-1 text-sm"
               onClick={() => setIsVisitor((prev) => !prev)}
            >
               <span className="text-green-primary">
                  {isVisitor ? <CheckSquare size={20} /> : <Square size={20} />}
               </span>
               Visitor
            </button>
            <button className="bg-yellow-primary block w-full rounded-md p-2 font-semibold text-black shadow-md">
               Review
            </button>
         </form>
         <div className="max-h-90 max-w-85 min-w-50">
            <Scanner
               onScan={([]) => {}}
               allowMultiple
               scanDelay={1000}
               classNames={{
                  container: clsx(
                     "rounded-xl border-2 border-green-primary mx-auto bg-white-primary/10",
                  ),
               }}
            />
         </div>
      </div>
   );
}
