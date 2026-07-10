'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './components/ui/button';

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
    <main className="page-bg">
      <div className="page-noise" />
      <header className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto mt-[26px] py-4 flex items-center justify-between gap-6 border-b border-line max-[640px]:w-[min(calc(100%-26px),1160px)] max-[640px]:py-3">
        <Link className="inline-flex items-center [filter:saturate(0.86)_contrast(0.96)]" href="/" aria-label="StarCDN 首页">
          <Image src="/star/images/logo.png" width={156} height={48} alt="StarCDN" priority style={{ objectFit: 'contain' }} />
        </Link>
        <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Page Not Found</span>
      </header>

      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto grid grid-cols-[minmax(0,1fr)_minmax(330px,0.76fr)] items-center gap-16 min-h-[710px] py-[78px_0_56px] max-[980px]:grid-cols-1 max-[980px]:min-h-0 max-[980px]:pt-16 max-[640px]:w-[min(calc(100%-26px),1160px)]" aria-labelledby="nf-title">
        <div>
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Error 404</span>
          <h1 id="nf-title" className="font-heading mt-[22px] max-w-[840px] text-[clamp(4.2rem,8vw,8.8rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance max-[640px]:text-[clamp(3.05rem,17vw,5.1rem)]">页面不存在或已被移除。</h1>
          <p className="mt-7 max-w-[660px] text-muted text-[clamp(1.04rem,1.9vw,1.22rem)] leading-[1.9]">你访问的资源路径未命中任何代理规则，也不对应站点内的静态页面。请确认地址是否正确。</p>
          <div className="flex flex-wrap gap-3 mt-[38px]">
            <Button asChild size="lg" className="rounded-full px-6 min-h-[52px] font-extrabold">
              <Link href="/">返回首页</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-6 min-h-[52px] font-extrabold hover:bg-surface">
              <a href="#nf-info">了解详情</a>
            </Button>
          </div>
        </div>

        <div className="panel-bg p-8 grid gap-6 overflow-hidden" aria-hidden="true">
          <div className="relative h-[88px] flex items-center justify-center gap-[14px]">
            <span className="relative w-3 h-3 rounded-full bg-foreground shadow-[0_0_0_8px_rgba(23,23,19,0.05)] [animation:orbitPulse_3.4s_ease-in-out_infinite]" />
            <span className="relative w-3 h-3 rounded-full bg-clay shadow-[0_0_0_8px_rgba(23,23,19,0.05)] [animation:orbitPulse_3.4s_ease-in-out_infinite_0.4s]" />
            <span className="relative w-3 h-3 rounded-full bg-moss shadow-[0_0_0_8px_rgba(23,23,19,0.05)] [animation:orbitPulse_3.4s_ease-in-out_infinite_0.8s]" />
          </div>
          <div className="relative p-6 border border-line rounded-[var(--radius-lg)] bg-[rgba(255,252,245,0.48)]">
            <span className="block text-muted text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">StarCDN Router</span>
            <strong className="block mt-[14px] font-heading text-[clamp(3.2rem,6vw,5rem)] font-black leading-none tracking-[-0.08em] text-foreground">404</strong>
            <p className="mt-3 text-muted text-[0.96rem] leading-[1.6]">Route not matched</p>
          </div>
          <div className="relative p-[18px_24px] border border-line-soft rounded-2xl bg-[rgba(255,252,245,0.5)] flex items-center justify-between">
            <span className="text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">自动跳转</span>
            <strong className="text-foreground font-heading text-[1.6rem] font-black tracking-[-0.06em]">{seconds}s</strong>
          </div>
        </div>
      </section>

      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]" id="nf-info" aria-labelledby="nf-info-title">
        <div className="max-w-[610px] mb-[38px]">
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">What happened</span>
          <h2 id="nf-info-title" className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">为什么会看到这个页面？</h2>
        </div>
        <div className="grid grid-cols-3 border-y border-line max-[980px]:grid-cols-1">
          <article className="p-[32px_30px] border-r border-line-soft last:border-r-0 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(255,252,245,0.38)] hover:-translate-y-1 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:border-line-soft last:max-[980px]:border-b-0">
            <span className="text-[rgba(184,121,74,0.78)] text-[2.7rem] font-extrabold tracking-[-0.08em]">01</span>
            <h3 className="mt-[18px] mb-[10px] text-foreground text-[1.34rem]">路径不存在</h3>
            <p className="text-muted leading-[1.78]">请求的 URL 路径未匹配到任何代理路由或静态资源。</p>
          </article>
          <article className="p-[32px_30px] border-r border-line-soft last:border-r-0 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(255,252,245,0.38)] hover:-translate-y-1 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:border-line-soft last:max-[980px]:border-b-0">
            <span className="text-[rgba(184,121,74,0.78)] text-[2.7rem] font-extrabold tracking-[-0.08em]">02</span>
            <h3 className="mt-[18px] mb-[10px] text-foreground text-[1.34rem]">链接已失效</h3>
            <p className="text-muted leading-[1.78]">资源可能已被上游删除、重命名或从未存在。</p>
          </article>
          <article className="p-[32px_30px] border-r border-line-soft last:border-r-0 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(255,252,245,0.38)] hover:-translate-y-1 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:border-line-soft last:max-[980px]:border-b-0">
            <span className="text-[rgba(184,121,74,0.78)] text-[2.7rem] font-extrabold tracking-[-0.08em]">03</span>
            <h3 className="mt-[18px] mb-[10px] text-foreground text-[1.34rem]">拼写有误</h3>
            <p className="text-muted leading-[1.78]">检查 URL 中的包名、版本号与文件路径是否完整正确。</p>
          </article>
        </div>
      </section>
    </main>
  );
}
