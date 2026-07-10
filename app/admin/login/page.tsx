'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

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
    <div className="login-bg">
      <Card className="relative z-[1] w-[min(420px,92vw)] rounded-[var(--radius-xl)]! px-8 py-10 shadow-[0_26px_80px_rgba(49,41,26,0.14)]">
        <h1 className="font-heading text-[1.8rem] font-black text-foreground text-center m-0 mb-2 tracking-[-0.04em]">Star<span className="text-clay">CDN</span> Admin</h1>
        <p className="text-center text-muted text-[0.94rem] m-0 mb-7">管理后台登录</p>

        <div className="flex border-b border-line-soft mb-6">
          <button
            className={`flex-1 py-[10px] text-center bg-transparent border-none border-b-2 ${activeTab === 'password' ? 'text-moss border-b-moss' : 'text-muted border-b-transparent'} font-bold text-[0.92rem] cursor-pointer transition-[color,border-color] duration-300`}
            onClick={() => setActiveTab('password')}
          >
            密码登录
          </button>
          <button
            className={`flex-1 py-[10px] text-center bg-transparent border-none border-b-2 ${activeTab === 'passkey' ? 'text-moss border-b-moss' : 'text-muted border-b-transparent'} font-bold text-[0.92rem] cursor-pointer transition-[color,border-color] duration-300`}
            onClick={() => setActiveTab('passkey')}
          >
            PASSKEY 登录
          </button>
        </div>

        <div className={`bg-[rgba(184,121,74,0.12)] border border-[rgba(184,121,74,0.3)] text-clay px-4 py-3 rounded-xl text-[0.9rem] ${error ? 'block' : 'hidden'}`}>{error}</div>

        <form className={`flex flex-col gap-4 ${activeTab === 'password' ? 'flex' : 'hidden'}`} onSubmit={handlePasswordLogin}>
          <input
            className="py-3 px-4 border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-base focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="py-3 px-4 border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-base focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading} className="w-full">{loading ? '登录中...' : '登录'}</Button>
        </form>

        <div className={`flex flex-col gap-4 ${activeTab === 'passkey' ? 'flex' : 'hidden'}`}>
          <Button type="button" onClick={handlePasskeyLogin} disabled={loading} className="w-full bg-[#242723]!">{loading ? '验证中...' : '使用 PASSKEY 登录'}</Button>
        </div>
      </Card>
    </div>
  );
}
