"use client";

import clsx from "clsx";
import { Check, Edit, LoaderCircle, Trash2, X } from "lucide-react";
import { ChangeEvent, useActionState, useRef, useState } from "react";
import { useSidebar } from "../../_components/Sidebar/SidebarContextProvider";
import ProgramDropdown from "./ProgramDropdown";
import CollegeDropdown, { CollegeInfo } from "./CollegeDropdown";
import { useChangeDialogRef, useDialogRef } from "./DialogProvider";
import ReactDOM from "react-dom";
import useIsMounted from "@/lib/useIsMounted";
import editBorrowerRecord from "@/actions/BorrowerRecords/editRecord";
import { toast } from "react-toastify";
import deleteBorrowerRecord from "@/actions/BorrowerRecords/deleteRecord";
import TableRow from "@/components/table/tableRow";
import { programs } from "@/constants";
import { BorrowerModel } from "@/generated/prisma/models";

type EditInfo = {
   id: string;
   name: string;
   idNumber: string;
   yearLevel: number;
   program: string;
   college: string;
};

function BorrowerRow({
   index,
   borrowerRecord,
   onEdit,
}: {
   index: number;
   borrowerRecord: BorrowerModel;
   onEdit: () => void;
}) {
   const [confirmingDelete, setConfirmingDelete] = useState(false);
   const [isPending, setIsPending] = useState(false);

   const onDelete = async () => {
      if (confirmingDelete) {
         setIsPending(true);
         setConfirmingDelete(false);
         const loadingToast = toast.loading(
            `Deleting ${borrowerRecord.idNumber}`,
         );
         const res = await deleteBorrowerRecord(borrowerRecord.id);
         if (res.ok) {
            toast.update(loadingToast, {
               isLoading: false,
               type: "success",
               render: res.data.message,
               autoClose: 3000,
            });
         } else {
            toast.update(loadingToast, {
               isLoading: false,
               type: "error",
               render: res.message,
               autoClose: 3000,
            });
         }
         setIsPending(false);
         return;
      }
      setConfirmingDelete(true);
      setTimeout(() => {
         setConfirmingDelete(false);
      }, 3000);
   };
   return (
      <TableRow
         index={index}
         data={[
            index,
            borrowerRecord.idNumber,
            borrowerRecord.name,
            borrowerRecord.program,
            borrowerRecord.yearLevel,
            borrowerRecord.college,
            <>
               <div className="space-x-3 py-1">
                  <button onClick={onEdit} className="text-blue-700">
                     <Edit size={18} />
                  </button>
                  <button onClick={onDelete} className="text-red-700">
                     {isPending ? (
                        <LoaderCircle size={18} className="animate-spin" />
                     ) : confirmingDelete ? (
                        <Check size={18} />
                     ) : (
                        <Trash2 size={18} />
                     )}
                  </button>
               </div>
            </>,
         ]}
      />
   );
}

export default function BorrowerRecords({
   records,
   startIndex = 0,
}: {
   records: BorrowerModel[];
   startIndex?: number;
}) {
   const editRecordDialogRef = useRef<HTMLDialogElement>(null);
   const { desktop } = useSidebar();
   const currentDialog = useDialogRef();
   const changeCurrentDialog = useChangeDialogRef();

   const [infos, setInfos] = useState<EditInfo>({
      id: "",
      name: "",
      idNumber: "",
      yearLevel: 1,
      program: "",
      college: "",
   });
   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setInfos((prev) =>
         name === "yearLevel"
            ? { ...prev, yearLevel: Number(value) }
            : { ...prev, [name]: value },
      );
   };

   const editNewRow = (info: EditInfo) => {
      if (
         (currentDialog.current?.open &&
            currentDialog.current !== editRecordDialogRef.current) ||
         isPending
      )
         return;

      setInfos(info);
      currentDialog.current?.close();
      editRecordDialogRef.current?.show();
      changeCurrentDialog(editRecordDialogRef);
   };
   const closeDialog = () => {
      editRecordDialogRef.current?.close();
   };
   const onAction = async () => {
      const loadingToast = toast.loading("Updating...");
      const res = await editBorrowerRecord(
         infos.id,
         infos.idNumber,
         infos.name,
         infos.yearLevel,
         infos.program,
         infos.college,
      );

      if (res.ok) {
         closeDialog();
         toast.update(loadingToast, {
            isLoading: false,
            type: "success",
            render: res.data.message,
            autoClose: 3000,
         });
      } else {
         toast.update(loadingToast, {
            type: "error",
            isLoading: false,
            render: res.message,
            autoClose: 3000,
         });
      }
   };
   const [, formAction, isPending] = useActionState(onAction, null);

   const isMounted = useIsMounted();
   return (
      <>
         {records.map((record, i) => (
            <BorrowerRow
               key={record.id}
               index={startIndex + i + 1}
               borrowerRecord={record}
               onEdit={() =>
                  editNewRow({
                     id: record.id,
                     college: record.college,
                     idNumber: record.idNumber,
                     name: record.name,
                     program: record.program,
                     yearLevel: record.yearLevel,
                  })
               }
            />
         ))}
         {isMounted &&
            ReactDOM.createPortal(
               <dialog
                  ref={editRecordDialogRef}
                  className={clsx(
                     "bg-white-primary fixed inset-y-0 m-auto w-[calc(100%-12px)] max-w-125 rounded-xl shadow-md transition-[left] select-none backdrop:bg-transparent",
                     desktop && "md:left-81",
                  )}
               >
                  <div className="font-inter text-white-primary flex items-center justify-between rounded-t-lg bg-blue-400 px-5 py-3 font-medium">
                     <span>Edit record</span>
                     <button onClick={closeDialog}>
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
                           <p className="font-inter w-full rounded-md py-2 font-bold tracking-wider text-gray-600">
                              {infos.idNumber}
                           </p>
                        </label>
                        <label htmlFor="yearLevel" className="self-start">
                           <span className="mb-1 block text-xs text-gray-600">
                              Year Level
                           </span>
                           <input
                              type="number"
                              min={1}
                              max={6}
                              value={infos.yearLevel}
                              onChange={handleChange}
                              id="yearLevel"
                              name="yearLevel"
                              className="font-inter w-full rounded-md p-2 outline-1 outline-gray-200"
                              spellCheck={false}
                              autoComplete="off"
                              required
                           />
                        </label>
                     </div>
                     <label htmlFor="name">
                        <span className="mb-1 block text-xs text-gray-600">
                           Name
                        </span>
                        <input
                           type="text"
                           id="name"
                           name="name"
                           placeholder="Dela Cruz, Juan S. Jr."
                           className="font-inter w-full rounded-md p-2 outline-1 outline-gray-200"
                           spellCheck={false}
                           value={infos.name}
                           onChange={handleChange}
                           autoComplete="off"
                           autoFocus
                           required
                        />
                     </label>
                     <ProgramDropdown
                        value={
                           infos.program as unknown as (typeof programs)[number]
                        }
                        setProgram={(program) => {
                           setInfos((prev) => ({
                              ...prev,
                              program: program as unknown as string,
                           }));
                        }}
                     />
                     <CollegeDropdown
                        value={infos.college as unknown as CollegeInfo}
                        setCollege={(college) => {
                           setInfos((prev) => ({
                              ...prev,
                              college: college as unknown as string,
                           }));
                        }}
                     />
                     <div className="mt-2 flex flex-wrap-reverse items-center justify-end gap-3 self-end">
                        <button
                           type="button"
                           onClick={closeDialog}
                           className="rounded-md bg-black/5 px-4 py-2 shadow-sm"
                        >
                           Cancel
                        </button>
                        <button
                           disabled={isPending}
                           className="flex items-center justify-center rounded-md bg-blue-400 px-4 py-2 text-white shadow-sm"
                        >
                           {isPending ? (
                              <LoaderCircle className="animate-spin" />
                           ) : (
                              "Edit"
                           )}
                        </button>
                     </div>
                  </form>
               </dialog>,
               document.getElementById("portal-container")!,
            )}
      </>
   );
}
