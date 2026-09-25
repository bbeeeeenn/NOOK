"use client";
import { Nook1 } from "@/components/Images";
import { logsPage } from "@/constants";
import clsx from "clsx";
import {
   Eye,
   EyeOff,
   LoaderCircle,
   Square,
   SquareCheckBig,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

export default function Login() {
   const router = useRouter();
   const [credentials, setCredentials] = useState({
      email: "",
      password: "",
   });
   const [isPending, setIsPending] = useState(false);

   const handleCredentialsSubmit = async (e: SubmitEvent) => {
      e.preventDefault();
      if (isPending) return;
      setIsPending(true);

      const email = credentials.email;
      const password = credentials.password;
      const response = (await signIn("credentials", {
         email,
         password,
         redirect: false,
      }))!;
      if (!response.ok) {
         toast.error(
            response.status === 401
               ? "Invalid credentials"
               : "Unexpecred error occured",
         );
      } else {
         router.replace(logsPage);
      }
      setIsPending(false);
   };
   const handleGoogle = () => signIn("google", { callbackUrl: logsPage });

   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const toggleShowPassword = () => setShowPassword((prev) => !prev);
   const toggleRememberMe = () => setRememberMe((prev) => !prev);
   return (
      <form
         onSubmit={handleCredentialsSubmit}
         className="bg-white-primary/15 text-white-primary mx-auto h-fit min-h-100 w-full max-w-110 rounded-[30px] px-6 pt-4 pb-6 shadow-[2px_5px_6.3px_-1px_rgba(0,0,0,0.25),inset_3px_3px_0px_-2px_#c3ffd699,inset_-3px_-2px_2px_-2px_#c3ffd699] backdrop-blur-sm sm:px-8 sm:pb-8"
      >
         <Nook1 className="mx-auto mt-4 w-30" />
         <div className="mt-6">
            <label htmlFor="email" className="text-xs font-light tracking-wide">
               Email Address
            </label>
            <div className="rounded-md p-3 tracking-wide shadow-[inset_2.5px_2.5px_0px_-2px_#c3ffd699,inset_-3px_-2px_2px_-2px_#c3ffd699] backdrop-blur-xs">
               <input
                  type="text"
                  id="email"
                  className="block w-full outline-none"
                  spellCheck={false}
                  onChange={(e) =>
                     setCredentials((prev) => ({
                        ...prev,
                        email: e.target.value,
                     }))
                  }
               />
            </div>
         </div>
         <div className="mt-1">
            <label
               htmlFor="password"
               className="text-xs font-light tracking-wide"
            >
               Password
            </label>
            <div className="flex w-full gap-x-2 rounded-md p-3 shadow-[inset_2.5px_2.5px_0px_-2px_#c3ffd699,inset_-3px_-2px_2px_-2px_#c3ffd699] backdrop-blur-xs">
               <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={clsx(
                     "w-full outline-none",
                     showPassword ? "tracking-wide" : "tracking-widest",
                  )}
                  onChange={(e) =>
                     setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                     }))
                  }
               />
               <button
                  className="flex items-center"
                  type="button"
                  onClick={toggleShowPassword}
               >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
               </button>
            </div>
         </div>
         <div className="my-4 flex flex-wrap justify-between gap-2 text-xs font-light">
            <div>
               <button
                  className="flex items-center gap-x-1.5"
                  type="button"
                  onClick={toggleRememberMe}
               >
                  <span>
                     {rememberMe ? (
                        <SquareCheckBig size={15} />
                     ) : (
                        <Square size={15} />
                     )}
                  </span>
                  <span className="truncate">Remember me</span>
               </button>
            </div>
            <Link href={""} className="truncate">
               Forgot Password ?
            </Link>
         </div>
         <button
            disabled={isPending}
            className="bg-green-primary from-white-primary/12 flex w-full items-center justify-center rounded-lg bg-linear-to-b to-transparent py-3 text-sm font-light outline-1 outline-[#375DFB]"
         >
            {isPending ? (
               <LoaderCircle className="animate-spin" size={20} />
            ) : (
               "Log In"
            )}
         </button>
         <div className="my-5 flex items-center gap-4 px-4 text-sm font-light">
            <div className="bg-white-primary h-px grow" />
            <p>or</p>
            <div className="bg-white-primary h-px grow" />
         </div>
         <button
            className="bg-white-primary flex w-full items-center justify-center gap-2 rounded-lg py-2 font-medium text-black"
            type="button"
            onClick={handleGoogle}
         >
            <span className="text-xl">
               <FcGoogle />
            </span>
            Continue with Google
         </button>
      </form>
   );
}
