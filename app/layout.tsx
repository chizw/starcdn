import type { Metadata } from 'next';
import './globals.css';
import './admin/admin.css';
import { LanguageProvider } from '@/i18n';
import SiteChrome from './site-chrome';

export const metadata: Metadata = {
  title: 'StarCDN - 免费前端公共库资源加速',
  description: '基于自研系统，搭配边缘计算和多层智能缓存，为全球用户提供低延迟、高速、稳定的免费前端公共库资源加速服务。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 静态导出模式：默认 zh，客户端会从 cookie 同步真实语言
  const initialLang = 'zh' as const;

  return (
    <html lang="zh-CN" data-lang={initialLang} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fastjs.qixz.cn/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css" />
        <link rel="preload" href="/1666963922.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'woff';
            src: url('/1666963922.woff') format('woff');
            font-display: swap;
          }
          body { font-family: 'woff', sans-serif; }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || t === 'light') {
                document.documentElement.setAttribute('data-theme', t);
              } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch(e) {}
            var m=document.cookie.match(/(?:^|;\\s*)lang=(en|zh)(?:;|$)/);
            var l=m?m[1]:null;
            if(l&&l!==document.documentElement.getAttribute('data-lang')){
              document.documentElement.setAttribute('data-lang',l);
              document.documentElement.lang=l==='en'?'en':'zh-CN';
            }
          })();
        `}} />
      </head>
      <body>
        <LanguageProvider initialLang={initialLang}>
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
