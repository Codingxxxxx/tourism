import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '', // Leave empty unless a specific port is required
        pathname: '/**', // Allows all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'maps.gstatic.com',
        port: '', // Leave empty unless a specific port is required
        pathname: '/**', // Allows all paths under this hostname
      },
      {
        protocol: 'http',
        hostname: '34.60.52.162',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: 'api.kampottic.com',
        port: '',
        pathname: '/**'
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    },
    incomingRequests: true
  }
};

export default nextConfig;
