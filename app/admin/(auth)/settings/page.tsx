'use client';

import { useEffect, useState, useCallback } from 'react';

interface PasskeyItem {
  id: number;
  created_at: string;
}

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

export default function SettingsPage() {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await fetch('/admin/api/proxy/passkeys', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('获取 PASSKEY 列表失败');
      }
      const data = await res.json();
      setPasskeys(data.passkeys || []);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPasskeys();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchPasskeys]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword !== confirmPassword) {
      setPwdError('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('新密码长度不能少于 6 位');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/admin/api/proxy/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdSuccess(data.message || '密码修改成功，请重新登录');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 1500);
      } else {
        setPwdError(data.error || '修改密码失败');
      }
    } catch {
      setPwdError('网络错误，请稍后重试');
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleDeletePasskey(id: number) {
    if (!confirm('确定要删除该 PASSKEY 吗？')) return;
    try {
      const res = await fetch(`/admin/api/proxy/passkey/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || '删除失败');
      }
    } catch {
      alert('网络错误');
    }
  }

  async function handleRegisterPasskey() {
    setRegError('');
    setRegLoading(true);
    try {
      const beginRes = await fetch('/admin/api/proxy/passkey/register/begin', {
        credentials: 'include',
      });
      const creation = await beginRes.json();
      if (!beginRes.ok) {
        setRegError(creation.error || '注册初始化失败');
        return;
      }

      const publicKey = {
        rp: creation.publicKey?.rp,
        user: {
          ...creation.publicKey?.user,
          id: base64UrlToArrayBuffer(creation.publicKey?.user?.id),
        },
        challenge: base64UrlToArrayBuffer(creation.publicKey?.challenge),
        pubKeyCredParams: creation.publicKey?.pubKeyCredParams,
        authenticatorSelection: creation.publicKey?.authenticatorSelection,
        attestation: creation.publicKey?.attestation,
        timeout: creation.publicKey?.timeout,
      };

      const cred = await navigator.credentials.create({ publicKey });
      if (!cred) {
        setRegError('PASSKEY 注册被取消');
        return;
      }

      const credential = cred as PublicKeyCredential;
      const response = credential.response as AuthenticatorAttestationResponse;
      const finishRes = await fetch('/admin/api/proxy/passkey/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: credential.id,
          rawId: arrayBufferToBase64Url(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            attestationObject: arrayBufferToBase64Url(response.attestationObject),
          },
        }),
      });
      const data = await finishRes.json();
      if (finishRes.ok) {
        fetchPasskeys();
      } else {
        setRegError(data.error || 'PASSKEY 注册失败');
      }
    } catch (err: unknown) {
      setRegError(`PASSKEY 注册失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <>
      <h1 className="admin-title" style={{ marginBottom: '32px' }}>设置</h1>

      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <h2>修改密码</h2>
        {pwdError && (
          <div style={{ background: 'rgba(184,121,74,0.12)', border: '1px solid rgba(184,121,74,0.3)', color: 'var(--clay)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '16px' }}>
            {pwdError}
          </div>
        )}
        {pwdSuccess && (
          <div style={{ background: 'rgba(111,125,82,0.12)', border: '1px solid rgba(111,125,82,0.3)', color: 'var(--moss)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '16px' }}>
            {pwdSuccess}
          </div>
        )}
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-form-group">
            <label>当前密码</label>
            <input
              className="admin-form-input"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="admin-form-group">
            <label>新密码</label>
            <input
              className="admin-form-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="admin-form-group">
            <label>确认新密码</label>
            <input
              className="admin-form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <button type="submit" className="primary-action" disabled={pwdLoading}>
              {pwdLoading ? '保存中...' : '修改密码'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>PASSKEY 管理</h2>
          <button type="button" className="secondary-action" onClick={handleRegisterPasskey} disabled={regLoading}>
            {regLoading ? '注册中...' : '新增 PASSKEY'}
          </button>
        </div>
        {regError && (
          <div style={{ background: 'rgba(184,121,74,0.12)', border: '1px solid rgba(184,121,74,0.3)', color: 'var(--clay)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '16px' }}>
            {regError}
          </div>
        )}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>{error}</p>
        ) : passkeys.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>暂无 PASSKEY</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>编号</th>
                  <th style={{ width: '180px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {passkeys.map((pk) => (
                  <tr key={pk.id}>
                    <td>PASSKEY #{pk.id + 1}</td>
                    <td>
                      <button type="button" className="danger-action" onClick={() => handleDeletePasskey(pk.id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
