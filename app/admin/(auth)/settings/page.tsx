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

async function readJSONResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
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
      const res = await fetch('/admin/api/passkeys', { cache: 'no-store' });
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
      const res = await fetch('/admin/api/password', {
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
      const res = await fetch(`/admin/api/passkey/${id}`, {
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
      const beginRes = await fetch('/admin/api/passkey/register/begin', {
        credentials: 'include',
      });
      const creation = await readJSONResponse(beginRes);
      if (!beginRes.ok) {
        setRegError(creation.error || '注册初始化失败');
        return;
      }
      const options = creation.publicKey || creation;
      if (!options.challenge || !options.user?.id) {
        setRegError('PASSKEY 注册初始化数据无效');
        return;
      }

      const publicKey = {
        rp: options.rp,
        user: {
          ...options.user,
          id: base64UrlToArrayBuffer(options.user.id),
        },
        challenge: base64UrlToArrayBuffer(options.challenge),
        pubKeyCredParams: options.pubKeyCredParams,
        authenticatorSelection: options.authenticatorSelection,
        attestation: options.attestation,
        timeout: options.timeout,
      };

      const cred = await navigator.credentials.create({ publicKey });
      if (!cred) {
        setRegError('PASSKEY 注册被取消');
        return;
      }

      const credential = cred as PublicKeyCredential;
      const response = credential.response as AuthenticatorAttestationResponse;
      const finishRes = await fetch('/admin/api/passkey/register/finish', {
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
      const data = await readJSONResponse(finishRes);
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
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">设置</h1>
          <p className="admin-page-desc">管理账号密码与 PASSKEY 登录凭据。</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">修改密码</h2>
            <p className="admin-card-desc">保存后会回到登录页重新认证。</p>
          </div>
        </div>
        <div className="admin-card-body">
          {pwdError && <div className="admin-alert" role="alert">{pwdError}</div>}
          {pwdSuccess && <div className="admin-alert is-success" role="status">{pwdSuccess}</div>}
          <form className="admin-form-grid" onSubmit={handleChangePassword} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="oldPassword">当前密码</label>
              <input
                id="oldPassword"
                type="password"
                className="admin-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="newPassword">新密码</label>
              <input
                id="newPassword"
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="confirmPassword">确认新密码</label>
              <input
                id="confirmPassword"
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="admin-btn" disabled={pwdLoading}>
              {pwdLoading ? '保存中…' : '修改密码'}
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">PASSKEY 管理</h2>
            <p className="admin-card-desc">使用平台认证器提升控制台登录安全性。</p>
          </div>
          <button type="button" className="admin-btn is-outline" onClick={handleRegisterPasskey} disabled={regLoading}>
            {regLoading ? '注册中…' : '新增 PASSKEY'}
          </button>
        </div>
        <div className="admin-card-body">
          {regError && <div className="admin-alert" role="alert">{regError}</div>}
          {loading ? (
            <div className="admin-loading"><span className="admin-loading-dot" /></div>
          ) : error ? (
            <div className="admin-empty">{error}</div>
          ) : passkeys.length === 0 ? (
            <div className="admin-empty">暂无 PASSKEY</div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--admin-border)' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>编号</th>
                    <th>注册时间</th>
                    <th style={{ width: 120 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {passkeys.map((pk) => (
                    <tr key={pk.id}>
                      <td style={{ fontWeight: 600 }}>PASSKEY #{pk.id + 1}</td>
                      <td style={{ color: 'var(--admin-text-soft)', fontSize: 12 }}>
                        {pk.created_at ? new Date(pk.created_at).toLocaleString('zh-CN') : '--'}
                      </td>
                      <td>
                        <button type="button" className="admin-btn is-danger" onClick={() => handleDeletePasskey(pk.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
