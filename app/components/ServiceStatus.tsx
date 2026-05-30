'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ServiceProbe {
  name: string;
  desc: string;
  image: string;
  url: string;
}

interface ServiceState extends ServiceProbe {
  online: boolean;
  latency: number;
}

const probes: ServiceProbe[] = [
  { name: 'Jsdelivr', desc: 'NPM / GitHub 公共库镜像', image: '/star/images/m-jsdelivr.png', url: 'https://cdn.jsdelivr.net/favicon.ico' },
  { name: 'Gravatar', desc: '头像资源稳定加速', image: '/star/images/m-gravater.png', url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=404&s=1' },
  { name: 'Cdnjs', desc: '前端库资源快速分发', image: '/star/images/m-google.png', url: 'https://cdnjs.cloudflare.com/favicon.ico' },
];

async function probeOne(svc: ServiceProbe): Promise<ServiceState> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const start = performance.now();

  try {
    await fetch(svc.url, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    const latency = Math.round(performance.now() - start);
    return { ...svc, online: true, latency };
  } catch {
    return { ...svc, online: false, latency: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

async function probeAll(): Promise<ServiceState[]> {
  return Promise.all(probes.map(probeOne));
}

export default function ServiceStatus() {
  const [services, setServices] = useState<ServiceState[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const runCheck = useCallback(async () => {
    const results = await probeAll();
    if (!mountedRef.current) return;
    setServices(results);
    setLastCheck(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    runCheck();
    const timer = setInterval(runCheck, 30000);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [runCheck]);

  return (
    <section className="status-section" aria-label="服务状态">
      <div className="section-heading compact">
        <span>实时监测</span>
        <h2>服务在线状态</h2>
      </div>
      <div className="status-strip">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="status-card status-skeleton">
                <div className="status-icon-skeleton" />
                <div className="status-line-skeleton" style={{ width: '60%' }} />
                <div className="status-line-skeleton" style={{ width: '40%' }} />
              </div>
            ))
          : services.map((svc) => (
              <article key={svc.name} className="status-card">
                <div className="status-card-head">
                  <Image src={svc.image} width={44} height={44} alt={`${svc.name} logo`} />
                  <div className="status-card-info">
                    <h3>{svc.name}</h3>
                    <p>{svc.desc}</p>
                  </div>
                </div>
                <div className="status-card-metrics">
                  <span className={`status-badge ${svc.online ? 'online' : 'offline'}`}>
                    <i className="status-dot" />
                    {svc.online ? '在线' : '离线'}
                  </span>
                  <span className="status-latency">
                    {svc.online ? `${svc.latency}ms` : '--'}
                  </span>
                </div>
              </article>
            ))}
      </div>
      {lastCheck && (
        <p className="status-footnote">
          上次检测 {lastCheck.toLocaleTimeString('zh-CN')} · 每 30 秒自动刷新
        </p>
      )}
    </section>
  );
}
