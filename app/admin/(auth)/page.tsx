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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--clay)' }}>
        <p>{error}</p>
        <button className="secondary-action" onClick={() => fetchStats(page)} style={{ marginTop: '16px' }}>
          重试
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 className="admin-title" style={{ margin: 0 }}>仪表盘</h1>
        <div className="refresh-indicator">
          <span className="refresh-dot" />
          自动刷新 30s · {lastRefresh.toLocaleTimeString('zh-CN')}
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <strong>{stats?.total_requests ? formatNumber(stats.total_requests) : '--'}</strong>
          <span>总请求数</span>
        </div>
        <div className="stat-card">
          <strong>{stats?.total_bytes_sent ? formatBytes(stats.total_bytes_sent) : '--'}</strong>
          <span>总发送字节</span>
        </div>
        <div className="stat-card">
          <strong>{stats?.unique_paths ? formatNumber(stats.unique_paths) : '--'}</strong>
          <span>独立 URL 数</span>
        </div>
      </div>

      <div className="admin-card">
        <h2>Top URL</h2>
        {stats?.top_urls && stats.top_urls.length > 0 ? (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th style={{ width: '100px' }}>请求数</th>
                    <th style={{ width: '100px' }}>流量</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_urls.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem', wordBreak: 'break-all' }}>
                        {item.request_path}
                      </td>
                      <td style={{ fontWeight: 800 }}>{formatNumber(item.request_count)}</td>
                      <td style={{ color: 'var(--muted)' }}>{formatBytes(item.bytes_sent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(stats.total_pages || 0) > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={page <= 1}
                >
                  上一页
                </button>
                <span className="pagination-info">
                  第 {page} / {stats.total_pages} 页
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={page >= (stats.total_pages || 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>暂无数据</p>
        )}
      </div>
    </>
  );
}
