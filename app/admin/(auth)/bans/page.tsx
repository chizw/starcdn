'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

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
      <div className="flex justify-center py-20">
        <div className="inline-block w-[18px] h-[18px] border-2 border-line border-t-moss rounded-full [animation:spin_0.8s_linear_infinite]" />
      </div>
    );
  }

  return (
    <>
      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-black text-foreground tracking-[-0.065em] m-0 mb-8">封禁规则</h1>

      {error && (
        <div className="bg-[rgba(184,121,74,0.12)] border border-[rgba(184,121,74,0.3)] text-clay px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      <Card className="mb-7">
        <h2 className="font-heading text-[1.34rem] font-extrabold text-foreground m-0 mb-5 tracking-[-0.02em]">添加封禁规则</h2>
        <form className="flex flex-col gap-4" onSubmit={handleCreateRule}>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-[768px]:min-w-0">
            <label htmlFor="pattern" className="font-bold text-[0.84rem] text-ink-soft">匹配模式</label>
            <input
              id="pattern"
              className="py-[10px] px-[14px] border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-[0.94rem] transition-[border-color,box-shadow] focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
              type="text"
              placeholder="例如：*.exe 或 /npm/twikoo*"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px] max-[768px]:min-w-0">
            <label htmlFor="reason" className="font-bold text-[0.84rem] text-ink-soft">原因</label>
            <input
              id="reason"
              className="py-[10px] px-[14px] border border-line rounded-xl bg-[rgba(255,252,245,0.6)] text-foreground text-[0.94rem] transition-[border-color,box-shadow] focus:outline-none focus:border-moss focus:shadow-[0_0_0_3px_rgba(111,125,82,0.15)]"
              type="text"
              placeholder="封禁原因说明（可选）"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div>
            <Button type="submit" disabled={submitting}>{submitting ? '添加中...' : '添加规则'}</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="font-heading text-[1.34rem] font-extrabold text-foreground m-0 mb-5 tracking-[-0.02em]">规则列表</h2>
        {rules.length > 0 ? (
          <table className="w-full border-collapse text-[0.94rem] max-[768px]:text-[0.84rem]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em] w-[60px]">ID</th>
                <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em]">模式</th>
                <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em]">原因</th>
                <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em] w-[160px]">创建时间</th>
                <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em] w-[80px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[rgba(255,252,245,0.38)] last:[&>td]:border-b-0">
                  <td className="px-4 py-[14px] border-b border-line-soft text-ink-soft font-extrabold">{rule.id}</td>
                  <td className="px-4 py-[14px] border-b border-line-soft text-ink-soft font-mono text-[0.84rem] [word-break:break-all]">{rule.pattern}</td>
                  <td className="px-4 py-[14px] border-b border-line-soft text-muted">{rule.reason || '--'}</td>
                  <td className="px-4 py-[14px] border-b border-line-soft text-muted text-[0.84rem]">{rule.created_at ? new Date(rule.created_at).toLocaleString('zh-CN') : '--'}</td>
                  <td className="px-4 py-[14px] border-b border-line-soft">
                    <Button variant="outline" size="sm" className="border-[rgba(184,121,74,0.4)] bg-[rgba(184,121,74,0.1)] text-clay hover:bg-[rgba(184,121,74,0.22)]" onClick={() => handleDeleteRule(rule.id)}>
                      删除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted text-center py-10">暂无封禁规则</p>
        )}
      </Card>
    </>
  );
}
