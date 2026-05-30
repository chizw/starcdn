import Image from 'next/image';
import Link from 'next/link';
import ServiceStatus from './components/ServiceStatus';

const navItems = [
  { label: '能力', href: '#features' },
  { label: '接入', href: '#usage' },
  { label: '节点', href: '#network' },
  { label: '问答', href: '#faq' },
  { label: '反馈', href: '#feedback' },
];

const metrics = [
  { value: '∞', label: '公共资源覆盖' },
  { value: '99.9%', label: '服务可用性' },
  { value: '30ms', label: '大陆平均响应' },
  { value: '24/7', label: '安全监测' },
];

const services = [
  { name: 'Jsdelivr', desc: 'NPM / GitHub 公共库镜像', image: '/star/images/m-jsdelivr.png' },
  { name: 'Gravatar', desc: '头像资源稳定加速', image: '/star/images/m-gravater.png' },
  { name: 'Cdnjs', desc: '前端库资源快速分发', image: '/star/images/m-google.png' },
];

const features = [
  { kicker: 'Edge Routing', title: '就近调度', desc: '智能路由依据访问来源选择更优边缘节点，减少跨境链路抖动。' },
  { kicker: 'Sync Pipeline', title: '分钟级同步', desc: '热门资源持续追踪上游变化，兼顾缓存命中率与内容新鲜度。' },
  { kicker: 'Modern TLS', title: '全链路加密', desc: '默认支持 HTTPS、HTTP/2 与 HTTP/3，让公共资源加载更安全。' },
  { kicker: 'Zero Config', title: '零配置接入', desc: '无需控制台、无需注册，只替换域名即可获得 CDN 加速能力。' },
  { kicker: 'Cache Policy', title: '智能缓存', desc: '根据文件类型与热度自动匹配缓存策略，降低回源压力。' },
  { kicker: 'Open Spirit', title: '开放透明', desc: '面向开发者社区提供长期免费的基础服务，保持中立与可追溯。' },
];

const steps = [
  { title: '定位原始资源', code: '//cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js' },
  { title: '替换加速域名', code: '//jscdn.wuxit.cn/npm/jquery@3.6.0/dist/jquery.min.js' },
  { title: '写入项目代码', code: '<script src="//jscdn.wuxit.cn/npm/jquery@3.6.0/dist/jquery.min.js"></script>' },
  { title: '刷新并验证', code: 'F12 → Network → 查看资源加载来源与耗时' },
];

const recipes = [
  { name: 'Jsdelivr', source: '//cdn.jsdelivr.net', target: '//jscdn.wuxit.cn' },
  { name: 'Gravatar', source: '//www.gravatar.com/avatar', target: '//jscdn.wuxit.cn/avatar' },
  { name: 'Cdnjs', source: '//cdnjs.cloudflare.com/ajax/libs', target: '//jscdn.wuxit.cn/ajax/libs' },
];

const faqs = [
  { q: 'Star⭐CDN 是免费的吗？', a: '基础公共资源加速服务保持免费，适合个人站点、开源项目与中小型业务快速接入。' },
  { q: '资源如何保持更新？', a: '系统会按资源热度自动同步上游内容，也可以在链接后添加 ?flush=1 主动触发刷新。' },
  { q: '有哪些合理限制？', a: '免费服务面向公开资源，不适用于私有文件、大体积分发或异常高频滥用请求。' },
  { q: '遇到问题如何反馈？', a: '可以通过 help@wuxit.cn、GitHub Issues 或 QQ 群提交资源异常、安全风险和体验建议。' },
];

const networkFlows = [
  { from: '上游公共库', to: 'StarCDN 缓存层', desc: '按热度同步资源版本，降低直接回源频率。' },
  { from: '边缘分发', to: '国内访问侧', desc: '优先选择更稳定的访问路径，而不是展示虚假的全球节点数字。' },
  { from: '异常反馈', to: '缓存刷新', desc: '资源错误、过期或访问异常可进入人工排查与刷新流程。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'StarCDN',
  alternateName: '信网免费 CDN 加速服务',
  serviceType: '公共资源 CDN 镜像加速',
  provider: {
    '@type': 'Organization',
    name: '信网',
    url: 'https://jscdn.wuxit.cn',
  },
  areaServed: 'CN',
  url: 'https://jscdn.wuxit.cn',
  description: 'StarCDN 为 Jsdelivr、Gravatar、Cdnjs 等公共资源提供稳定、快速、免费的 CDN 镜像加速服务。',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export default function Home() {
  return (
    <main className="home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="home-noise" />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="StarCDN 首页">
          <Image src="/star/images/logo.png" width={156} height={48} alt="StarCDN" priority />
        </Link>
        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <a className="header-action" href="https://github.com/scfcn/StarCDN" target="_blank" rel="noreferrer">GitHub</a>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Public CDN for modern builders</span>
          <h1>让公共资源加载像星光一样快。</h1>
          <p>Star⭐CDN 为 Jsdelivr、Gravatar、Cdnjs 等公共资源提供稳定、轻量、无需配置的镜像加速服务，专为国内访问体验重新设计。</p>
          <div className="hero-actions">
            <a className="primary-action" href="#usage">立即接入</a>
            <a className="secondary-action" href="#features">了解能力</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="signal-field">
            <span className="signal-point point-one" />
            <span className="signal-point point-two" />
            <span className="signal-point point-three" />
            <span className="signal-point point-four" />
            <i className="signal-line line-one" />
            <i className="signal-line line-two" />
            <i className="signal-line line-three" />
          </div>
          <div className="latency-mark">
            <span>median latency</span>
            <strong>30ms</strong>
          </div>
        </div>
      </section>

      <section className="metrics-strip" aria-label="服务指标">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <ServiceStatus />

      <section className="service-section">
        <div className="section-heading compact">
          <span>镜像资源</span>
          <h2>把常用资源纳入同一条高速轨道</h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.name} className="service-card">
              <Image src={service.image} width={76} height={76} alt={`${service.name} CDN 镜像加速`} />
              <h3>{service.name}</h3>
              <p>{service.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="feature-section">
        <div className="section-heading">
          <span>核心能力</span>
          <h2>克制、稳定、快速，重新梳理 CDN 产品表达。</h2>
          <p>以性能、安全、透明和易接入为设计中心，把旧式组件堆叠重构成更清晰的产品叙事。</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span>{feature.kicker}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="network" className="network-section">
        <div className="network-copy">
          <span className="eyebrow">Delivery model</span>
          <h2>不堆假节点数字，只讲真实的分发路径。</h2>
          <p>公共库加速的关键不是地图上亮几个点，而是缓存、回源、刷新和访问侧路径是否足够稳定。这里用产品逻辑解释网络层，而不是制造“全球在线”的幻觉。</p>
        </div>
        <div className="network-panel">
          {networkFlows.map((flow, index) => (
            <article key={flow.from} className="network-flow" style={{ '--delay': `${index * 120}ms` } as React.CSSProperties}>
              <div className="flow-index">0{index + 1}</div>
              <div className="flow-main">
                <div className="flow-route">
                  <span>{flow.from}</span>
                  <i />
                  <span>{flow.to}</span>
                </div>
                <p>{flow.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="usage" className="usage-section">
        <div className="section-heading">
          <span>接入指南</span>
          <h2>四步完成替换，不改变你的工程结构。</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="step-card">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <code>{step.code}</code>
            </article>
          ))}
        </div>
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <article key={recipe.name} className="recipe-card">
              <h3>{recipe.name}</h3>
              <p>源地址：<code>{recipe.source}</code></p>
              <p>替换为：<code>{recipe.target}</code></p>
            </article>
          ))}
        </div>
      </section>

      <section className="partners-section">
        <div>
          <span className="eyebrow">Trusted ecosystem</span>
          <h2>与开放生态共同运行</h2>
        </div>
        <div className="partners-grid">
          <Image src="/img/cloudflare.svg" width={180} height={58} alt="Cloudflare CDN 基础设施" />
          <Image src="/img/fido-s.webp" width={180} height={58} alt="云驰互联合作生态" />
        </div>
      </section>

      <section id="faq" className="faq-section" aria-labelledby="heading-faq">
        <div className="section-heading compact">
          <span>FAQ</span>
          <h2 id="heading-faq">常见问题</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.q} className="faq-item">
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="feedback" className="feedback-section" aria-labelledby="heading-feedback">
        <div className="feedback-card">
          <div className="feedback-visual" aria-hidden="true">
            <Image src="/star/images/iocdn_feedback.png" width={280} height={220} alt="" />
          </div>
          <div className="feedback-content">
            <span className="eyebrow">Feedback loop</span>
            <h2 id="heading-feedback">发现异常？请直接告诉我们。</h2>
            <p>资源加载异常、访问变慢、证书错误、安全风险或滥用内容，都可以通过邮件、Issue 或群聊反馈。我们更重视清晰、具体、可复现的描述。</p>
            <div className="feedback-actions">
              <a className="feedback-button primary" href="mailto:help@wuxit.cn">
                <span>发送邮件</span>
                <strong>help@wuxit.cn</strong>
              </a>
              <a className="feedback-button secondary" href="https://github.com/scfcn/StarCDN/issues" target="_blank" rel="noreferrer">
                <span>提交 Issue</span>
                <strong>GitHub Repository</strong>
              </a>
              <a className="feedback-link" href="https://qm.qq.com/q/sugzhf6lQO" target="_blank" rel="noreferrer">加入 QQ 群沟通</a>
            </div>
            <div className="feedback-notes">
              <div>
                <strong>建议包含</strong>
                <p>资源地址、报错信息、访问时间和截图。</p>
              </div>
              <div>
                <strong>响应方式</strong>
                <p>优先邮件与 Issue，便于追踪和复现。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="main-footer">
        <div className="footer-brand">Star⭐CDN</div>
        <div className="footer-links">
          <a href="#features">产品能力</a>
          <a href="#usage">接入指南</a>
          <a href="https://jscdn.wuxit.cn" target="_blank" rel="noreferrer">信网智能 CDN</a>
          <a href="https://github.com/scfcn/StarCDN" target="_blank" rel="noreferrer">GitHub 项目</a>
        </div>
        <div className="footer-meta">
          <span>Copyright © 2024-2026 Star⭐CDN · 信网 · All Rights Reserved</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">ICP备案号待补充</a>
        </div>
      </footer>
    </main>
  );
}
