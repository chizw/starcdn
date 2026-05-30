'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="not-found-page">
      <div className="home-noise" />
      <header className="nf-header">
        <Link className="brand" href="/" aria-label="StarCDN 首页">
          <Image src="/star/images/logo.png" width={156} height={48} alt="StarCDN" priority />
        </Link>
        <span>Page Not Found</span>
      </header>

      <section className="nf-hero" aria-labelledby="nf-title">
        <div className="nf-copy">
          <span className="eyebrow">Error 404</span>
          <h1 id="nf-title">页面不存在或已被移除。</h1>
          <p>你访问的资源路径未命中任何代理规则，也不对应站点内的静态页面。请确认地址是否正确。</p>
          <div className="nf-actions">
            <Link className="primary-action" href="/">返回首页</Link>
            <Link className="secondary-action" href="#nf-info">了解详情</Link>
          </div>
        </div>

        <div className="nf-panel" aria-hidden="true">
          <div className="nf-orbit">
            <span /><span /><span />
          </div>
          <div className="nf-status">
            <span>StarCDN Router</span>
            <strong>404</strong>
            <p>Route not matched</p>
          </div>
          <div className="nf-countdown">
            <span>自动跳转</span>
            <strong>{seconds}s</strong>
          </div>
        </div>
      </section>

      <section className="nf-info" id="nf-info" aria-labelledby="nf-info-title">
        <div className="section-heading compact">
          <span>What happened</span>
          <h2 id="nf-info-title">为什么会看到这个页面？</h2>
        </div>
        <div className="nf-reasons">
          <article className="nf-reason-card">
            <span>01</span>
            <h3>路径不存在</h3>
            <p>请求的 URL 路径未匹配到任何代理路由或静态资源。</p>
          </article>
          <article className="nf-reason-card">
            <span>02</span>
            <h3>链接已失效</h3>
            <p>资源可能已被上游删除、重命名或从未存在。</p>
          </article>
          <article className="nf-reason-card">
            <span>03</span>
            <h3>拼写有误</h3>
            <p>检查 URL 中的包名、版本号与文件路径是否完整正确。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
