"use client";
import createBorrowLog from "@/actions/BorrowLogs/createBorrowLog";
import {
   BookRecordGetPayload,
   BorrowerRecordGetPayload,
} from "@/generated/prisma/models";
import { Result } from "@/types/types";
import {
   IDetectedBarcode,
   Scanner,
   useDevices,
} from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import {
   AlertCircle,
   Barcode,
   Check,
   CheckSquare,
   LoaderCircle,
   RefreshCcw,
   Square,
   User,
} from "lucide-react";
import { SubmitEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function ScannerPage() {
   const devices = useDevices();

   const [inputs, setInputs] = useState<{
      bookBarcode: string;
      idNumber: string;
   }>({ bookBarcode: "", idNumber: "" });
   const [isVisitor, setIsVisitor] = useState(false);

   const [isLogging, setIsLogging] = useState(false);

   const [confirmation, setConfirmation] = useState<{
      bookBarcode: string;
      idNumber?: string;
      isVisitor: boolean;
   } | null>(null);

   const onScan = ([code]: IDetectedBarcode[]) => {
      if (code.format === "qr_code") {
         setInputs((prev) => ({ ...prev, idNumber: code.rawValue }));
      } else {
         setInputs((prev) => ({ ...prev, bookBarcode: code.rawValue }));
      }
   };

   const confirmationCardRef = useRef<HTMLDivElement>(null);

   const onSubmit = (e: SubmitEvent) => {
      e.preventDefault();
      setConfirmation({ ...inputs, isVisitor: isVisitor });
      requestAnimationFrame(() => {
         confirmationCardRef.current?.scrollIntoView({ behavior: "smooth" });
      });
   };

   const onConfirm = async () => {
      if (!confirmation?.bookBarcode) return;
      setIsLogging(true);
      const loadingToast = toast.loading("Processing...");
      const res = await createBorrowLog(
         confirmation.bookBarcode,
         confirmation.idNumber,
      );
      toast.update(loadingToast, {
         type: res.ok ? "success" : "error",
         isLoading: false,
         autoClose: 5000,
         render: res.ok ? res.data.message : res.message,
      });
      if (res.ok) {
         setInputs({ bookBarcode: "", idNumber: "" });
         setConfirmation(null);
      }
      setIsLogging(false);
   };

   const handleModalClose = () => {
      if (!isLogging) setConfirmation(null);
   };

   return devices.length <= 0 ? (
      <div className="border-green-primary bg-green-primary/70 absolute inset-x-4 inset-y-0 mx-auto my-auto flex h-fit flex-col items-center justify-center rounded-md border-2 py-10">
         <p className="text-2xl font-bold text-white">No Camera Detected</p>
         <button
            className="text-yellow-primary mt-4 flex items-center justify-center gap-x-1 hover:underline"
            onClick={() => window.location.reload()}
         >
            <span>
               <RefreshCcw size={16} />
            </span>
            Refresh
         </button>
      </div>
   ) : (
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
                  onScan={onScan}
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
                  close={handleModalClose}
                  confirm={onConfirm}
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
   confirm,
}: {
   idNumber?: string;
   bookBarcode: string;
   isVisitor: boolean;
   close: () => void;
   confirm: () => Promise<void>;
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

   const [isPending, setIsPending] = useState(false);

   const handleConfirm = async () => {
      setIsPending(true);
      await confirm();
      setIsPending(false);
   };

   return (
      <div
         className={clsx(
            "bg-green-primary borrowconfirmationcard text-white-primary font-roboto mx-auto min-h-40 rounded-md border border-green-400 p-4",
            isPending && "opacity-85!",
         )}
      >
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

         <div className="flex gap-x-2 font-semibold text-black sm:gap-x-4">
            <button
               className="bg-yellow-primary grow rounded-sm px-8 py-2 shadow-sm"
               onClick={close}
            >
               Close
            </button>
            {book && (
               <button
                  onClick={handleConfirm}
                  className="bg-yellow-primary flex w-full grow items-center justify-center gap-x-1 rounded-sm px-4 py-2 shadow-sm"
               >
                  {isPending ? (
                     <span>
                        <LoaderCircle size={20} className="animate-spin" />
                     </span>
                  ) : (
                     <>
                        <span>
                           <Check size={20} />
                        </span>
                        Confirm
                     </>
                  )}
               </button>
            )}
         </div>
      </div>
   );
}
