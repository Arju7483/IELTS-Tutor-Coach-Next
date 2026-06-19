import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongodb'],
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Enable static optimization where possible
  output: 'standalone'
};

export default nextConfig;
