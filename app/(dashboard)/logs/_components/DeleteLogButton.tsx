"use client";

import deleteBorrowLog from "@/actions/BorrowLogs/deleteBorrowLog";
import { logsPage } from "@/constants";
import { Trash2, X } from "lucide-react";
import { toast, UpdateOptions } from "react-toastify";

const toastOptions: UpdateOptions = {
   isLoading: false,
   containerId: logsPage,
   autoClose: 3000,
   pauseOnHover: false,
};

function Prompt({ logId }: { logId: string }) {
   const handleDelete = async () => {
      toast.dismiss(logId);
      const loadingToast = toast.loading("Processing...", {
         containerId: logsPage,
      });
      try {
         const result = await deleteBorrowLog(logId);

         if (result.ok) {
            toast.update(loadingToast, {
               ...toastOptions,
               type: "success",
               render: result.data.message,
            });
            return;
         }

         toast.update(loadingToast, {
            ...toastOptions,
            type: "error",
            render: result.message,
         });
      } catch {
         toast.dismiss(logId);
         toast.update(loadingToast, {
            ...toastOptions,
            type: "error",
            render: "Unable to delete borrow log.",
         });
      }
   };

   return (
      <div className="w-full space-y-2">
         <p className="text-center">Delete this log?</p>
         <div className="flex gap-2">
            <button
               className="flex grow items-center justify-center gap-2 rounded-sm bg-red-400 p-1 text-white"
               onClick={handleDelete}
            >
               <span>
                  <Trash2 size={18} />
               </span>
               Delete
            </button>
            <button
               className="rounded-sm bg-gray-100 p-1 px-3"
               onClick={() => toast.dismiss(logId)}
            >
               <X />
            </button>
         </div>
      </div>
   );
}

export default function DeleteLogButton({ logId }: { logId: string }) {
   const handleCLick = () => {
      toast(<Prompt logId={logId} />, {
         autoClose: false,
         toastId: logId,
         closeOnClick: false,
         containerId: logsPage,
      });
   };

   return (
      <button
         onClick={handleCLick}
         className="rounded-sm bg-gray-200 px-5 py-1.5 transition-colors duration-75 hover:bg-red-500 hover:text-white hover:shadow-sm"
      >
         <Trash2 size={16} />
      </button>
   );
}
