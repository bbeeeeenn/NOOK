"use client";
import { adminLoginPage, homePage, privacyPolicyPage } from "@/constants";
import clsx from "clsx";
import { ChevronRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Topbar() {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <nav>
         <div className="bg-white-primary fixed inset-x-0 top-0 z-100 flex justify-between px-5 py-3.75 text-lg sm:pl-10">
            <Image
               src={"/CSUBrandLogo.svg"}
               alt="CSU LOGO"
               width={200}
               height={200}
               className="h-10 w-auto"
            />
            <button
               className="sm:hidden"
               onClick={() => setIsOpen((prev) => !prev)}
            >
               <Menu />
            </button>
            <div className="font-inter hidden grow items-center justify-end gap-10 px-5 sm:flex">
               <Link
                  href={homePage}
                  className="w-19 text-center hover:font-bold hover:text-[#FBBC05]"
               >
                  Home
               </Link>
               <Link
                  href={privacyPolicyPage}
                  className="w-31 text-center hover:font-bold hover:text-[#FBBC05]"
               >
                  Privacy Policy
               </Link>
               <Link
                  href={adminLoginPage}
                  className="w-19 text-center hover:font-bold hover:text-[#FBBC05]"
               >
                  Login
               </Link>
            </div>
         </div>

         {/* Mobile */}
         <div
            className={clsx(
               "font-inter bg-white-primary fixed inset-x-0 top-14 overflow-y-hidden text-lg font-medium shadow-md transition-[height] duration-300 sm:hidden",
               isOpen ? "h-39" : "h-0",
            )}
            onClick={() => setIsOpen(false)}
         >
            <Link
               href={homePage}
               className="relative block w-full py-3 text-center active:bg-gray-100"
            >
               Home
               <span className="absolute inset-y-0 right-4 flex items-center">
                  <ChevronRight />
               </span>
            </Link>
            <Link
               href={privacyPolicyPage}
               className="relative block w-full py-3 text-center active:bg-gray-100"
            >
               Privacy Policy
               <span className="absolute inset-y-0 right-4 flex items-center">
                  <ChevronRight />
               </span>
            </Link>
            <Link
               href={adminLoginPage}
               className="relative block w-full py-3 text-center active:bg-gray-100"
            >
               Login
               <span className="absolute inset-y-0 right-4 flex items-center">
                  <ChevronRight />
               </span>
            </Link>
         </div>
      </nav>
   );
}
