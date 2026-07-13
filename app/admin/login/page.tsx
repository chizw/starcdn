'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.cookie = 'admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }, []);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/admin/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-mark" aria-hidden="true">S</div>
        <h1 id="admin-login-title" className="admin-login-title">StarCDN Admin</h1>
        <p className="admin-login-desc">登录 fastjs.qixz.cn 管理控制台</p>

        {error && <div className="admin-alert" role="alert">{error}</div>}

        <form onSubmit={handlePasswordLogin} noValidate>
            <div className="admin-field">
              <label className="admin-label" htmlFor="username">用户名</label>
              <input
                id="username"
                type="text"
                className="admin-input"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                className="admin-input"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="admin-btn is-block" disabled={loading}>
              {loading ? '登录中…' : '登录'}
            </button>
        </form>
      </section>
    </main>
  );
}
