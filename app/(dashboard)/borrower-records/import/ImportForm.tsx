"use client";

import validateBorrowerImport, {
   type BorrowerImportValidationResult,
} from "@/actions/BorrowerRecords/validateImport";
import confirmBorrowerImport from "@/actions/BorrowerRecords/confirmImport";
import {
   BORROWER_IMPORT_HEADERS,
   type BorrowerImportRow,
} from "@/lib/borrower-import";
import { ChevronRight, LoaderCircle, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { useActionState, useState } from "react";

const headers = BORROWER_IMPORT_HEADERS;

function downloadTemplate() {
   const worksheet = XLSX.utils.aoa_to_sheet([
      [...headers],
      [
         "2026-00001",
         "Juan",
         "Santos",
         "Dela Cruz",
         "MALE",
         "College of Information Technology",
         "Bachelor of Science in Information Technology",
         1,
      ],
   ]);
   worksheet["!cols"] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 10 },
      { wch: 32 },
      { wch: 42 },
      { wch: 12 },
   ];

   const instructions = XLSX.utils.aoa_to_sheet([
      ["Borrower records import template"],
      [""],
      ["Required columns", headers.join(", ")],
      ["gender", "MALE or FEMALE"],
      ["yearLevel", "Whole number from 1 to 6"],
      [""],
      ["Remove the example row before importing your records."],
   ]);
   instructions["!cols"] = [{ wch: 32 }, { wch: 90 }];

   const workbook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(workbook, worksheet, "Borrowers");
   XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
   XLSX.writeFile(workbook, "borrower-records-template.xlsx");
}

function SampleTable({
   title,
   rows,
}: {
   title: string;
   rows: BorrowerImportRow[];
}) {
   return (
      <section className="min-w-0">
         <h2 className="mb-2 font-medium">{title}</h2>
         <div className="overflow-x-auto rounded-md border border-black/10">
            <table className="min-w-full text-left text-sm">
               <thead className="bg-black/5">
                  <tr>
                     {headers.map((header) => (
                        <th key={header} className="px-3 py-2 font-medium">
                           {header}
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {rows.map((row, index) => (
                     <tr key={`${row.idNumber}-${index}`} className="border-t">
                        {headers.map((header) => (
                           <td
                              key={header}
                              className="px-3 py-2 whitespace-nowrap"
                           >
                              {row[header]}
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
   );
}

export default function ImportForm() {
   const [result, setResult] = useState<BorrowerImportValidationResult | null>(
      null,
   );
   const [message, setMessage] = useState<string | null>(null);
   const [messageType, setMessageType] = useState<"error" | "success">("error");
   const [isConfirming, setIsConfirming] = useState(false);

   const [, onSubmit, isPending] = useActionState(
      async (_: unknown, formData: FormData) => {
         setMessage(null);
         setMessageType("error");
         setResult(null);

         try {
            const response = await validateBorrowerImport(formData);
            if (!response.ok) {
               setMessage(response.message);
            } else {
               setResult(response.data);
            }
         } catch (error) {
            console.error("Error submitting borrower import", error);
            setMessage("Unable to validate the workbook. Please try again.");
         }
      },
      null,
   );

   async function onConfirm() {
      if (!result?.importToken) return;
      setMessage(null);
      setIsConfirming(true);
      try {
         const response = await confirmBorrowerImport(result.importToken);
         if (!response.ok) {
            setMessage(response.message);
            return;
         }
         setMessage(
            `Imported ${response.data.totalRows.toLocaleString()} rows: ${response.data.insertCount.toLocaleString()} created, ${response.data.updateCount.toLocaleString()} updated, and ${response.data.linkedBorrowLogs.toLocaleString()} borrow logs linked.`,
         );
         setMessageType("success");
         setResult(null);
      } catch (error) {
         console.error("Error confirming borrower import", error);
         setMessage("Unable to complete the import. No records were changed.");
      } finally {
         setIsConfirming(false);
      }
   }

   return (
      <div className="flex flex-col gap-5">
         <div>
            <h1 className="text-xl font-semibold">Import borrower records</h1>
            <p className="mt-1 text-sm text-black/60">
               Upload an XLSX workbook with up to 50,000 borrower records.
            </p>
         </div>

         <form
            action={onSubmit}
            className="flex flex-col gap-4 rounded-md border border-black/20 bg-white p-5"
         >
            <label
               htmlFor="borrower-import-file"
               className="cursor-pointer font-medium"
            >
               XLSX file
            </label>
            <input
               id="borrower-import-file"
               name="file"
               type="file"
               accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
               required
               disabled={isPending}
               className="cursor-pointer rounded-md border border-black/15 p-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-black/5 file:px-3 file:py-2"
            />
            <p className="text-xs text-black/60">
               Required columns, in order: {headers.join(", ")}
            </p>
            <div className="flex flex-wrap gap-3">
               <button
                  type="submit"
                  disabled={isPending}
                  className="bg-green-primary text-white-primary flex w-fit items-center gap-2 rounded-md px-4 py-2 shadow-sm disabled:opacity-60"
               >
                  {isPending ? (
                     <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                     <Upload size={17} />
                  )}
                  {isPending ? "Validating..." : "Validate workbook"}
               </button>
               <button
                  type="button"
                  onClick={downloadTemplate}
                  disabled={isPending}
                  className="rounded-md bg-black/5 px-4 py-2 shadow-sm disabled:opacity-60"
               >
                  Download template
               </button>
            </div>
         </form>

         {message && (
            <p
               className={`rounded-md p-3 text-sm ${
                  messageType === "success"
                     ? "bg-green-50 text-green-800"
                     : "bg-red-50 text-red-700"
               }`}
            >
               {message}
            </p>
         )}

         {result && (
            <div className="flex flex-col gap-5">
               <section className="rounded-md border border-black/20 bg-white p-5">
                  <h2 className="font-semibold">{result.filename}</h2>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-4">
                     <div>
                        <dt className="text-xs text-black/60">
                           Rows processed
                        </dt>
                        <dd className="text-lg font-semibold">
                           {result.totalRows.toLocaleString()}
                        </dd>
                     </div>
                     <div>
                        <dt className="text-xs text-black/60">New records</dt>
                        <dd className="text-lg font-semibold text-green-700">
                           {result.insertCount.toLocaleString()}
                        </dd>
                     </div>
                     <div>
                        <dt className="text-xs text-black/60">Updates</dt>
                        <dd className="text-lg font-semibold text-blue-700">
                           {result.updateCount.toLocaleString()}
                        </dd>
                     </div>
                     <div>
                        <dt className="text-xs text-black/60">
                           Validation errors
                        </dt>
                        <dd className="text-lg font-semibold text-red-700">
                           {result.errorCount.toLocaleString()}
                        </dd>
                     </div>
                  </dl>
               </section>

               {result.errorCount > 0 ? (
                  <section className="rounded-xl border border-red-300 bg-red-100 p-5">
                     <h2 className="font-semibold text-red-800">
                        Import blocked
                     </h2>
                     <p className="mt-1 text-sm text-red-700">
                        Fix the validation errors and upload the corrected
                        workbook. Showing the first {result.errors.length}{" "}
                        errors.
                     </p>
                     <ul className="mt-3 max-h-80 overflow-y-auto text-sm text-red-800">
                        {result.errors.map((error, index) => (
                           <li key={`${error.row}-${error.field}-${index}`}>
                              Row {error.row}
                              {error.field ? ` (${error.field})` : ""}:{" "}
                              {error.message}
                           </li>
                        ))}
                     </ul>
                  </section>
               ) : (
                  <>
                     <p className="rounded-md border border-green-600 bg-green-100 p-3 text-sm text-green-800">
                        Workbook validated successfully. Review the first and
                        last 25 rows before continuing.
                     </p>
                     <div className="grid gap-5">
                        <SampleTable
                           title="First 25 rows"
                           rows={result.firstRows}
                        />
                        <SampleTable
                           title="Last 25 rows"
                           rows={result.lastRows}
                        />
                     </div>
                     <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isConfirming || !result.importToken}
                        className="bg-yellow-primary flex w-fit items-center justify-center gap-1 rounded-md px-4 py-2 font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                     >
                        {isConfirming ? (
                           "Importing..."
                        ) : (
                           <>
                              Confirm import
                              <span>
                                 <ChevronRight size={20} />
                              </span>
                           </>
                        )}
                     </button>
                  </>
               )}
            </div>
         )}
      </div>
   );
}
