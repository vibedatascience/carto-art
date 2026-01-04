import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdhewcjfrghjhenztwdq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Required for static export
    unoptimized: process.env.STATIC_EXPORT === 'true',
  },
  // Enable static export when STATIC_EXPORT env is set
  // This is used for Capacitor iOS builds
  ...(process.env.STATIC_EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
  }),
};

export default nextConfig;
