import Google from "next-auth/providers/google";

export default Google({
   clientId: process.env.AUTH_GOOGLE_CLIENT!,
   clientSecret: process.env.AUTH_GOOGLE_SECRET!,
   allowDangerousEmailAccountLinking: true,
});
