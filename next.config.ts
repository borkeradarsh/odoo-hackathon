import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Optimize for production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Compress responses
  compress: true,
};

export default nextConfig;
