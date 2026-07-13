import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const backendUrl = process.env.STARCDN_BACKEND_URL ?? 'http://127.0.0.1:2606';
const backendProxyRoutes = ['/api', '/admin/api', '/npm', '/gh', '/ajax/libs', '/avatar', '/cnb'];

const createNextConfig = (phase: string): NextConfig => ({
  ...(phase === PHASE_DEVELOPMENT_SERVER ? {} : { output: 'export' as const }),
  compress: true,
  ...(phase === PHASE_DEVELOPMENT_SERVER
    ? {
        async rewrites() {
          return backendProxyRoutes.map((route) => ({
            source: `${route}/:path*`,
            destination: `${backendUrl}${route}/:path*`,
          }));
        },
      }
    : {}),
  poweredByHeader: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cos.jsdmirror.com',
      },
    ],
  },
});

export default createNextConfig;
