"use client";

import importRecords from "@/actions/BorrowerRecords/importRecords";
import { Download, LoaderCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "react-toastify";

export default function ImportPage() {
   const [error, setError] = useState<string>("");

   const [info, setInfo] = useState({
      sheetName: "",
      range: "",
   });
   const onAction = async () => {
      const loadingToast = toast.loading("Importing...");
      const res = await importRecords(info.sheetName, info.range);
      if (res.ok) {
         toast.update(loadingToast, {
            isLoading: false,
            type: "success",
            render: res.data.message,
            autoClose: 3000,
         });
         setInfo({ range: "", sheetName: "" });
      } else {
         toast.update(loadingToast, {
            isLoading: false,
            type: "error",
            render: res.message,
            autoClose: 3000,
         });
         setError(res.message);
      }
   };
   const [, formAction, isPending] = useActionState(onAction, null);

   return (
      <div className="font-inter mx-auto mt-4 px-2 text-gray-700 select-none">
         <h1 className="text-xl font-semibold">Import Student Record</h1>
         <form
            action={formAction}
            className="mt-2 space-y-2"
            onSubmit={(e) => {
               if (isPending) e.preventDefault();
               setError("");
            }}
         >
            <div>
               <label htmlFor="sheetname" className="block text-sm">
                  Sheet name
               </label>
               <input
                  spellCheck={false}
                  type="text"
                  id="sheetname"
                  value={info.sheetName}
                  onChange={(e) =>
                     setInfo((prev) => ({
                        ...prev,
                        sheetName: e.target.value,
                     }))
                  }
                  placeholder="e.g. Sheet1"
                  required
                  className="w-full max-w-125 self-stretch rounded-lg border border-gray-400 px-2 py-2 placeholder:select-none focus:outline-0"
               />
            </div>
            <div>
               <label htmlFor="range" className="block text-sm">
                  Range
               </label>
               <input
                  spellCheck={false}
                  type="text"
                  id="range"
                  value={info.range}
                  onChange={(e) =>
                     setInfo((prev) => ({ ...prev, range: e.target.value }))
                  }
                  placeholder="e.g. A1:E20"
                  required
                  className="w-full max-w-50 self-stretch rounded-lg border border-gray-400 px-2 py-2 placeholder:select-none focus:outline-0"
               />
            </div>
            <button
               disabled={isPending}
               className="font-roboto bg-yellow-primary mt-4 flex items-center gap-2 rounded-lg px-4 py-2 font-medium shadow-sm"
            >
               {isPending ? (
                  <>
                     <span>
                        <LoaderCircle className="animate-spin" />
                     </span>{" "}
                     Import
                  </>
               ) : (
                  <>
                     <span>
                        <Download size={17} />
                     </span>{" "}
                     Import
                  </>
               )}
            </button>
            {error && (
               <p className={"text-sm font-medium text-red-800"}>{error}</p>
            )}
         </form>
      </div>
   );
}
