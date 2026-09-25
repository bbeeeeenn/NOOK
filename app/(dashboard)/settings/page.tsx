import { UserShield } from "lucide-react";
import ChangePassword from "./_components/ChangePassword";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { adminLoginPage } from "@/constants";
import { FcGoogle } from "react-icons/fc";
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
         <div className="mx-auto max-w-100 pb-10">
            <p className="font-inter mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
               <span>
                  <UserShield />
               </span>
               Account
            </p>
            <div className="text-white-primary flex items-center gap-2 text-xl">
               {session.user.image ? (
                  <Image
                     src={session.user.image}
                     alt=""
                     width={30}
                     height={30}
                     className="rounded-md"
                  />
               ) : (
                  <span>
                     <FcGoogle />
                  </span>
               )}

               <p className="truncate">{session.user.email}</p>
            </div>
            <ChangePassword noPassword={!user.password} />
         </div>
      </div>
   );
}
