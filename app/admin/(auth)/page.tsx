'use client';

import { useEffect, useState, useCallback } from 'react';

interface StatsData {
  total_requests?: number;
  total_bytes_sent?: number;
  unique_paths?: number;
  top_urls?: Array<{ request_path: string; request_count: number }>;
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

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/admin/api/stats', { cache: 'no-store' });
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    const timer = setInterval(fetchStats, 30000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  if (loading) {
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
        <button className="secondary-action" onClick={fetchStats} style={{ marginTop: '16px' }}>
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
          <table className="admin-table">
            <thead>
              <tr>
                <th>URL</th>
                <th style={{ width: '120px' }}>请求数</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_urls.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem', wordBreak: 'break-all' }}>
                    {item.request_path}
                  </td>
                  <td style={{ fontWeight: 800 }}>{formatNumber(item.request_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>暂无数据</p>
        )}
      </div>
    </>
  );
}
