import type { Metadata, Viewport } from 'next';
import './globals.css';
import './styles/home.css';
import './styles/not-found.css';
import './styles/waf.css';

const siteUrl = 'https://fastjs.qixz.cn';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'StarCDN - 免费公共 CDN 镜像加速服务',
    template: '%s | StarCDN',
  },
  description: '信网开源项目免费CDN加速服务 - 提供Jsdelivr、Gravatar等公共库的稳定、快速、免费CDN镜像加速。支持HTTPS(SSL)和HTTP/3.0协议，全球多节点部署，提升网站加载速度。',
  keywords: ['免费CDN', '公共库CDN', '前端加速', 'Jsdelivr镜像', 'Gravatar镜像', 'cdnjs镜像', 'HTTP3加速', '静态资源加速'],
  authors: [{ name: '信网' }],
  creator: '信网',
  publisher: '信网',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    siteName: 'StarCDN',
    title: 'StarCDN - 免费公共 CDN 镜像加速服务',
    description: '为 Jsdelivr、Gravatar、cdnjs 等公共资源提供稳定、快速、免费的 CDN 镜像加速服务，支持 HTTPS、HTTP/2 与 HTTP/3。',
    images: [{ url: '/star/images/logo.png', width: 156, height: 48, alt: 'StarCDN' }],
  },
  twitter: {
    card: 'summary',
    title: 'StarCDN - 免费公共 CDN 镜像加速服务',
    description: '稳定、快速、轻量的公共资源 CDN 镜像加速服务。',
    images: ['/star/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/star/images/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="renderer" content="webkit" />
        <meta name="force-rendering" content="webkit" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge, chrome=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
