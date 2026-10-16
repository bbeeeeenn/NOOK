"use client";
import { Library } from "@/components/Images";
import { Scanner } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import FinalizeDialog from "./_components/finalizeDialog";

export type BorrowData = {
   borrowerId: string;
   bookCode: string;
};

type Process = {
   label: string;
   description: string;
   name: keyof BorrowData;
   inputValue: string;
   placeholder: string;
   optional?: boolean;
};

export default function ScannerPage() {
   // States
   const [infos, setInfos] = useState<BorrowData>({
      borrowerId: "",
      bookCode: "",
   });
   const finalizeDialogRef = useRef<HTMLDialogElement>(null);

   // Steps
   const [step, setStep] = useState(0);
   const processSteps: Process[] = [
      {
         label: "Student ID",
         description:
            "If no student match is found, the log is still added with blank student fields, and a pending registration is created. Once completed, those details are filled in automatically.",
         placeholder: "e.g. 241-04321",
         name: "borrowerId",
         inputValue: infos.borrowerId,
      },
      {
         label: "Book Barcode",
         description: "Scan the book’s barcode, or enter it manually above.",
         placeholder: "e.g. CSUL000...",
         name: "bookCode",
         inputValue: infos.bookCode,
      },
   ];
   const currentStep = processSteps[step];

   // functions
   const toggleFinalizeDialog = () => {
      if (!finalizeDialogRef.current) return;
      if (finalizeDialogRef.current.open) {
         finalizeDialogRef.current.close();
      } else {
         finalizeDialogRef.current.showModal();
      }
   };
   const nextStep = () => {
      if (step === processSteps.length - 1) toggleFinalizeDialog();
      if (currentStep.inputValue || currentStep.optional)
         setStep((prev) => (prev + 1 < processSteps.length ? prev + 1 : prev));
   };
   const prevStep = () => setStep((prev) => (prev - 1 >= 0 ? prev - 1 : prev));

   const resetAll = () => {
      setInfos({ bookCode: "", borrowerId: "" });
      setStep(0);
   };

   const sent = useRef(false);
   useEffect(() => {
      if (!sent.current) window.alert("This page is about to be changed.");
      sent.current = true;
   }, []);

   return (
      <div className="relative min-h-[calc(100dvh-85px)] bg-[#003300]/90 p-7 select-none">
         <Library className="absolute inset-0 -z-10 size-full object-cover" />

         {/* Scanner */}
         <div className="mx-auto max-w-100">
            <div className="relative">
               <Scanner
                  onScan={([detectedCode]) =>
                     setInfos((prev) => {
                        const newState = { ...prev };
                        newState[currentStep.name] = detectedCode.rawValue;
                        return newState;
                     })
                  }
                  allowMultiple
                  scanDelay={1000}
                  classNames={{
                     container: clsx(
                        "rounded-2xl border-2 w-full border-green-primary bg-white-primary/10",
                     ),
                  }}
               />
               <p className="text-white-primary font-inter bg-green-primary absolute inset-x-0 bottom-0 mx-auto w-fit translate-y-1/2 rounded-md px-3 py-2 font-semibold tracking-wide">
                  {currentStep.label}
               </p>
            </div>

            {/* Input */}
            <form
               onSubmit={(e) => {
                  e.preventDefault();
                  nextStep();
               }}
            >
               <input
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  value={currentStep.inputValue ?? ""}
                  onChange={(e) =>
                     setInfos((prev) => {
                        const newState = { ...prev };
                        newState[currentStep.name] = e.target.value;
                        return newState;
                     })
                  }
                  placeholder={currentStep.placeholder}
                  className="bg-green-primary/50 w-50% font-inter border-green-primary text-white-primary mt-10 w-full rounded-md border-2 p-1.5 text-center font-medium outline-none"
               />
               <p className="font-inter my-4 text-center text-sm text-white/80">
                  {currentStep.description}
               </p>
            </form>
            <div className="flex justify-between gap-2">
               {step > 0 && (
                  <button
                     className="bg-yellow-primary font-inter flex items-center justify-center rounded-md px-3 py-2 font-semibold"
                     onClick={prevStep}
                  >
                     <ChevronLeft />
                  </button>
               )}

               {step + 1 < processSteps.length ? (
                  <button
                     className={clsx(
                        "bg-yellow-primary font-inter w-full gap-2 rounded-md px-3 py-2 font-semibold",
                        !currentStep.inputValue &&
                           !currentStep.optional &&
                           "pointer-events-none opacity-50",
                     )}
                     onClick={nextStep}
                  >
                     Continue
                  </button>
               ) : (
                  <button
                     className={clsx(
                        "bg-yellow-primary font-inter w-full gap-2 rounded-md px-3 py-2 font-semibold",
                     )}
                     onClick={toggleFinalizeDialog}
                  >
                     Review
                  </button>
               )}
            </div>
         </div>
         <FinalizeDialog
            infos={infos}
            ref={finalizeDialogRef}
            toggle={toggleFinalizeDialog}
            resetAll={resetAll}
         />
      </div>
   );
}
