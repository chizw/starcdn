'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { label: '仪表盘', href: '/admin' },
  { label: '封禁规则', href: '/admin/bans' },
  { label: '设置', href: '/admin/settings' },
];

function isTokenValid(): boolean {
  try {
    const match = document.cookie.split('; ').find((row) => row.startsWith('admin_token='));
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
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(isTokenValid());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !authed) {
      window.location.href = '/admin/login';
    }
  }, [authed, ready]);

  async function handleLogout() {
    try {
      await fetch('/admin/api/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = '/admin/login';
  }

  if (!ready || !authed) {
    return (
      <div className="admin-shell">
        <div className="admin-loading">
          <span className="admin-loading-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link href="/admin" className="admin-brand" aria-label="StarCDN Admin">
            <span className="admin-brand-mark">S</span>
            <span className="admin-brand-text">
              <strong className="admin-brand-title">StarCDN Admin</strong>
              <span className="admin-brand-sub">fastjs.qixz.cn 控制台</span>
            </span>
          </Link>
          <nav className="admin-nav" aria-label="后台导航">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button type="button" className="admin-btn is-logout" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>
      <main className="admin-page">{children}</main>
    </div>
  );
}
