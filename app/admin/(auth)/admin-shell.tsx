'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { label: '仪表盘', href: '/admin' },
  { label: '封禁规则', href: '/admin/bans' },
  { label: '设置', href: '/admin/settings' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const res = await fetch('/admin/api/session', { cache: 'no-store', credentials: 'include' });
        if (!cancelled) setAuthed(res.ok);
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
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
