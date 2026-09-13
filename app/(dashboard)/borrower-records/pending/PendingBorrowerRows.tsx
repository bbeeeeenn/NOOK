"use client";
import TableRow from "@/components/table/tableRow";
import useIsMounted from "@/lib/useIsMounted";
import ReactDOM from "react-dom";
import ProgramDropdown from "../_components/ProgramDropdown";
import CollegeDropdown, { CollegeInfo } from "../_components/CollegeDropdown";
import { ChangeEvent, useActionState, useRef, useState } from "react";
import clsx from "clsx";
import { useSidebar } from "../../_Sidebar/SidebarContextProvider";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { programs } from "@/constants";
import registerPendingBorrower from "@/actions/PendingRegistration/registerPendingBorrower";
import { Prisma } from "@/generated/prisma/client";

type BorrowerInfo = {
   name: string;
   idNumber: string;
   yearLevel: number;
   program: string;
   college: string;
};

export default function PendingBorrowerRows({
   pendingRecords,
}: {
   pendingRecords: (Prisma.PickEnumerable<
      Prisma.PendingBorrowLogGroupByOutputType,
      "idNumber"[]
   > & {
      _count: number;
   })[];
}) {
   const isMounted = useIsMounted();
   const pendingRegistrationDialogRef = useRef<HTMLDialogElement>(null);
   const { desktop } = useSidebar();

   const [infos, setInfos] = useState<BorrowerInfo>({
      name: "",
      idNumber: "",
      yearLevel: 0,
      program: "",
      college: "",
   });

   const closeDialog = () => {
      pendingRegistrationDialogRef.current?.close();
   };

   const onRegister = (info: BorrowerInfo) => {
      setInfos(info);
      pendingRegistrationDialogRef.current?.show();
   };

   const onAction = async () => {
      const loadingToast = toast.loading("Creating...");
      const res = await registerPendingBorrower(
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

   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setInfos((prev) =>
         name === "yearLevel"
            ? { ...prev, yearLevel: Number(value) }
            : { ...prev, [name]: value },
      );
   };

   return (
      <>
         {pendingRecords.map((p, i) => (
            <TableRow
               key={p.idNumber}
               index={i}
               data={[
                  p.idNumber,
                  p._count,
                  <>
                     <button
                        onClick={() =>
                           onRegister({
                              idNumber: p.idNumber,
                              name: "",
                              yearLevel: 1,
                              college: "",
                              program: "",
                           })
                        }
                        className="bg-green-primary text-white-primary rounded-md px-3 py-1.5 font-medium shadow-md"
                     >
                        Register
                     </button>
                  </>,
               ]}
            />
         ))}
         {isMounted &&
            ReactDOM.createPortal(
               <dialog
                  ref={pendingRegistrationDialogRef}
                  className={clsx(
                     "bg-white-primary fixed inset-y-0 m-auto w-[calc(100%-12px)] max-w-125 rounded-xl shadow-md transition-[left] select-none backdrop:bg-transparent",
                     desktop && "md:left-81",
                  )}
               >
                  <div className="font-inter text-white-primary bg-green-primary flex items-center justify-between rounded-t-lg px-5 py-3 font-medium">
                     <span>Register {infos.idNumber}</span>
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
                           className="bg-green-primary flex items-center justify-center rounded-md px-4 py-2 text-white shadow-sm"
                        >
                           {isPending ? (
                              <LoaderCircle className="animate-spin" />
                           ) : (
                              "Register"
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
