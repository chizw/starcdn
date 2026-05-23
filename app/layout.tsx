import type { Metadata, Viewport } from 'next';
import './globals.css';
import './styles/home.css';
import './styles/not-found.css';
import './styles/waf.css';

export const metadata: Metadata = {
  title: 'StarCDN - 信网免费 CDN 加速服务',
  description: '信网开源项目免费CDN加速服务 - 提供Jsdelivr、Gravatar等公共库的稳定、快速、免费CDN镜像加速。支持HTTPS(SSL)和HTTP/3.0协议，全球多节点部署，提升网站加载速度。',
  keywords: ['免费CDN', '前端加速', 'Jsdelivr镜像', 'Gravatar镜像', 'HTTP3加速', '静态资源加速'],
  authors: [{ name: '信网' }],
  creator: '信网',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
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
