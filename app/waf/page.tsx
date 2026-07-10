import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export const metadata = {
  title: '访问已被 StarCDN 安全策略拦截',
  description: '当前请求触发 StarCDN 安全策略，访问已被阻止。',
  robots: { index: false, follow: false },
};

const signals = [
  { label: '策略命中', value: 'Blocked' },
  { label: '响应状态', value: '302 → /waf' },
  { label: '缓存状态', value: 'Bypassed' },
];

const checks = [
  '请求路径命中站点封禁规则',
  '访问已在回源与缓存读取前中止',
  '如需申诉，请提供完整资源 URL 与用途说明',
];

export default function WafPage() {
  return (
    <main className="page-bg">
      <div className="page-noise" />
      <header className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto mt-[26px] py-4 flex items-center justify-between gap-6 border-b border-line max-[640px]:w-[min(calc(100%-26px),1160px)] max-[640px]:py-3">
        <Link className="inline-flex items-center [filter:saturate(0.86)_contrast(0.96)]" href="/" aria-label="StarCDN 首页">
          <Image src="/star/images/logo.png" width={156} height={48} alt="StarCDN" priority style={{ objectFit: 'contain' }} />
        </Link>
        <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Security Interception</span>
      </header>

      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto grid grid-cols-[minmax(0,1fr)_minmax(330px,0.76fr)] items-center gap-16 min-h-[710px] py-[78px_0_56px] max-[980px]:grid-cols-1 max-[980px]:min-h-0 max-[980px]:pt-16 max-[640px]:w-[min(calc(100%-26px),1160px)]" aria-labelledby="waf-title">
        <div>
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Request blocked</span>
          <h1 id="waf-title" className="font-heading mt-[22px] max-w-[840px] text-[clamp(4.2rem,8vw,8.8rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance max-[640px]:text-[clamp(3.05rem,17vw,5.1rem)]">访问已被安全策略拦截。</h1>
          <p className="mt-7 max-w-[660px] text-muted text-[clamp(1.04rem,1.9vw,1.22rem)] leading-[1.9]">StarCDN 检测到当前 URL 命中封禁规则。为保护公共资源分发链路，该请求不会继续读取缓存或转发到上游。</p>
          <div className="flex flex-wrap gap-3 mt-[38px]">
            <Button asChild size="lg" className="rounded-full px-6 min-h-[52px] font-extrabold">
              <Link href="/">返回首页</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-6 min-h-[52px] font-extrabold hover:bg-surface">
              <a href="mailto:help@wuxit.cn?subject=StarCDN%20WAF%20%E7%94%B3%E8%AF%89">联系申诉</a>
            </Button>
          </div>
        </div>

        <div className="panel-bg p-8 grid gap-6 overflow-hidden" aria-label="拦截详情">
          <div className="relative h-[88px] flex items-center justify-center gap-[14px]" aria-hidden="true">
            <span className="relative w-3 h-3 rounded-full bg-foreground shadow-[0_0_0_8px_rgba(23,23,19,0.05)] [animation:orbitPulse_3.4s_ease-in-out_infinite]" />
            <span className="relative w-3 h-3 rounded-full bg-clay shadow-[0_0_0_8px_rgba(23,23,19,0.05)] [animation:orbitPulse_3.4s_ease-in-out_infinite_0.4s]" />
            <span className="relative w-3 h-3 rounded-full bg-moss shadow-[0_0_0_8px_rgba(23,23,19,0.05)] [animation:orbitPulse_3.4s_ease-in-out_infinite_0.8s]" />
          </div>
          <div className="relative p-6 border border-line rounded-[var(--radius-lg)] bg-[rgba(255,252,245,0.48)]">
            <span className="block text-muted text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">StarCDN WAF</span>
            <strong className="block mt-[14px] font-heading text-[clamp(3.2rem,6vw,5rem)] font-black leading-none tracking-[-0.08em] text-foreground">403</strong>
            <p className="mt-3 text-muted text-[0.96rem] leading-[1.6]">Policy enforced before origin fetch</p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 max-[980px]:grid-cols-1">
            {signals.map((signal) => (
              <article key={signal.label} className="p-[18px] border border-line-soft rounded-2xl bg-[rgba(255,252,245,0.5)] transition-[transform,background] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-surface-strong hover:-translate-y-0.5">
                <span className="block text-moss text-[0.72rem] font-extrabold tracking-[0.16em] uppercase">{signal.label}</span>
                <strong className="block mt-2 text-foreground font-heading text-[1.12rem] font-extrabold tracking-[-0.04em]">{signal.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]" aria-labelledby="waf-detail-title">
        <div className="max-w-[610px] mb-[38px]">
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">What happened</span>
          <h2 id="waf-detail-title" className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">为什么会看到这个页面？</h2>
        </div>
        <div className="grid grid-cols-3 border-y border-line max-[980px]:grid-cols-1">
          {checks.map((check, index) => (
            <article key={check} className="p-[32px_30px] border-r border-line-soft last:border-r-0 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(255,252,245,0.38)] hover:-translate-y-1 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:border-line-soft last:max-[980px]:border-b-0">
              <span className="text-[rgba(184,121,74,0.78)] text-[2.7rem] font-extrabold tracking-[-0.08em]">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-[18px] text-muted leading-[1.78]">{check}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
