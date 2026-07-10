'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const reasons = [
  { title: '路径不存在', desc: '请求的 URL 路径未匹配到任何代理路由或静态资源。' },
  { title: '链接已失效', desc: '资源可能已被上游删除、重命名或从未存在。' },
  { title: '拼写有误', desc: '检查 URL 中的包名、版本号与文件路径是否完整正确。' },
];

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
    <main className="page-shell overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(39,39,42,0.10),transparent_26rem),linear-gradient(to_bottom,#fff,#fafafa)]" />
      <header className="container-shell flex items-center justify-between border-b border-zinc-200/70 py-4">
        <Link className="flex items-center gap-3" href="/" aria-label="StarCDN 首页">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <Image src="/favicon.ico" alt="StarCDN" width={24} height={24} />
          </span>
          <div className="leading-tight">
            <strong className="block text-sm font-semibold text-zinc-950">StarCDN</strong>
            <span className="text-xs text-zinc-500">fastjs.qixz.cn</span>
          </div>
        </Link>
        <Badge variant="secondary">Page Not Found</Badge>
      </header>

      <section className="container-shell grid min-h-[calc(100vh-81px)] items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="nf-title">
        <div>
          <Badge variant="outline" className="mb-6 bg-white">Error 404</Badge>
          <h1 id="nf-title" className="text-5xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-6xl">页面不存在或已被移除。</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">你访问的资源路径未命中任何代理规则，也不对应站点内的静态页面。请确认地址是否正确。</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white" href="/">返回首页</Link>
            <Link className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-950 shadow-sm" href="#nf-info">了解详情</Link>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-zinc-950 p-8 text-white">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>StarCDN Router</span>
              <span>Route not matched</span>
            </div>
            <strong className="mt-10 block text-8xl font-semibold tracking-[-0.08em]">404</strong>
            <p className="mt-3 text-zinc-300">自动跳转倒计时</p>
          </div>
          <CardContent className="p-6">
            <div className="rounded-2xl bg-zinc-50 p-6 text-center">
              <span className="text-sm text-zinc-500">自动跳转</span>
              <strong className="mt-2 block text-5xl font-semibold tracking-tight text-zinc-950">{seconds}s</strong>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container-shell pb-20" id="nf-info" aria-labelledby="nf-info-title">
        <span className="section-kicker">What happened</span>
        <h2 id="nf-info-title" className="section-title mt-3">为什么会看到这个页面？</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reasons.map((reason, index) => (
            <Card key={reason.title}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">{String(index + 1).padStart(2, '0')}</Badge>
                <CardTitle>{reason.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-zinc-600">{reason.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
