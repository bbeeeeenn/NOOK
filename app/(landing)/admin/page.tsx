import Image from "next/image";
import Login from "./LoginComponent";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logsPage } from "@/constants";
import { Suspense } from "react";

async function LoginForm() {
   const session = await auth();
   if (session?.user) redirect(logsPage);

   return <Login />;
}

export default async function AdminLoginPage() {
   return (
      <>
         <Image
            src={"/library2.jpg"}
            alt=""
            width={2000}
            height={1000}
            className="fixed inset-0 size-full object-cover"
            loading="eager"
         />
         <div className="bg-green-primary/70 fixed inset-0" />
         <main className="relative mt-17.5 flex h-[calc(100dvh-70px)] flex-col justify-center">
            <div className="flex w-full min-w-75 overflow-y-auto px-4 py-15">
               <Suspense>
                  <LoginForm />
               </Suspense>
            </div>
         </main>
      </>
   );
}
