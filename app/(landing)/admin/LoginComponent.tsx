"use client";
import { Nook1 } from "@/components/Images";
import { logsPage } from "@/constants";
import { LoaderCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SubmitEvent, useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
   const router = useRouter();
   const [credentials, setCredentials] = useState({
      username: "",
      password: "",
   });
   const [isPending, setIsPending] = useState(false);
   const [error, setError] = useState("");

   const handleCredentialsSubmit = async (e: SubmitEvent) => {
      e.preventDefault();
      if (isPending) return;
      setIsPending(true);

      const username = credentials.username;
      const password = credentials.password;
      const response = (await signIn("credentials", {
         username,
         password,
         redirect: false,
      }))!;
      if (!response.ok) {
         setError(
            response.status === 401
               ? "Invalid credentials"
               : "Unexpecred error occured",
         );
      } else {
         router.replace(logsPage);
         setError("");
      }
      setIsPending(false);
   };
   const handleGoogle = () => signIn("google", { callbackUrl: logsPage });

   return (
      <form
         onSubmit={handleCredentialsSubmit}
         className="bg-white-primary/10 mx-auto min-h-100 w-full max-w-120 rounded-[30px] p-4 shadow-[2px_5px_6.3px_-1px_rgba(0,0,0,0.4),inset_3px_3px_0px_-2px_#c3ffd699,inset_-3px_-2px_2px_-2px_#c3ffd699] backdrop-blur-md"
      >
         <Nook1 className="mx-auto mt-2 w-30" />
      </form>
   );
}
