'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
      const res = await fetch('/admin/api/proxy/login', {
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
      const beginRes = await fetch('/admin/api/proxy/passkey/login/begin', { credentials: 'include' });
      const assertion = await beginRes.json();
      if (!beginRes.ok) {
        setError(assertion.error || '登录初始化失败');
        return;
      }
      const publicKey = {
        challenge: base64UrlToArrayBuffer(assertion.challenge),
        allowCredentials: [],
        userVerification: assertion.userVerification || 'preferred',
      };
      const cred = await navigator.credentials.get({ publicKey });
      if (!cred) {
        setError('PASSKEY 验证被取消');
        return;
      }
      const credential = cred as PublicKeyCredential;
      const response = credential.response as AuthenticatorAssertionResponse;
      const finishRes = await fetch('/admin/api/proxy/passkey/login/finish', {
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
            userHandle: response.userHandle
              ? arrayBufferToBase64Url(response.userHandle)
              : null,
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
    <div className="login-page">
      <div className="login-card">
        <h1>Star<span>CDN</span> Admin</h1>
        <p className="login-subtitle">管理后台登录</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            密码登录
          </button>
          <button
            className={`login-tab ${activeTab === 'passkey' ? 'active' : ''}`}
            onClick={() => setActiveTab('passkey')}
          >
            PASSKEY 登录
          </button>
        </div>

        <div className={`login-error ${error ? 'visible' : ''}`}>{error}</div>

        <form className={`login-form ${activeTab === 'password' ? 'active' : ''}`} onSubmit={handlePasswordLogin}>
          <input
            className="login-input"
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="login-input"
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" className="primary-action" disabled={loading} style={{ width: '100%' }}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className={`login-form ${activeTab === 'passkey' ? 'active' : ''}`}>
          <button
            type="button"
            className="primary-action"
            onClick={handlePasskeyLogin}
            disabled={loading}
            style={{ width: '100%', background: '#242723' }}
          >
            {loading ? '验证中...' : '使用 PASSKEY 登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
