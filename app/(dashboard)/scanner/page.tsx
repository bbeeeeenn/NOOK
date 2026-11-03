"use client";
import {
   BookRecordGetPayload,
   BorrowerRecordGetPayload,
} from "@/generated/prisma/models";
import { Result } from "@/types/types";
import { Scanner } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import {
   AlertCircle,
   Barcode,
   CheckSquare,
   LoaderCircle,
   Square,
   User,
} from "lucide-react";
import { SubmitEvent, useEffect, useRef, useState } from "react";

export default function ScannerPage() {
   const [inputs, setInputs] = useState<{
      bookBarcode: string;
      idNumber: string | null;
   }>({ bookBarcode: "", idNumber: "" });
   const [isVisitor, setIsVisitor] = useState(false);

   const [confirmation, setConfirmation] = useState<{
      bookBarcode: string;
      idNumber: string | null;
      isVisitor: boolean;
   } | null>(null);

   const confirmationCardRef = useRef<HTMLDivElement>(null);

   const onSubmit = (e: SubmitEvent) => {
      e.preventDefault();
      setConfirmation({ ...inputs, isVisitor: isVisitor });
      requestAnimationFrame(() => {
         confirmationCardRef.current?.scrollIntoView({ behavior: "smooth" });
      });
   };

   return (
      <>
         <div className="mb-8 flex flex-wrap-reverse items-end justify-evenly gap-x-6 gap-y-8 pt-2">
            <form onSubmit={onSubmit} className="max-w-120 grow text-white">
               <label htmlFor="" className="mb-2 block text-sm font-normal">
                  Book Barcode
               </label>
               <input
                  required
                  type="text"
                  value={inputs.bookBarcode}
                  onChange={(e) =>
                     setInputs((prev) => ({
                        ...prev,
                        bookBarcode: e.target.value.toUpperCase(),
                     }))
                  }
                  spellCheck={false}
                  className="border-green-primary bg-white-primary/10 font-roboto mb-8 w-full min-w-0 rounded-sm border-2 px-2 py-1 text-xl font-medium tracking-widest text-green-50 uppercase outline-none"
               />
               <label
                  htmlFor=""
                  className={clsx(
                     "mb-2 block text-sm font-normal",
                     isVisitor && "opacity-50",
                  )}
               >
                  ID Number
               </label>
               <input
                  required={!isVisitor}
                  type="text"
                  value={isVisitor ? "" : (inputs.idNumber ?? "")}
                  onChange={(e) =>
                     setInputs((prev) => ({
                        ...prev,
                        idNumber: e.target.value,
                     }))
                  }
                  disabled={isVisitor}
                  spellCheck={false}
                  className="border-green-primary bg-white-primary/10 font-roboto mb-2 w-full min-w-0 rounded-sm border-2 px-2 py-1 text-xl font-medium tracking-widest text-green-50 uppercase outline-none disabled:opacity-50"
               />
               <button
                  type="button"
                  className="mb-8 flex items-center gap-x-1 text-sm"
                  onClick={() => setIsVisitor((prev) => !prev)}
               >
                  <span className="text-green-primary">
                     {isVisitor ? (
                        <CheckSquare size={20} />
                     ) : (
                        <Square size={20} />
                     )}
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
         <div ref={confirmationCardRef}>
            {confirmation && (
               <ConfirmationCard
                  key={
                     confirmation.idNumber +
                     confirmation.bookBarcode +
                     confirmation.isVisitor
                  }
                  idNumber={confirmation.idNumber}
                  bookBarcode={confirmation.bookBarcode}
                  isVisitor={confirmation.isVisitor}
                  close={() => setConfirmation(null)}
               />
            )}
         </div>
      </>
   );
}

function useFetch<T>(apiUrl: string): [T | null, string] {
   const [data, setData] = useState<T | null>(null);
   const [error, setError] = useState("");
   useEffect(() => {
      const controller = new AbortController();

      (async () => {
         try {
            const res = await fetch(apiUrl, {
               signal: controller.signal,
            });
            const fetchedData = (await res.json()) as Result<T>;
            if (fetchedData.ok) setData(fetchedData.data);
            else setError(fetchedData.message);
         } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") {
               return;
            }
            console.error(e);
            setError("Unexpected error. Please try again.");
         }
      })();

      return () => controller.abort();
   }, [apiUrl]);
   return [data, error];
}

function ConfirmationCard({
   idNumber,
   bookBarcode,
   isVisitor,
   close,
}: {
   idNumber: string | null;
   bookBarcode: string;
   isVisitor: boolean;
   close: () => void;
}) {
   const [borrower, borrowerError] = useFetch<
      BorrowerRecordGetPayload<{
         omit: { gender: true; idNumber: true };
      }>
   >(`/api/borrower?idNumber=${idNumber}`);
   const [book, bookerror] = useFetch<
      BookRecordGetPayload<{
         select: { title: true; author: true };
      }>
   >(`/api/book?code=${bookBarcode}`);

   return (
      <div className="bg-green-primary borrowconfirmationcard text-white-primary font-roboto mx-auto min-h-40 rounded-md border border-green-400 p-4">
         <p className="text-xs opacity-90 sm:text-sm">Confirm details</p>
         <p className="text-lg font-semibold sm:text-xl">Borrow request</p>

         <div className="mt-4 divide-y divide-green-50/50 rounded-md bg-white/15 px-3 font-medium">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-1 py-2">
                  <span>
                     <User size={20} />
                  </span>
                  Borrower
               </div>
               <p className="truncate font-semibold">
                  {isVisitor ? "Visitor" : idNumber}
               </p>
            </div>
            {!isVisitor &&
               (borrowerError ? (
                  <div className="py-2">
                     <p className="flex items-center gap-2 bg-green-700/50 p-1">
                        <span>
                           <AlertCircle size={20} />
                        </span>
                        {borrowerError}
                     </p>
                  </div>
               ) : !borrower ? (
                  <div className="flex items-center gap-2 py-4">
                     <span>
                        <LoaderCircle className="animate-spin" size={20} />
                     </span>
                     Loading...
                  </div>
               ) : (
                  <div className="py-2">
                     {[
                        [
                           "Name",
                           [
                              borrower.firstname,
                              borrower.middlename,
                              borrower.lastname,
                           ].join(" "),
                        ],
                        ["College", borrower.college],
                        ["Program", borrower.program],
                        ["Year level", borrower.yearLevel.toString()],
                     ].map((e) => (
                        <div key={e[0]} className="flex justify-between gap-2">
                           <p className="font-normal opacity-95">{e[0]}</p>
                           <p className="font-semibold">{e[1]}</p>
                        </div>
                     ))}
                  </div>
               ))}
         </div>

         <div className="mt-4 mb-4 divide-y divide-green-50/50 rounded-md bg-white/15 px-3 font-medium">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-1 py-2 text-nowrap">
                  <span>
                     <Barcode size={20} />
                  </span>
                  Book barcode
               </div>
               <p className="truncate font-semibold">{bookBarcode}</p>
            </div>
            {bookerror ? (
               <div className="py-2">
                  <p className="flex items-center gap-2 bg-green-700/50 p-1">
                     <span>
                        <AlertCircle size={20} />
                     </span>
                     {bookerror}
                  </p>
               </div>
            ) : !book ? (
               <div className="flex items-center gap-2 py-4">
                  <span>
                     <LoaderCircle className="animate-spin" size={20} />
                  </span>
                  Loading...
               </div>
            ) : (
               <div className="py-2">
                  <p className="text-lg">{book?.title}</p>
                  <p className="text-sm">by {book?.author}</p>
               </div>
            )}
         </div>

         <div className="flex gap-x-4 font-semibold text-black">
            <button
               className="bg-yellow-primary rounded-sm px-6 py-2"
               onClick={close}
            >
               Cancel
            </button>
            <button className="bg-yellow-primary grow rounded-sm px-4 py-2">
               Confirm
            </button>
         </div>
      </div>
   );
}
