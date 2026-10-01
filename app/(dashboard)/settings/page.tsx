import { Mail, UserShield } from "lucide-react";
import ChangePassword from "./_components/ChangePassword";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminLoginPage } from "@/constants";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./_components/LogoutButton";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
   title: "Nook - Account",
};

export default function SettingsPage() {
   return (
      <Suspense fallback={<SettingsSkeleton />}>
         <Suspended />
      </Suspense>
   );
}

function SettingsSkeleton() {
   return (
      <div
         className="min-h-[calc(100dvh-85px)] min-w-75 bg-[#34A853] p-7 select-none"
         aria-busy="true"
         aria-label="Loading account settings"
      >
         <div className="mx-auto max-w-150 animate-pulse pb-4">
            <div className="mb-4 flex items-center gap-2">
               <div className="size-8 rounded bg-white/30" />
               <div className="h-8 w-28 rounded bg-white/30" />
            </div>
            <div className="flex items-center gap-2">
               <div className="size-12.5 rounded-md bg-white/30" />
               <div className="flex flex-col gap-2">
                  <div className="h-5 w-36 rounded bg-white/30" />
                  <div className="h-4 w-48 max-w-full rounded bg-white/20" />
               </div>
            </div>
            <div className="mt-10">
               {Array.from({ length: 3 }, (_, index) => (
                  <div key={index}>
                     <div className="mt-2 mb-1 h-5 w-32 rounded bg-white/30" />
                     <div className="h-11 w-full rounded-lg bg-white/30" />
                  </div>
               ))}
            </div>
            <div className="mt-10 h-12 w-full rounded-md bg-white/30" />
         </div>
      </div>
   );
}

async function Suspended() {
   const session = await auth();
   if (!session?.user) redirect(adminLoginPage);
   const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: { password: true },
   });
   if (!user) redirect(adminLoginPage);

   return (
      <div className="min-h-[calc(100dvh-85px)] min-w-75 bg-[#34A853] p-7 select-none">
         <div className="mx-auto max-w-150 pb-4">
            <p className="font-inter mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
               <span>
                  <UserShield />
               </span>
               Account
            </p>
            <div className="text-white-primary flex items-center gap-2">
               <Image
                  src={session.user.image!}
                  alt=""
                  width={50}
                  height={50}
                  className="aspect-square h-12.5 rounded-md"
               />
               <div>
                  <p className="truncate text-lg font-medium">
                     {session.user.name}
                  </p>
                  <p className="flex items-center gap-1 text-base text-white/90">
                     <span>
                        <Mail size={17} />
                     </span>
                     <span className="truncate">{session.user.email}</span>
                  </p>
               </div>
            </div>

            <ChangePassword noPassword={!user.password} />
            <LogoutButton />
         </div>
      </div>
   );
}
