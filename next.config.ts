import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['miurdosiqbexdihadjdo.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miurdosiqbexdihadjdo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
