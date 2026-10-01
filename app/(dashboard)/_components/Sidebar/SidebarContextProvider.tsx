"use client";
import React, { createContext, useContext, useState } from "react";

type SidebarSwitches = {
   desktop: boolean;
   mobile: boolean;
};
type SidebarToggle = (value?: boolean) => void;

const sidebarContext = createContext<SidebarSwitches>({
   desktop: false,
   mobile: false,
});
const toggleDesktopContext = createContext<SidebarToggle>(() => {});
const toggleMobileContext = createContext<SidebarToggle>(() => {});

export function SidebarContextProvider({
   children,
}: {
   children: React.ReactNode;
}) {
   const [sidebars, setSidebars] = useState<SidebarSwitches>({
      desktop: true,
      mobile: false,
   });
   const toggleMobile = (value?: boolean) => {
      setSidebars((prev) => ({
         ...prev,
         mobile: value === undefined ? !prev.mobile : value,
      }));
   };
   const toggleDesktop = (value?: boolean) => {
      setSidebars((prev) => ({
         ...prev,
         desktop: value === undefined ? !prev.desktop : value,
      }));
   };
   return (
      <sidebarContext.Provider value={sidebars}>
         <toggleDesktopContext.Provider value={toggleDesktop}>
            <toggleMobileContext.Provider value={toggleMobile}>
               {children}
            </toggleMobileContext.Provider>
         </toggleDesktopContext.Provider>
      </sidebarContext.Provider>
   );
}

export function useSidebar() {
   return useContext(sidebarContext);
}

export function useMobileSidebarToggle() {
   return useContext(toggleMobileContext);
}

export function useDesktopSidebarToggle() {
   return useContext(toggleDesktopContext);
}
