'use client';

import { useEffect, useState, useCallback } from 'react';

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
      <div className="admin-loading">
        <span className="admin-loading-dot" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-card">
        <div className="admin-card-body" style={{ textAlign: 'center' }}>
          <h2 className="admin-card-title">加载失败</h2>
          <p className="admin-card-desc" style={{ marginTop: 8 }}>{error}</p>
          <div style={{ marginTop: 16 }}>
            <button type="button" className="admin-btn" onClick={() => fetchStats(page)}>重试</button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: '总请求数', value: stats?.total_requests ? formatNumber(stats.total_requests) : '--' },
    { label: '总发送字节', value: stats?.total_bytes_sent ? formatBytes(stats.total_bytes_sent) : '--' },
    { label: '独立 URL 数', value: stats?.unique_paths ? formatNumber(stats.unique_paths) : '--' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">仪表盘</h1>
          <p className="admin-page-desc">查看 fastjs.qixz.cn 的请求、流量和热门资源。</p>
        </div>
        <span className="admin-badge is-success">自动刷新 30s · {lastRefresh.toLocaleTimeString('zh-CN')}</span>
      </div>

      <div className="admin-stat-grid">
        {statCards.map((item) => (
          <div key={item.label} className="admin-stat">
            <div className="admin-stat-label">{item.label}</div>
            <div className="admin-stat-value">{item.value}</div>
            <div className="admin-stat-foot">来自当前统计周期</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Top URL</h2>
            <p className="admin-card-desc">按请求量排序的热门资源路径。</p>
          </div>
          <span className="admin-badge">每页 {pageSize} 条</span>
        </div>
        <div className="admin-card-body">
          {stats?.top_urls && stats.top_urls.length > 0 ? (
            <>
              <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--admin-border)' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>URL</th>
                      <th style={{ width: 110 }}>请求数</th>
                      <th style={{ width: 110 }}>流量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_urls.map((item, i) => (
                      <tr key={i}>
                        <td style={{ wordBreak: 'break-all', fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)', fontSize: 12 }}>{item.request_path}</td>
                        <td style={{ fontWeight: 600 }}>{formatNumber(item.request_count)}</td>
                        <td>{formatBytes(item.bytes_sent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(stats.total_pages || 0) > 1 && (
                <div className="admin-pagination">
                  <button type="button" className="admin-btn is-outline" onClick={handlePrevPage} disabled={page <= 1}>上一页</button>
                  <span>第 {page} / {stats.total_pages} 页</span>
                  <button type="button" className="admin-btn is-outline" onClick={handleNextPage} disabled={page >= (stats.total_pages || 1)}>下一页</button>
                </div>
              )}
            </>
          ) : (
            <div className="admin-empty">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
