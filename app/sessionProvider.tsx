// app/providers.tsx
"use client";

import { useEffect, useRef } from "react";
import { signIn, signOut, SessionProvider, useSession } from "next-auth/react";
import { logsPage } from "@/constants";

function AuthErrorHandler() {
   const { data: session } = useSession();
   const isReauthenticating = useRef(false);

   useEffect(() => {
      if (
         session?.error !== "RefreshAccessTokenError" ||
         isReauthenticating.current
      ) {
         return;
      }

      isReauthenticating.current = true;

      (async () => {
         await signOut({ redirect: false });
         await signIn("google", {
            callbackUrl: window.location.origin + logsPage,
         });
      })();
   }, [session?.error]);

   return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
   return (
      <SessionProvider>
         <AuthErrorHandler />
         {children}
      </SessionProvider>
   );
}
