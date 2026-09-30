import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ["https://shawlless-unregaled-benton.ngrok-free.dev"],
   cacheComponents: true,
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "lh3.googleusercontent.com",
         },
      ],
   },
};

export default nextConfig;
