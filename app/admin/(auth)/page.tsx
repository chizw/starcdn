'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

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
        <div className="inline-block w-[18px] h-[18px] border-2 border-line border-t-moss rounded-full [animation:spin_0.8s_linear_infinite]" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-20 text-clay">
        <p>{error}</p>
        <Button variant="secondary" onClick={() => fetchStats(page)} className="mt-4">重试</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-black text-foreground tracking-[-0.065em] m-0">仪表盘</h1>
        <div className="inline-flex items-center gap-2 text-muted text-[0.84rem] font-bold">
          <span className="w-2 h-2 rounded-full bg-moss [animation:pulse_2s_ease-in-out_infinite]" />
          自动刷新 30s · {lastRefresh.toLocaleTimeString('zh-CN')}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-7 max-[768px]:grid-cols-1">
        <Card className="transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(49,41,26,0.14)]">
          <strong className="block text-[clamp(2rem,4vw,3rem)] font-black text-foreground tracking-[-0.07em] leading-none">{stats?.total_requests ? formatNumber(stats.total_requests) : '--'}</strong>
          <span className="block mt-[10px] text-muted font-bold text-[0.92rem]">总请求数</span>
        </Card>
        <Card className="transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(49,41,26,0.14)]">
          <strong className="block text-[clamp(2rem,4vw,3rem)] font-black text-foreground tracking-[-0.07em] leading-none">{stats?.total_bytes_sent ? formatBytes(stats.total_bytes_sent) : '--'}</strong>
          <span className="block mt-[10px] text-muted font-bold text-[0.92rem]">总发送字节</span>
        </Card>
        <Card className="transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(49,41,26,0.14)]">
          <strong className="block text-[clamp(2rem,4vw,3rem)] font-black text-foreground tracking-[-0.07em] leading-none">{stats?.unique_paths ? formatNumber(stats.unique_paths) : '--'}</strong>
          <span className="block mt-[10px] text-muted font-bold text-[0.92rem]">独立 URL 数</span>
        </Card>
      </div>

      <Card>
        <h2 className="font-heading text-[1.34rem] font-extrabold text-foreground m-0 mb-5 tracking-[-0.02em]">Top URL</h2>
        {stats?.top_urls && stats.top_urls.length > 0 ? (
          <>
            <div className="max-h-[480px] overflow-y-auto rounded-xl [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb:hover]:bg-muted">
              <table className="w-full border-collapse text-[0.94rem] max-[768px]:text-[0.84rem]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em]">URL</th>
                    <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em] w-[100px]">请求数</th>
                    <th className="px-4 py-3 text-left font-extrabold text-foreground border-b border-line text-[0.84rem] uppercase tracking-[0.06em] w-[100px]">流量</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_urls.map((item, i) => (
                    <tr key={i} className="hover:bg-[rgba(255,252,245,0.38)] last:[&>td]:border-b-0">
                      <td className="px-4 py-[14px] border-b border-line-soft text-ink-soft font-mono text-[0.84rem] [word-break:break-all]">{item.request_path}</td>
                      <td className="px-4 py-[14px] border-b border-line-soft text-ink-soft font-extrabold">{formatNumber(item.request_count)}</td>
                      <td className="px-4 py-[14px] border-b border-line-soft text-muted">{formatBytes(item.bytes_sent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(stats.total_pages || 0) > 1 && (
              <div className="flex items-center justify-center gap-4 pt-5 border-t border-line-soft mt-5">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1} className="disabled:opacity-40 disabled:cursor-not-allowed">上一页</Button>
                <span className="text-muted font-bold text-[0.84rem]">第 {page} / {stats.total_pages} 页</span>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= (stats.total_pages || 1)} className="disabled:opacity-40 disabled:cursor-not-allowed">下一页</Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted text-center py-10">暂无数据</p>
        )}
      </Card>
    </>
  );
}
