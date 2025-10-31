import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
      },
    ],
  },
  reactCompiler: true,
  serverExternalPackages: ["pino", "pino-pretty"],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
