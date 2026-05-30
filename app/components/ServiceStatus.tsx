'use client';

import { useEffect, useState, useRef } from 'react';

interface ServiceStats {
  name: string;
  total_requests: number;
  total_bytes: number;
  online: boolean;
}

interface Props {
  serviceName: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function ServiceStatus({ serviceName }: Props) {
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchStats() {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' });
        if (!res.ok || !mountedRef.current) return;
        const data: ServiceStats[] = await res.json();
        const found = data.find((s) => s.name === serviceName);
        if (found && mountedRef.current) {
          setStats(found);
        }
      } catch {
      } finally {
        if (mountedRef.current) setLoaded(true);
      }
    }

    fetchStats();
    const timer = setInterval(fetchStats, 30000);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [serviceName]);

  if (!loaded) {
    return (
      <div className="service-stats">
        <div className="stats-row">
          <div className="stats-skeleton" />
          <div className="stats-skeleton" />
        </div>
      </div>
    );
  }

  const display = stats ?? { name: serviceName, total_requests: 0, total_bytes: 0, online: false };

  return (
    <div className="service-stats">
      <div className="stats-row">
        <div className="stats-item">
          <span className="stats-label">请求数</span>
          <strong className="stats-value">{formatNumber(display.total_requests)}</strong>
        </div>
        <div className="stats-item">
          <span className="stats-label">带宽</span>
          <strong className="stats-value">{formatBytes(display.total_bytes)}</strong>
        </div>
      </div>
      <div className="stats-status">
        <span className={`status-badge ${display.online ? 'online' : 'offline'}`}>
          <i className="status-dot" />
          {display.online ? '运行中' : '离线'}
        </span>
      </div>
    </div>
  );
}
