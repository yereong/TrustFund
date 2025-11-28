import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chocolate-worried-parrot-658.mypinata.cloud",
      },
    ],
  },
};

export default nextConfig;
