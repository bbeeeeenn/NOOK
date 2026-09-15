"use client";

import importRecords from "@/actions/BorrowerRecords/importRecords";
import { Download, FileSpreadsheet, LoaderCircle } from "lucide-react";
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
      <div className="font-inter px-4 py-4 text-gray-700 select-none sm:px-6">
         <div className="mb-6 flex items-start gap-3">
            <div>
               <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                  Import student records
               </h1>
               <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                  Pull student data directly from your Google Sheet using its
                  sheet name and cell range.
               </p>
            </div>
         </div>

         <form
            action={formAction}
            className="space-y-5"
            onSubmit={(e) => {
               if (isPending) e.preventDefault();
               setError("");
            }}
         >
            <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
               <div>
                  <label
                     htmlFor="sheetname"
                     className="block text-sm font-medium text-gray-800"
                  >
                     Sheet name
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                     The tab containing the records
                  </p>
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
                     className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm transition-colors placeholder:text-gray-400"
                  />
               </div>
               <div>
                  <label
                     htmlFor="range"
                     className="block text-sm font-medium text-gray-800"
                  >
                     Range
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                     Cells to import, including headers
                  </p>
                  <input
                     spellCheck={false}
                     type="text"
                     id="range"
                     value={info.range}
                     onChange={(e) =>
                        setInfo((prev) => ({
                           ...prev,
                           range: e.target.value,
                        }))
                     }
                     placeholder="e.g. A1:E20"
                     required
                     className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm transition-colors placeholder:text-gray-400"
                  />
               </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
               <p className="text-xs leading-5 text-gray-500">
                  Make sure the sheet columns match the borrower record format.
               </p>
               <button
                  type="submit"
                  disabled={isPending}
                  className="font-roboto bg-yellow-primary flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-medium text-gray-900 shadow-sm transition hover:shadow-md hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
               >
                  {isPending ? (
                     <>
                        <LoaderCircle className="animate-spin" size={18} />
                        Import
                     </>
                  ) : (
                     <>
                        <Download size={17} />
                        Import
                     </>
                  )}
               </button>
            </div>
            {error && (
               <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
               >
                  {error}
               </p>
            )}
         </form>
      </div>
   );
}
