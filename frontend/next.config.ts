import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
    // ❌ Disable ESLint checks during `next build`
    ignoreDuringBuilds: true,
  },
   typescript: {
    ignoreBuildErrors: true, // ✅ Skip type checking errors
  },
};

export default nextConfig;
