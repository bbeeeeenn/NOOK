"use client";

import { adminLoginPage } from "@/constants";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function LogoutButton() {
   const [isSigningOut, setIsSigningOut] = useState(false);
   const handleLogout = async () => {
      if (isSigningOut) return;
      setIsSigningOut(true);
      await signOut({ redirect: false });
      window.location.href = adminLoginPage;
   };
   return (
      <>
         <button
            className="bg-yellow-primary  outline-yellow-primary relative mt-10 flex h-12 w-full items-center gap-2 rounded-md p-3 font-semibold shadow-md outline-offset-2 focus-visible:outline-2 active:brightness-105 disabled:pointer-events-none disabled:opacity-80"
            onClick={handleLogout}
            disabled={isSigningOut}
         >
            <span className="absolute">
               <LogOut />
            </span>
            <span className="mx-auto truncate">Sign out</span>
         </button>
         {isSigningOut && (
            <div className="bg-green-primary fixed inset-0 z-1000">
               <Image
                  src={"/nook.svg"}
                  alt="NOOK"
                  width={500}
                  height={500}
                  className="absolute inset-0 m-auto w-40 animate-bounce"
               />
            </div>
         )}
      </>
   );
}
