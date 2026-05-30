import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
