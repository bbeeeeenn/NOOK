"use client";

import { Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProfileCard() {
   const session = useSession();
   return session.status === "loading" ? (
      <div className="flex items-center gap-2">
         <div className="size-12.5 rounded-md bg-white/30" />
         <div className="flex flex-col gap-2">
            <div className="h-5 w-36 rounded bg-white/30" />
            <div className="h-4 w-48 max-w-full rounded bg-white/20" />
         </div>
      </div>
   ) : (
      session.status === "authenticated" && (
         <div className="text-white-primary flex items-center gap-2">
            {session.data.user.image && (
               <Image
                  src={session.data.user.image}
                  alt=""
                  width={50}
                  height={50}
                  className="aspect-square h-12.5 rounded-md"
               />
            )}
            <div>
               <p className="truncate text-lg font-medium">
                  {session.data.user.name}
               </p>
               <p className="flex items-center gap-1 text-base text-white/90">
                  <span>
                     <Mail size={17} />
                  </span>
                  <span className="truncate">{session.data.user.email}</span>
               </p>
            </div>
         </div>
      )
   );
}
