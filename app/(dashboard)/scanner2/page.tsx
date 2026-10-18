"use client";
import { Scanner } from "@yudiel/react-qr-scanner";
import clsx from "clsx";

export default function ScannerPage() {
   return (
      <div className="flex flex-wrap-reverse items-end justify-evenly gap-x-4 gap-y-8 pt-2">
         <form className="max-w-120 grow text-white">
            <label
               htmlFor=""
               className="font-inter mb-2 block text-xs font-normal"
            >
               Book Barcode
            </label>
            <input
               type="text"
               name=""
               id=""
               spellCheck={false}
               className="border-green-primary bg-white-primary/10 font-roboto mb-4 w-full min-w-0 rounded-sm border px-2 py-1 text-xl font-medium tracking-widest uppercase outline-none"
            />
            <label
               htmlFor=""
               className="font-inter mb-2 block text-xs font-normal"
            >
               ID Number
            </label>
            <input
               type="text"
               name=""
               id=""
               spellCheck={false}
               className="border-green-primary bg-white-primary/10 font-roboto w-full min-w-0 rounded-sm border px-2 py-1 text-xl font-medium tracking-widest uppercase outline-none"
            />
         </form>
         <div className="max-h-90 max-w-85 min-w-50 grow">
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
