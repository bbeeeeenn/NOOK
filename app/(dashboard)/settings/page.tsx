import { UserShield } from "lucide-react";
import ChangePassword from "./_components/ChangePassword";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminLoginPage } from "@/constants";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./_components/LogoutButton";
import { Metadata } from "next";
import { Suspense } from "react";
import ProfileCard from "./_components/ProfileCard";

export const metadata: Metadata = {
   title: "Nook - Account",
};

export default function SettingsPage() {
   return (
      <div className="min-h-[calc(100dvh-85px)] min-w-75 bg-[#34A853] p-7 select-none">
         <div className="mx-auto max-w-150 pb-4">
            <p className="font-inter mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
               <span>
                  <UserShield />
               </span>
               Account
            </p>
            <ProfileCard />
            <Suspense fallback={<PasswordsSkeleton />}>
               <Suspended />
            </Suspense>
            <LogoutButton />
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

   return <ChangePassword noPassword={!user.password} />;
}

function PasswordsSkeleton() {
   return (
      <div className="mt-10 animate-pulse">
         {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
               <div className="mt-2 mb-1 h-5 w-32 rounded bg-white/30" />
               <div className="h-11 w-full rounded-lg bg-white/30" />
            </div>
         ))}
      </div>
   );
}
