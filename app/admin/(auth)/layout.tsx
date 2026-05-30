import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import '../../styles/admin.css';

export const metadata: Metadata = {
  title: '管理后台',
  description: 'StarCDN 管理后台',
};

async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    if (!adminToken) return false;

    const backendOrigin = process.env.BACKEND_ORIGIN || 'http://localhost:8080';
    const res = await fetch(`${backendOrigin}/admin/api/stats`, {
      headers: { Cookie: `admin_token=${adminToken}` },
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <a href="/admin" className="admin-nav-brand">
          <img src="/img/logo.png" alt="StarCDN" width="32" height="32" />
          <span>管理后台</span>
        </a>
        <div className="admin-nav-links">
          <a href="/admin" className="admin-nav-link">仪表盘</a>
          <a href="/admin/bans" className="admin-nav-link">封禁规则</a>
        </div>
        <button type="button" className="admin-logout-btn" id="logout-btn">
          退出
        </button>
      </nav>
      <main className="admin-container">
        {children}
      </main>
      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('logout-btn').addEventListener('click', async function() {
          try {
            await fetch('/admin/api/logout', { method: 'POST' });
          } catch (e) {}
          window.location.href = '/admin/login';
        });
      ` }} />
    </div>
  );
}
