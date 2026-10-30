import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ["shawlless-unregaled-benton.ngrok-free.dev"],
   cacheComponents: true,
   experimental: {
      serverActions: {
         bodySizeLimit: "10mb",
      },
   },
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
