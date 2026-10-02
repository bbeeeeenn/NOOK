"use client";

import changePasswordAction from "@/actions/AdminSettings/ChangePassword";
import clsx from "clsx";
import { Eye, EyeClosed, SquarePen } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useActionState, useState } from "react";
import { toast } from "react-toastify";

const PasswordInput = ({
   label,
   name,
   value,
   handler,
   error,
}: {
   label: string;
   name: string;
   value: string;
   handler: (e: ChangeEvent<HTMLInputElement>) => void;
   error?: boolean;
}) => {
   const [showPassword, setShowPassword] = useState(false);
   return (
      <>
         <label
            htmlFor={name}
            className={clsx(
               "font-inter mt-2 mb-1 block text-sm font-light",
               "text-white-primary",
            )}
         >
            {label}{" "}
            {error && (
               <small className="text-red-600">
                  (Passwords don&apos;t match)
               </small>
            )}
         </label>
         <div
            className={clsx(
               "flex items-stretch gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-0.5",
               error && "outline-2 outline-red-600",
            )}
         >
            <span className="shrink-0 self-center">
               <Image
                  src={"/lock.svg"}
                  width={24}
                  height={24}
                  alt=""
                  className="size-auto"
               />
            </span>
            <input
               autoComplete="off"
               spellCheck={false}
               id={name}
               type={showPassword ? "text" : "password"}
               name={name}
               required
               value={value}
               onChange={handler}
               className="w-full py-2.5 text-sm font-normal tracking-widest outline-none"
            />
            <button
               tabIndex={-1}
               className="self-center"
               onClick={() => setShowPassword((prev) => !prev)}
               type="button"
            >
               {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
         </div>
      </>
   );
};

export default function ChangePassword({
   email,
   noPassword,
}: {
   email: string;
   noPassword: boolean;
}) {
   const [password, setPassword] = useState({
      current: "",
      new: "",
      confirm: "",
   });
   const match =
      !password.new || !password.confirm || password.new === password.confirm;

   const onAction = async (): Promise<void> => {
      if (password.new !== password.confirm || isPending) {
         toast.error("Passwords don't match");
         return;
      }
      if (
         password.new.length < 8 ||
         (!noPassword && password.current.length < 8)
      ) {
         toast.error("Password must be at least 8 characters long");
         return;
      }

      const res = await changePasswordAction(password.new, password.current);
      if (!res.ok) {
         toast.error(res.message);
         return;
      }
      toast.success("Password changed successfully");
      setPassword({ confirm: "", current: "", new: "" });
   };
   const [, formAction, isPending] = useActionState(onAction, null);

   return (
      <form action={formAction} className="font-inter mt-10 font-medium">
         <input type="hidden" name="username" value={email} />
         {!noPassword && (
            <PasswordInput
               label="Current Password"
               name="currentpassword"
               value={password.current}
               handler={(e) => {
                  setPassword((prev) => ({ ...prev, current: e.target.value }));
               }}
            />
         )}
         <PasswordInput
            label="New Password"
            name="password"
            value={password.new}
            handler={(e) => {
               setPassword((prev) => ({ ...prev, new: e.target.value }));
            }}
            error={!match}
         />
         <PasswordInput
            label="Confirm Password"
            name="confirmpassword"
            value={password.confirm}
            handler={(e) => {
               setPassword((prev) => ({ ...prev, confirm: e.target.value }));
            }}
            error={!match}
         />
         {(password.confirm || password.current || password.new) && (
            <button className="bg-yellow-primary font-roboto mt-4 flex w-full items-center justify-center gap-2 rounded-lg p-2 font-medium shadow-md hover:brightness-105 active:brightness-95">
               <span>
                  <SquarePen size={17} />
               </span>
               Change Password
            </button>
         )}
      </form>
   );
}
