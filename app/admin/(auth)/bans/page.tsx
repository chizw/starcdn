'use client';

import { useEffect, useState, useCallback } from 'react';

interface BanRule {
  id: number;
  pattern: string;
  reason: string;
  created_at?: string;
}

export default function BansPage() {
  const [rules, setRules] = useState<BanRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pattern, setPattern] = useState('');
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
    const timer = window.setTimeout(() => {
      fetchRules();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchRules]);

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault();
    if (!pattern.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/admin/api/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建失败');
      }
      setPattern('');
      setReason('');
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
      <div className="admin-loading">
        <span className="admin-loading-dot" />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">封禁规则</h1>
          <p className="admin-page-desc">管理会在回源与缓存读取前生效的 URL 拦截规则。</p>
        </div>
        <span className="admin-badge">{rules.length} 条规则</span>
      </div>

      {error && <div className="admin-alert" role="alert">{error}</div>}

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">添加封禁规则</h2>
            <p className="admin-card-desc">支持路径或通配符模式，例如 <code>*.exe</code> 或 <code>/npm/twikoo*</code>。</p>
          </div>
        </div>
        <div className="admin-card-body">
          <form className="admin-form-grid" onSubmit={handleCreateRule}>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="pattern">匹配模式</label>
              <input
                id="pattern"
                type="text"
                className="admin-input"
                placeholder="例如 *.exe 或 /npm/twikoo*"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                required
              />
            </div>
            <div className="admin-field" style={{ marginBottom: 0 }}>
              <label className="admin-label" htmlFor="reason">原因</label>
              <input
                id="reason"
                type="text"
                className="admin-input"
                placeholder="封禁原因说明（可选）"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn" disabled={submitting}>
              {submitting ? '添加中…' : '添加规则'}
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">规则列表</h2>
            <p className="admin-card-desc">当前生效的拦截规则。</p>
          </div>
        </div>
        <div className="admin-card-body">
          {rules.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--admin-border)' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>ID</th>
                    <th>模式</th>
                    <th>原因</th>
                    <th style={{ width: 180 }}>创建时间</th>
                    <th style={{ width: 100 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 600 }}>#{rule.id}</td>
                      <td style={{ wordBreak: 'break-all', fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)', fontSize: 12 }}>{rule.pattern}</td>
                      <td>{rule.reason || '--'}</td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-soft)' }}>
                        {rule.created_at ? new Date(rule.created_at).toLocaleString('zh-CN') : '--'}
                      </td>
                      <td>
                        <button type="button" className="admin-btn is-danger" onClick={() => handleDeleteRule(rule.id)}>删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">暂无封禁规则</div>
          )}
        </div>
      </div>
    </div>
  );
}
