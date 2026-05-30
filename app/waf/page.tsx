import Image from 'next/image';
import Link from 'next/link';

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
    <main className="waf-page">
      <div className="home-noise" />
      <header className="waf-header">
        <Link className="brand" href="/" aria-label="StarCDN 首页">
          <Image src="/star/images/logo.png" width={156} height={48} alt="StarCDN" priority />
        </Link>
        <span>Security Interception</span>
      </header>

      <section className="waf-hero" aria-labelledby="waf-title">
        <div className="waf-copy">
          <span className="eyebrow">Request blocked</span>
          <h1 id="waf-title">访问已被安全策略拦截。</h1>
          <p>StarCDN 检测到当前 URL 命中封禁规则。为保护公共资源分发链路，该请求不会继续读取缓存或转发到上游。</p>
          <div className="waf-actions">
            <Link className="primary-action" href="/">返回首页</Link>
            <a className="secondary-action" href="mailto:help@wuxit.cn?subject=StarCDN%20WAF%20%E7%94%B3%E8%AF%89">联系申诉</a>
          </div>
        </div>

        <div className="waf-panel" aria-label="拦截详情">
          <div className="waf-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="waf-status">
            <span>StarCDN WAF</span>
            <strong>403</strong>
            <p>Policy enforced before origin fetch</p>
          </div>
          <div className="waf-signal-grid">
            {signals.map((signal) => (
              <article key={signal.label} className="waf-signal-card">
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="waf-detail" aria-labelledby="waf-detail-title">
        <div className="section-heading compact">
          <span>What happened</span>
          <h2 id="waf-detail-title">为什么会看到这个页面？</h2>
        </div>
        <div className="waf-check-list">
          {checks.map((check, index) => (
            <article key={check} className="waf-check-item">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{check}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
