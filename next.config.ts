import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_PORTAL_URL: process.env.PORTAL_URL ?? "",
  },
};

export default nextConfig;
