import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  sassOptions: {
    loadPaths: ['app/styles'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Only allow HTTPS images for security
        hostname: '**', // '**' is a wildcard that matches ANY domain
      },
    ],
    unoptimized: true, // Disables Next.js image optimization to allow any source
    // WARNING: This removes many performance benefits
  },
  experimental: { viewTransition: true },
};

export default nextConfig;
