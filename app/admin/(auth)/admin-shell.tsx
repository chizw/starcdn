'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/button';

function isTokenValid(): boolean {
  try {
    const match = document.cookie.split('; ').find(row => row.startsWith('admin_token='));
    if (!match) return false;
    const token = match.split('=')[1];
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [authed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isTokenValid();
  });

  useEffect(() => {
    if (!authed) {
      window.location.href = '/admin/login';
    }
  }, [authed]);

  async function handleLogout() {
    try {
      await fetch('/admin/api/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = '/admin/login';
  }

  if (!authed) {
    return (
      <div className="page-bg-admin">
        <div className="flex justify-center items-center h-screen">
          <div className="inline-block w-[18px] h-[18px] border-2 border-line border-t-moss rounded-full [animation:spin_0.8s_linear_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg-admin [&>*]:relative [&>*]:z-[1]">
      <nav className="flex items-center justify-between gap-6 px-9 py-4 border-b border-line bg-[rgba(247,241,230,0.6)] backdrop-blur-[12px] max-[768px]:px-5 max-[768px]:flex-wrap">
        <a href="/admin" className="flex items-center gap-3 no-underline">
          <Image src="/favicon.ico" alt="StarCDN" width={32} height={32} className="[filter:saturate(0.86)_contrast(0.96)]" />
          <span className="font-heading text-[1.1rem] font-black text-foreground tracking-[-0.02em]">管理后台</span>
        </a>
        <div className="flex items-center gap-1">
          <a href="/admin" className="px-4 py-[10px] text-muted text-[0.92rem] font-bold rounded-full transition-[color,background] duration-300 hover:text-foreground hover:bg-[rgba(255,252,245,0.5)]">仪表盘</a>
          <a href="/admin/bans" className="px-4 py-[10px] text-muted text-[0.92rem] font-bold rounded-full transition-[color,background] duration-300 hover:text-foreground hover:bg-[rgba(255,252,245,0.5)]">封禁规则</a>
          <a href="/admin/settings" className="px-4 py-[10px] text-muted text-[0.92rem] font-bold rounded-full transition-[color,background] duration-300 hover:text-foreground hover:bg-[rgba(255,252,245,0.5)]">设置</a>
        </div>
        <Button variant="outline" className="rounded-full text-ink-soft" onClick={handleLogout}>
          退出
        </Button>
      </nav>
      <main className="w-[min(1160px,calc(100%-44px))] mx-auto py-9 pb-20">
        {children}
      </main>
    </div>
  );
}
