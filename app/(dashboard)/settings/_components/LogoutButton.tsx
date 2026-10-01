"use client";

import { adminLoginPage } from "@/constants";
import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function LogoutButton() {
   const [isLoading, setIsLoading] = useState(false);
   const handleLogout = async () => {
      if (isLoading) return;
      setIsLoading(true);
      await signOut({ redirect: false });
      setIsLoading(false);
      window.location.href = adminLoginPage;
   };
   return (
      <button
         className="bg-yellow-primary font-inter outline-yellow-primary relative mt-10 flex h-12 w-full items-center gap-2 rounded-md p-3 font-semibold shadow-md outline-offset-2 hover:outline-2 focus-visible:outline-2 active:brightness-105 disabled:pointer-events-none disabled:opacity-80"
         onClick={handleLogout}
         disabled={isLoading}
      >
         <span className="absolute">
            {isLoading ? <LoaderCircle className="animate-spin" /> : <LogOut />}
         </span>
         <span className="mx-auto truncate">
            {!isLoading ? "Sign out" : "Signing out..."}
         </span>
      </button>
   );
}
