'use client';

import { useEffect, useState, useCallback } from 'react';

interface BanRule {
  id: number;
  pattern: string;
  type: string;
  reason: string;
  created_at?: string;
}

export default function BansPage() {
  const [rules, setRules] = useState<BanRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pattern, setPattern] = useState('');
  const [banType, setBanType] = useState('URL');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch('/admin/api/ban', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('获取规则失败');
      }
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRules();
  }, [fetchRules]);

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    if (!pattern.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/admin/api/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, type: banType, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建失败');
      }
      setPattern('');
      setReason('');
      setBanType('URL');
      await fetchRules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRule(id: number) {
    try {
      const res = await fetch(`/admin/api/ban/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }
      await fetchRules();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <h1 className="admin-title">封禁规则</h1>

      {error && (
        <div style={{ background: 'rgba(184,121,74,0.12)', border: '1px solid rgba(184,121,74,0.3)', color: 'var(--clay)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <h2>添加封禁规则</h2>
        <form className="admin-form" onSubmit={handleCreateRule}>
          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: 2 }}>
              <label htmlFor="pattern">匹配模式</label>
              <input
                id="pattern"
                className="admin-form-input"
                type="text"
                placeholder="例如：*.exe 或 /path/to/*"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group" style={{ flex: 1 }}>
              <label htmlFor="banType">类型</label>
              <select
                id="banType"
                className="admin-form-select"
                value={banType}
                onChange={(e) => setBanType(e.target.value)}
              >
                <option value="URL">URL</option>
                <option value="package">package</option>
              </select>
            </div>
          </div>
          <div className="admin-form-group">
            <label htmlFor="reason">原因</label>
            <input
              id="reason"
              className="admin-form-input"
              type="text"
              placeholder="封禁原因说明（可选）"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="primary-action" disabled={submitting}>
              {submitting ? '添加中...' : '添加规则'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h2>规则列表</h2>
        {rules.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>模式</th>
                <th style={{ width: '100px' }}>类型</th>
                <th>原因</th>
                <th style={{ width: '160px' }}>创建时间</th>
                <th style={{ width: '80px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td style={{ fontWeight: 800 }}>{rule.id}</td>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem', wordBreak: 'break-all' }}>
                    {rule.pattern}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: rule.type === 'URL' ? 'rgba(111,125,82,0.15)' : 'rgba(178,147,84,0.15)',
                      color: rule.type === 'URL' ? 'var(--moss)' : 'var(--brass)',
                    }}>
                      {rule.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{rule.reason || '--'}</td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
                    {rule.created_at ? new Date(rule.created_at).toLocaleString('zh-CN') : '--'}
                  </td>
                  <td>
                    <button className="danger-action" onClick={() => handleDeleteRule(rule.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>暂无封禁规则</p>
        )}
      </div>
    </>
  );
}
