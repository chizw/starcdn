'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

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

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">设置</h1>
          <p className="admin-page-desc">管理 Rust 后端管理员密码与会话策略。</p>
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
              <input id="oldPassword" type="password" className="admin-input" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="newPassword">新密码</label>
              <input id="newPassword" type="password" className="admin-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="confirmPassword">确认新密码</label>
              <input id="confirmPassword" type="password" className="admin-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <button type="submit" className="admin-btn" disabled={pwdLoading}>
              {pwdLoading ? '保存中…' : '修改密码'}
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">认证说明</h2>
            <p className="admin-card-desc">Rust 破坏式迁移首版使用密码登录与服务端会话校验，Passkey 将作为后续 Rust 原生能力重新设计。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
