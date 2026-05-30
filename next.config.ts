import type { NextConfig } from 'next';

const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:2606';

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/npm/:path*', destination: `${backendOrigin}/npm/:path*` },
      { source: '/gh/:path*', destination: `${backendOrigin}/gh/:path*` },
      { source: '/wp/:path*', destination: `${backendOrigin}/wp/:path*` },
      { source: '/ajax/libs/:path*', destination: `${backendOrigin}/ajax/libs/:path*` },
      { source: '/avatar/:path*', destination: `${backendOrigin}/avatar/:path*` },
      { source: '/admin/api/proxy/:path*', destination: `${backendOrigin}/admin/api/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/scripts/:path*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
