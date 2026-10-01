import type { Metadata } from "next";
import {
   Inter,
   Funnel_Sans,
   Roboto,
   Geist,
   IBM_Plex_Sans,
} from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { AuthProvider } from "./sessionProvider";
import { ToastContainer } from "react-toastify";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const funnelSans = Funnel_Sans({
   variable: "--font-funnel-sans",
   subsets: ["latin"],
});

const inter = Inter({
   variable: "--font-inter",
   subsets: ["latin"],
});
const roboto = Roboto({
   variable: "--font-roboto",
   subsets: ["latin"],
});
const plexSans = IBM_Plex_Sans({
   variable: "--font-plex-sans",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Nook",
   description: "",
   verification: { google: "3YB1Upi4xtlWnOM7gn8VBJG_nCaJBDXY-XGhN312dsk" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
   return (
      <html
         lang="en"
         className={cn(
            clsx(
               funnelSans.variable,
               inter.variable,
               roboto.variable,
               plexSans.variable,
               "h-full antialiased",
            ),
            "font-sans",
            geist.variable,
         )}
      >
         <body className="flex min-h-full flex-col bg-[#f9fafb] select-none">
            <SpeedInsights />
            <ToastContainer
               position="bottom-right"
               closeButton={false}
               closeOnClick
               toastClassName={"font-semibold select-none"}
               pauseOnHover={false}
               autoClose={3000}
            />
            <AuthProvider>{children}</AuthProvider>
            <div id="portal-container"></div>
         </body>
      </html>
   );
}
