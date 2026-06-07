import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Enable static optimization where possible
  output: 'standalone'
};

export default nextConfig;
