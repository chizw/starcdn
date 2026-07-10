'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

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
      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-black text-foreground tracking-[-0.065em] m-0 mb-8">设置</h1>

      <Card className="mb-7">
        <h2 className="font-heading text-[1.34rem] font-extrabold text-foreground m-0 mb-5 tracking-[-0.02em]">修改密码</h2>
        {pwdError && (
          <div className="bg-[rgba(184,121,74,0.12)] border border-[rgba(184,121,74,0.3)] text-clay px-4 py-3 rounded-xl text-[0.9rem] mb-4">{pwdError}</div>
        )}
        {pwdSuccess && (
          <div className="bg-[rgba(111,125,82,0.12)] border border-[rgba(111,125,82,0.3)] text-moss px-4 py-3 rounded-xl text-[0.9rem] mb-4">{pwdSuccess}</div>
        )}
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-[768px]:min-w-0">
            <label className="font-bold text-[0.84rem] text-ink-soft">当前密码</label>
            <input
              className="py-[10px] px-[14px] border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-[0.94rem] transition-[border-color,box-shadow] focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-[768px]:min-w-0">
            <label className="font-bold text-[0.84rem] text-ink-soft">新密码</label>
            <input
              className="py-[10px] px-[14px] border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-[0.94rem] transition-[border-color,box-shadow] focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-[768px]:min-w-0">
            <label className="font-bold text-[0.84rem] text-ink-soft">确认新密码</label>
            <input
              className="py-[10px] px-[14px] border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-[0.94rem] transition-[border-color,box-shadow] focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <Button type="submit" disabled={pwdLoading}>{pwdLoading ? '保存中...' : '修改密码'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-[1.34rem] font-extrabold text-foreground m-0 tracking-[-0.02em]">PASSKEY 管理</h2>
          <Button variant="secondary" onClick={handleRegisterPasskey} disabled={regLoading}>{regLoading ? '注册中...' : '新增 PASSKEY'}</Button>
        </div>
        {regError && (
          <div className="bg-[rgba(184,121,74,0.12)] border border-[rgba(184,121,74,0.3)] text-clay px-4 py-3 rounded-xl text-[0.9rem] mb-4">{regError}</div>
        )}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="inline-block w-[18px] h-[18px] border-2 border-line border-t-moss rounded-full [animation:spin_0.8s_linear_infinite]" />
          </div>
        ) : error ? (
          <p className="text-muted text-center py-10">{error}</p>
        ) : passkeys.length === 0 ? (
          <p className="text-muted text-center py-10">暂无 PASSKEY</p>
        ) : (
          <div className="max-h-[480px] overflow-y-auto rounded-xl [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb:hover]:bg-muted">
            <table className="w-full border-collapse text-[0.94rem]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em]">编号</th>
                  <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em] w-[180px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {passkeys.map((pk) => (
                  <tr key={pk.id} className="hover:bg-[rgba(255,252,245,0.38)] last:[&>td]:border-b-0">
                    <td className="px-4 py-[14px] border-b border-line-soft text-ink-soft">PASSKEY #{pk.id + 1}</td>
                    <td className="px-4 py-[14px] border-b border-line-soft">
                      <Button variant="outline" size="sm" className="border-[rgba(184,121,74,0.4)] bg-[rgba(184,121,74,0.1)] text-clay hover:bg-[rgba(184,121,74,0.22)]" onClick={() => handleDeletePasskey(pk.id)}>
                        删除
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
