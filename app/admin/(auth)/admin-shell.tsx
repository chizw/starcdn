'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

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
      <div className="admin-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <a href="/admin" className="admin-nav-brand">
          <Image src="/favicon.ico" alt="StarCDN" width={32} height={32} />
          <span>管理后台</span>
        </a>
        <div className="admin-nav-links">
          <a href="/admin" className="admin-nav-link">仪表盘</a>
          <a href="/admin/bans" className="admin-nav-link">封禁规则</a>
          <a href="/admin/settings" className="admin-nav-link">设置</a>
        </div>
        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          退出
        </button>
      </nav>
      <main className="admin-container">
        {children}
      </main>
    </div>
  );
}
