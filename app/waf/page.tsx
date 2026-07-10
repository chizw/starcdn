import Link from 'next/link';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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
    <main className="page-shell overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(239,68,68,0.10),transparent_26rem),linear-gradient(to_bottom,#fff,#fafafa)]" />
      <header className="container-shell flex items-center justify-between border-b border-zinc-200/70 py-4">
        <Link className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-950" href="/" aria-label="StarCDN 首页">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white">S</span>
          <span>StarCDN</span>
        </Link>
        <Badge variant="destructive">Security Interception</Badge>
      </header>

      <section className="container-shell grid min-h-[calc(100vh-81px)] items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="waf-title">
        <div>
          <Badge variant="outline" className="mb-6 bg-white">Request blocked</Badge>
          <h1 id="waf-title" className="text-5xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-6xl">访问已被安全策略拦截。</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">StarCDN 检测到当前 URL 命中封禁规则。为保护公共资源分发链路，该请求不会继续读取缓存或转发到上游。</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white" href="/">返回首页</Link>
            <a className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-950 shadow-sm" href="mailto:help@wuxit.cn?subject=StarCDN%20WAF%20%E7%94%B3%E8%AF%89">联系申诉</a>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-zinc-950 p-8 text-white">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>StarCDN WAF</span>
              <span>Policy enforced</span>
            </div>
            <strong className="mt-10 block text-8xl font-semibold tracking-[-0.08em]">403</strong>
            <p className="mt-3 text-zinc-300">Policy enforced before origin fetch</p>
          </div>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            {signals.map((signal) => (
              <div key={signal.label} className="rounded-2xl bg-zinc-50 p-4">
                <span className="text-xs text-zinc-500">{signal.label}</span>
                <strong className="mt-2 block text-sm font-semibold text-zinc-950">{signal.value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="container-shell pb-20" aria-labelledby="waf-detail-title">
        <span className="section-kicker">What happened</span>
        <h2 id="waf-detail-title" className="section-title mt-3">为什么会看到这个页面？</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {checks.map((check, index) => (
            <Card key={check}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">{String(index + 1).padStart(2, '0')}</Badge>
                <CardTitle className="text-base leading-7">{check}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
