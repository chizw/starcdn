'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n';

export default function TitleManager() {
  const t = useT();
  const pathname = usePathname();

  useEffect(() => {
    // 页面标题映射（客户端组件页面无法使用 metadata）
    const pageTitles: Record<string, string> = {
      '/': 'JSDMirror - 免费开源的前端公共资源加速服务',
      '/about': '关于 - JSDMirror',
      '/sponsor': '赞助支持 - JSDMirror',
      '/top': '赞助排行榜 - JSDMirror',
      '/notices': '公告 - JSDMirror',
      '/docs': '文档 - JSDMirror',
      '/terms': '用户协议 - JSDMirror',
      '/privacy': '隐私政策 - JSDMirror',
      '/version': '版本记录 - JSDMirror',
    };

    const pageTitlesEn: Record<string, string> = {
      '/': 'JSDMirror - Free Open-Source Frontend CDN',
      '/about': 'About - JSDMirror',
      '/sponsor': 'Support Us - JSDMirror',
      '/top': 'Leaderboard - JSDMirror',
      '/notices': 'Announcements - JSDMirror',
      '/docs': 'Docs - JSDMirror',
      '/pricing': 'Pricing - JSDMirror',
      '/terms': 'Terms of Service - JSDMirror',
      '/privacy': 'Privacy Policy - JSDMirror',
      '/version': 'Changelog - JSDMirror',
    };

    const isEn = document.documentElement.lang?.startsWith('en');
    const titles = isEn ? pageTitlesEn : pageTitles;
    const title = titles[pathname];

    if (title) {
      document.title = title;
    }

    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  }, [t, pathname]);

  return null;
}
