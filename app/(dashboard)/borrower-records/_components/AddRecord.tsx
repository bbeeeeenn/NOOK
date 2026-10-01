"use client";

import { Download, LoaderCircle, Plus, X } from "lucide-react";
import React, { useActionState, useRef, useState } from "react";
import { useSidebar } from "../../_components/Sidebar/SidebarContextProvider";
import clsx from "clsx";
import ProgramDropdown from "./ProgramDropdown";
import CollegeDropdown, { CollegeInfo } from "./CollegeDropdown";
import addBorrowerRecord from "@/actions/BorrowerRecords/addRecord";
import { toast } from "react-toastify";
import { useChangeDialogRef, useDialogRef } from "./DialogProvider";
import { useRouter } from "next/navigation";
import { importBorrowerRecordsPage, programs } from "@/constants";

type Infos = {
   program: (typeof programs)[number] | null;
   college: CollegeInfo | null;
};

export default function AddRecord() {
   const router = useRouter();
   const { desktop } = useSidebar();
   const [infos, setInfos] = useState<Infos>({
      program: null, // These are actually strings. IDK why but I know I am using shadcn@latest wrong...
      college: null, // These are actually strings. IDK why but I know I am using shadcn@latest wrong...
   });

   const setProgram = (program: (typeof programs)[number] | null) => {
      setInfos((prev) => ({ ...prev, program }));
   };
   const setCollege = (college: CollegeInfo | null) => {
      setInfos((prev) => ({ ...prev, college }));
   };

   const addRecordDialogRef = useRef<HTMLDialogElement>(null);
   const dialog = useDialogRef();
   const changeDialog = useChangeDialogRef();

   const toggleDialog = (state?: boolean) => {
      if (dialog.current?.open && dialog.current !== addRecordDialogRef.current)
         return;
      if (addRecordDialogRef.current) {
         if (state === undefined) {
            if (addRecordDialogRef.current.open) {
               addRecordDialogRef.current.close();
            } else {
               dialog.current?.close();
               changeDialog(addRecordDialogRef);
               addRecordDialogRef.current.show();
            }
         } else {
            if (state) {
               dialog.current?.close();
               changeDialog(addRecordDialogRef);
               addRecordDialogRef.current.show();
            } else {
               addRecordDialogRef.current.close();
            }
         }
      }
   };

   const onAction = async (
      _: { idNumber: string; yearLevel: number; name: string },
      formData: FormData,
   ): Promise<{ idNumber: string; yearLevel: number; name: string }> => {
      const idNumber = ((formData.get("idnumber") ?? "") as string).trim();
      const name = ((formData.get("name") ?? "") as string).trim();
      const program = ((formData.get("program") ?? "") as string)
         .trim()
         .toUpperCase();
      const college = ((formData.get("college") ?? "") as string)
         .trim()
         .toUpperCase();
      const yearLevel = parseInt(
         (formData.get("yearlevel") ?? "1") as string,
         10,
      );
      const res = await addBorrowerRecord(
         idNumber,
         name,
         yearLevel,
         program,
         college,
      );
      if (res.ok) {
         toggleDialog(false);
         setCollege(null);
         setProgram(null);
         toast.success(res.data.message);
         return { idNumber: "", name: "", yearLevel: 1 };
      } else {
         toast.error(res.message);
         return { idNumber, name, yearLevel };
      }
   };
   const [state, formAction, isPending] = useActionState(onAction, {
      idNumber: "",
      yearLevel: 1,
      name: "",
   });

   return (
      <>
         <dialog
            ref={addRecordDialogRef}
            className={clsx(
               "bg-white-primary fixed inset-y-0 m-auto w-[calc(100%-12px)] max-w-125 rounded-xl shadow-md transition-[left] select-none backdrop:bg-transparent",
               desktop && "md:left-81",
            )}
         >
            <div className="bg-green-primary font-inter text-white-primary flex items-center justify-between rounded-t-lg px-5 py-3 font-medium">
               <span>Add record</span>
               <button onClick={() => toggleDialog(false)}>
                  <X size={17} />
               </button>
            </div>
            <form
               action={formAction}
               onSubmit={(e) => {
                  if (isPending) e.preventDefault();
               }}
               className="flex flex-col items-stretch gap-y-3 p-5 pb-4"
            >
               <div className="flex gap-2">
                  <label htmlFor="idnumber" className="grow">
                     <span className="mb-1 block text-xs text-gray-600">
                        ID Number
                     </span>
                     <input
                        type="text"
                        id="idnumber"
                        name="idnumber"
                        placeholder="201-00123"
                        className="font-inter w-full rounded-md p-2 outline-1 outline-gray-200"
                        spellCheck={false}
                        autoComplete="off"
                        autoFocus
                        defaultValue={state.idNumber}
                        required
                     />
                  </label>
                  <label htmlFor="yearlevel" className="self-start">
                     <span className="mb-1 block text-xs text-gray-600">
                        Year Level
                     </span>
                     <input
                        type="number"
                        min={1}
                        max={6}
                        defaultValue={state.yearLevel}
                        id="yearlevel"
                        name="yearlevel"
                        placeholder="Dela Cruz, Juan S. Jr."
                        className="font-inter w-full rounded-md p-2 outline-1 outline-gray-200"
                        spellCheck={false}
                        autoComplete="off"
                        required
                     />
                  </label>
               </div>
               <label htmlFor="name">
                  <span className="mb-1 block text-xs text-gray-600">Name</span>
                  <input
                     type="text"
                     id="name"
                     name="name"
                     placeholder="Dela Cruz, Juan S. Jr."
                     className="font-inter w-full rounded-md p-2 outline-1 outline-gray-200"
                     spellCheck={false}
                     defaultValue={state.name}
                     autoComplete="off"
                     required
                  />
               </label>
               <ProgramDropdown value={infos.program} setProgram={setProgram} />
               <CollegeDropdown value={infos.college} setCollege={setCollege} />
               <div className="mt-2 flex flex-wrap-reverse items-center justify-end gap-3 self-stretch">
                  <button
                     type="button"
                     onClick={() => {
                        router.push(importBorrowerRecordsPage);
                        toggleDialog(false);
                     }}
                     className="mr-auto flex items-center gap-1 rounded-md bg-blue-300 px-4 py-2 text-white shadow-sm"
                  >
                     <span>
                        <Download size={17} />
                     </span>
                     Import
                  </button>
                  <button
                     type="button"
                     onClick={() => toggleDialog(false)}
                     className="rounded-md bg-black/5 px-4 py-2 shadow-sm"
                  >
                     Cancel
                  </button>
                  <button
                     disabled={isPending}
                     className="bg-yellow-primary flex items-center justify-center rounded-md px-4 py-2 shadow-sm"
                  >
                     {isPending ? (
                        <LoaderCircle className="animate-spin text-black/70" />
                     ) : (
                        "Submit"
                     )}
                  </button>
               </div>
            </form>
         </dialog>

         {/* Add Button */}
         <button
            className="bg-green-primary text-white-primary outline-green-primary fixed right-5 bottom-10 rounded-lg p-2.5 shadow-sm outline-offset-2 transition-[scale] focus-visible:outline-2 active:scale-95 lg:right-10 lg:bottom-15"
            onClick={() => toggleDialog()}
         >
            <Plus />
         </button>
      </>
   );
}
