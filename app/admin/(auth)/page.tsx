'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

interface StatsData {
  total_requests?: number;
  total_bytes_sent?: number;
  unique_paths?: number;
  top_urls?: Array<{ request_path: string; request_count: number; bytes_sent: number }>;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchStats = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/admin/api/stats?page=${pageNum}&page_size=${pageSize}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('获取数据失败');
      }
      const data = await res.json();
      setStats(data);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchStats(page);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchStats, page]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchStats(page);
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchStats, page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setLoading(true);
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (stats && page < (stats.total_pages || 1)) {
      setLoading(true);
      setPage(page + 1);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <CardTitle>加载失败</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => fetchStats(page)}>重试</Button>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    { label: '总请求数', value: stats?.total_requests ? formatNumber(stats.total_requests) : '--' },
    { label: '总发送字节', value: stats?.total_bytes_sent ? formatBytes(stats.total_bytes_sent) : '--' },
    { label: '独立 URL 数', value: stats?.unique_paths ? formatNumber(stats.unique_paths) : '--' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">仪表盘</h1>
          <p className="mt-2 text-sm text-zinc-500">查看 fastjs.qixz.cn 请求、流量和热门资源。</p>
        </div>
        <Badge variant="success">自动刷新 30s · {lastRefresh.toLocaleTimeString('zh-CN')}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-6">
              <strong className="block text-4xl font-semibold tracking-tight text-zinc-950">{item.value}</strong>
              <span className="mt-2 block text-sm text-zinc-500">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top URL</CardTitle>
          <CardDescription>按请求量排序的热门资源路径。</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.top_urls && stats.top_urls.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-zinc-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead className="w-[110px]">请求数</TableHead>
                      <TableHead className="w-[110px]">流量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.top_urls.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="break-all font-mono text-xs text-zinc-800">{item.request_path}</TableCell>
                        <TableCell className="font-semibold text-zinc-950">{formatNumber(item.request_count)}</TableCell>
                        <TableCell>{formatBytes(item.bytes_sent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {(stats.total_pages || 0) > 1 && (
                <div className="mt-5 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={handlePrevPage} disabled={page <= 1}>上一页</Button>
                  <span className="text-sm text-zinc-500">第 {page} / {stats.total_pages} 页</span>
                  <Button variant="outline" onClick={handleNextPage} disabled={page >= (stats.total_pages || 1)}>下一页</Button>
                </div>
              )}
            </>
          ) : (
            <p className="py-10 text-center text-sm text-zinc-500">暂无数据</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
