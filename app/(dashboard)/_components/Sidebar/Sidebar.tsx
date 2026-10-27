"use client";

import clsx from "clsx";
import React from "react";
import {
   useDesktopSidebarToggle,
   useMobileSidebarToggle,
   useSidebar,
} from "./SidebarContextProvider";
import {
   BookText,
   LucideIcon,
   Menu,
   NotepadText,
   ScanLine,
   ScrollText,
   Settings,
   UserRound,
   X,
} from "lucide-react";
import { Nook1 } from "@/components/Images";
import {
   logsPage,
   scannerPage,
   settingsPage,
   borrowerRecordsPage,
   reportsPage,
   bookRecordsPage,
} from "@/constants";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import LinkItem from "./Link";

const links: {
   label: string;
   route: string;
   icon: LucideIcon;
   admin?: boolean;
}[][] = [
   [
      { label: "Borrow Logs", route: logsPage, icon: NotepadText },
      { label: "Scanner", route: scannerPage, icon: ScanLine },
      { label: "Reports", icon: ScrollText, route: reportsPage },
   ],
   [
      {
         label: "Student Records",
         route: borrowerRecordsPage,
         icon: UserRound,
         admin: true,
      },
      {
         label: "Book Records",
         route: bookRecordsPage,
         icon: BookText,
         admin: true,
      },
   ],
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
   const session = useSession();
   const sidebarSwitch = useSidebar();
   const toggleDesktopSidebar = useDesktopSidebarToggle();
   const toggleMobileSidebar = useMobileSidebarToggle();
   const pathname = usePathname();

   return (
      <>
         <aside
            className={clsx(
               "fixed z-100 flex h-dvh w-full flex-col overflow-auto bg-[#34A853] px-7 py-5 transition-[transform_shadow] select-none sm:w-80 sm:px-4 md:shadow-none",
               sidebarSwitch.mobile
                  ? "translate-x-0 sm:shadow-[0_0_0_3000px_rgba(0,0,0,0.1)]"
                  : "-translate-x-full",
               sidebarSwitch.desktop
                  ? "md:translate-x-0"
                  : "md:-translate-x-full",
            )}
            inert={!sidebarSwitch.mobile && !sidebarSwitch.desktop}
         >
            <button
               className="text-white-primary absolute top-4 left-4 md:hidden"
               onClick={() => toggleMobileSidebar()}
            >
               <X size={30} />
            </button>
            <Nook1 width={180} className="m-auto mt-15 mb-10 w-45" />
            <div className="font-inter text-white-primary text-lg font-medium">
               {links.map((group, i) => (
                  <React.Fragment key={i}>
                     <div className="space-y-1">
                        {group.map(
                           (link) =>
                              (!link.admin ||
                                 session.data?.user.userType === "Admin") && (
                                 <LinkItem
                                    key={link.route}
                                    href={link.route}
                                    label={link.label}
                                 >
                                    <link.icon />
                                 </LinkItem>
                              ),
                        )}
                     </div>
                     {i + 1 < links.length && (
                        <div className="mx-auto my-3 h-px bg-white/30" />
                     )}
                  </React.Fragment>
               ))}
            </div>
            <div className="font-inter text-white-primary mt-auto text-lg font-medium">
               {/* the same as the previous div with `mt-auto` to separate them */}
               <LinkItem
                  href={settingsPage}
                  label={session.data?.user.name ?? "Account"}
               >
                  {session.data?.user.image ? (
                     <Image
                        src={session.data.user.image}
                        width={100}
                        height={100}
                        alt=""
                        className="size-7 rounded-md outline-1"
                     />
                  ) : (
                     <span>
                        <Settings />
                     </span>
                  )}
               </LinkItem>
            </div>
         </aside>

         {/* Header */}
         <header
            className={clsx(
               "bg-green-primary fixed inset-x-0 top-0 z-90 flex h-15 items-center px-4 shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-[left] select-none",
               sidebarSwitch.desktop && "md:left-81",
            )}
         >
            <button
               className="text-white-primary hidden md:block"
               onClick={() => toggleDesktopSidebar()}
            >
               <Menu size={30} />
            </button>
            <button
               className="text-white-primary md:hidden"
               onClick={() => toggleMobileSidebar()}
            >
               <Menu size={30} />
            </button>
            <p className="font-inter text-white-primary ml-3 text-xl font-medium">
               {[
                  ...links.flat(),
                  { route: settingsPage, label: "Settings" },
               ].find((e) => pathname.includes(e.route))?.label ?? ""}
            </p>
         </header>

         {/* Content */}
         <main
            className={clsx(
               "min-h-screen pt-15 pb-6.25 transition-[padding]",
               sidebarSwitch.desktop && "md:pl-81",
               sidebarSwitch.mobile && "overflow-hidden sm:overflow-auto",
            )}
         >
            {children}
         </main>

         <footer
            className={clsx(
               "bg-green-primary fixed inset-x-0 bottom-0 h-6.25 transition-[left]",
               sidebarSwitch.desktop && "md:left-81",
            )}
         />
      </>
   );
}
