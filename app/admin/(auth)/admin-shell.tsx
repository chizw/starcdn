'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const navItems = [
  { label: '仪表盘', href: '/admin' },
  { label: '封禁规则', href: '/admin/bans' },
  { label: '设置', href: '/admin/settings' },
];

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
  const pathname = usePathname();
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <Image src="/favicon.ico" alt="StarCDN" width={24} height={24} />
            </span>
            <div>
              <strong className="block text-sm font-semibold text-zinc-950">StarCDN Admin</strong>
              <span className="text-xs text-zinc-500">fastjs.qixz.cn 控制台</span>
            </div>
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950',
                    pathname === item.href && 'bg-white text-zinc-950 shadow-sm',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={handleLogout}>退出</Button>
          </div>
        </nav>
      </div>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
