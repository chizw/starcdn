'use client';

import { useEffect, useState, useCallback } from 'react';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">设置</h1>
        <p className="mt-2 text-sm text-zinc-500">管理账号密码和 PASSKEY 登录凭据。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>保存后会回到登录页重新认证。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 space-y-3">
            {pwdError && <Alert variant="destructive">{pwdError}</Alert>}
            {pwdSuccess && <Alert variant="success">{pwdSuccess}</Alert>}
          </div>
          <form onSubmit={handleChangePassword} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">当前密码</Label>
              <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={pwdLoading}>{pwdLoading ? '保存中...' : '修改密码'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle>PASSKEY 管理</CardTitle>
            <CardDescription>使用平台认证器提升控制台登录安全性。</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={handleRegisterPasskey} disabled={regLoading}>{regLoading ? '注册中...' : '新增 PASSKEY'}</Button>
        </CardHeader>
        <CardContent>
          {regError && <Alert variant="destructive" className="mb-5">{regError}</Alert>}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="loading-spinner" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-zinc-500">{error}</p>
          ) : passkeys.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">暂无 PASSKEY</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>编号</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passkeys.map((pk) => (
                    <TableRow key={pk.id}>
                      <TableCell className="font-medium text-zinc-950">PASSKEY #{pk.id + 1}</TableCell>
                      <TableCell>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDeletePasskey(pk.id)}>删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
