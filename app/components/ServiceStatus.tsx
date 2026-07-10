'use client';

import { useEffect, useState, useRef } from 'react';
import { Badge } from './ui/badge';

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
      <div className="mt-auto pt-[18px] border-t border-line-soft">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-8 rounded-md bg-line-soft [animation:skeletonPulse_1.6s_ease-in-out_infinite]" />
          <div className="h-8 rounded-md bg-line-soft [animation:skeletonPulse_1.6s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  const display = stats ?? { name: serviceName, total_requests: 0, total_bytes: 0, online: false };

  return (
    <div className="mt-auto pt-[18px] border-t border-line-soft">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted text-[0.76rem] font-bold tracking-[0.06em] uppercase">请求数</span>
          <strong className="text-foreground text-[1.4rem] font-extrabold tracking-[-0.06em] [font-variant-numeric:tabular-nums] leading-none">{formatNumber(display.total_requests)}</strong>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted text-[0.76rem] font-bold tracking-[0.06em] uppercase">带宽</span>
          <strong className="text-foreground text-[1.4rem] font-extrabold tracking-[-0.06em] [font-variant-numeric:tabular-nums] leading-none">{formatBytes(display.total_bytes)}</strong>
        </div>
      </div>
      <div className="mt-[14px] flex items-center">
        <Badge variant={display.online ? 'default' : 'destructive'} className={`inline-flex items-center gap-[7px] text-[0.82rem] font-bold rounded-full px-2.5 py-0.5 ${display.online ? 'bg-transparent text-moss hover:bg-transparent' : 'bg-transparent text-destructive hover:bg-transparent'}`}>
          <i className={`inline-block w-[7px] h-[7px] rounded-full bg-current ${display.online ? '[animation:pulseDot_2.4s_ease-in-out_infinite]' : ''}`} />
          {display.online ? '运行中' : '离线'}
        </Badge>
      </div>
    </div>
  );
}
