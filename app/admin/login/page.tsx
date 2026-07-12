'use client';

import { useState, useEffect } from 'react';

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'password' | 'passkey'>('password');
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

  async function handlePasskeyLogin() {
    setError('');
    setLoading(true);
    try {
      const beginRes = await fetch('/admin/api/passkey/login/begin', { credentials: 'include' });
      const assertion = await beginRes.json();
      if (!beginRes.ok) {
        setError(assertion.error || '登录初始化失败');
        return;
      }
      const options = assertion.publicKey || assertion;
      if (!options.challenge) {
        setError('PASSKEY 登录初始化数据无效');
        return;
      }
      const publicKey = {
        ...options,
        challenge: base64UrlToArrayBuffer(options.challenge),
        allowCredentials: (options.allowCredentials || []).map((item: PublicKeyCredentialDescriptor) => ({
          ...item,
          id: typeof item.id === 'string' ? base64UrlToArrayBuffer(item.id) : item.id,
        })),
        userVerification: options.userVerification || 'preferred',
      };
      const cred = await navigator.credentials.get({ publicKey });
      if (!cred) {
        setError('PASSKEY 验证被取消');
        return;
      }
      const credential = cred as PublicKeyCredential;
      const response = credential.response as AuthenticatorAssertionResponse;
      const finishRes = await fetch('/admin/api/passkey/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: credential.id,
          rawId: arrayBufferToBase64Url(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
            signature: arrayBufferToBase64Url(response.signature),
            userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : null,
          },
        }),
      });
      const data = await finishRes.json();
      if (finishRes.ok) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'PASSKEY 验证失败');
      }
    } catch (err: unknown) {
      setError(`PASSKEY 登录失败: ${err instanceof Error ? err.message : '未知错误'}`);
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

        <div className="admin-login-tabs" role="tablist" aria-label="登录方式">
          {(['password', 'passkey'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`admin-login-tab${activeTab === tab ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'password' ? '密码登录' : 'PASSKEY 登录'}
            </button>
          ))}
        </div>

        {error && <div className="admin-alert" role="alert">{error}</div>}

        {activeTab === 'password' ? (
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
        ) : (
          <button type="button" className="admin-btn is-block" onClick={handlePasskeyLogin} disabled={loading}>
            {loading ? '验证中…' : '使用 PASSKEY 登录'}
          </button>
        )}
      </section>
    </main>
  );
}
