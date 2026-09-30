import { google } from "googleapis";
import { Session } from "next-auth";

export function getSheetService(session: Session) {
   if (!session.accessToken || session.error) {
      throw new Error("Google authorization is unavailable.");
   }

   const auth = new google.auth.OAuth2();
   auth.setCredentials({ access_token: session.accessToken });

   return google.sheets({
      version: "v4",
      auth,
   });
}
