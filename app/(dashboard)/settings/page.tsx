import { Mail, UserShield } from "lucide-react";
import ChangePassword from "./_components/ChangePassword";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminLoginPage } from "@/constants";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const instant = false;
export default async function SettingsPage() {
   const session = await auth();
   if (!session?.user) redirect(adminLoginPage);
   const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: { password: true },
   });
   if (!user) redirect(adminLoginPage);

   return (
      <div className="min-h-[calc(100dvh-85px)] min-w-50 bg-[#34A853] p-7 select-none">
         <div className="mx-auto max-w-150 pb-10">
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
                  className="rounded-md"
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
         </div>
      </div>
   );
}
