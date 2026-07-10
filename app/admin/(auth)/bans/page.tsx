'use client';

import { useEffect, useState, useCallback } from 'react';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

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
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">封禁规则</h1>
        <p className="mt-2 text-sm text-zinc-500">管理会在回源与缓存读取前生效的 URL 拦截规则。</p>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      <Card>
        <CardHeader>
          <CardTitle>添加封禁规则</CardTitle>
          <CardDescription>支持路径或通配符模式，例如 *.exe 或 /npm/twikoo*。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end" onSubmit={handleCreateRule}>
            <div className="space-y-2">
              <Label htmlFor="pattern">匹配模式</Label>
              <Input id="pattern" type="text" placeholder="例如：*.exe 或 /npm/twikoo*" value={pattern} onChange={(e) => setPattern(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">原因</Label>
              <Input id="reason" type="text" placeholder="封禁原因说明（可选）" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? '添加中...' : '添加规则'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>规则列表</CardTitle>
          <CardDescription>当前生效的拦截规则。</CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">ID</TableHead>
                    <TableHead>模式</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead className="w-[180px]">创建时间</TableHead>
                    <TableHead className="w-[90px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-semibold text-zinc-950">{rule.id}</TableCell>
                      <TableCell className="break-all font-mono text-xs text-zinc-800">{rule.pattern}</TableCell>
                      <TableCell>{rule.reason || '--'}</TableCell>
                      <TableCell className="text-xs">{rule.created_at ? new Date(rule.created_at).toLocaleString('zh-CN') : '--'}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>删除</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-500">暂无封禁规则</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
