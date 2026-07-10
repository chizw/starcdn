import Image from 'next/image';
import Link from 'next/link';
import ServiceStatus from './components/ServiceStatus';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

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
  { title: '替换加速域名', code: '//fastjs.qixz.cn/npm/jquery@3.6.0/dist/jquery.min.js' },
  { title: '写入项目代码', code: '<script src="//fastjs.qixz.cn/npm/jquery@3.6.0/dist/jquery.min.js"></script>' },
  { title: '刷新并验证', code: 'F12 → Network → 查看资源加载来源与耗时' },
];

const recipes = [
  { name: 'Jsdelivr', source: '//cdn.jsdelivr.net', target: '//fastjs.qixz.cn' },
  { name: 'Gravatar', source: '//www.gravatar.com/avatar', target: '//fastjs.qixz.cn/avatar' },
  { name: 'Cdnjs', source: '//cdnjs.cloudflare.com/ajax/libs', target: '//fastjs.qixz.cn/ajax/libs' },
];

const faqs = [
  { q: 'Star⭐CDN 是免费的吗？', a: '基础公共资源加速服务保持免费，适合个人站点、开源项目与中小型业务快速接入。' },
  { q: '资源如何保持更新？', a: '系统会按资源热度自动同步上游内容，本地缓存仅保留约 10 分钟用于吸收短时流量峰值并给上游 CDN 留出缓存窗口。' },
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
    url: 'https://fastjs.qixz.cn',
  },
  areaServed: 'CN',
  url: 'https://fastjs.qixz.cn',
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
    <main className="page-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="page-noise" />

      {/* ── Header ── */}
      <header className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto mt-[26px] py-4 flex items-center justify-between gap-6 border-b border-line max-[640px]:w-[min(calc(100%-26px),1160px)] max-[640px]:py-3">
        <Link className="inline-flex items-center [filter:saturate(0.86)_contrast(0.96)]" href="/" aria-label="StarCDN 首页">
          <Image src="/star/images/logo.png" width={156} height={48} alt="StarCDN" priority style={{ objectFit: 'contain' }} />
        </Link>
        <nav className="flex items-center gap-1 max-[980px]:hidden" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="nav-link-underline relative px-[13px] py-[10px] text-[0.92rem] font-bold tracking-[0.01em] text-[rgba(23,23,19,0.68)] transition-colors duration-300 hover:text-foreground">{item.label}</a>
          ))}
        </nav>
        <a className="border border-line rounded-full px-[17px] py-[10px] text-[0.92rem] font-bold tracking-[0.01em] text-[rgba(23,23,19,0.68)] bg-[rgba(255,252,245,0.36)] transition-colors duration-300 hover:text-foreground max-[640px]:px-[13px] max-[640px]:py-[9px]" href="https://github.com/chizw/StarCDN" target="_blank" rel="noreferrer">GitHub</a>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto grid grid-cols-[minmax(0,1fr)_minmax(330px,0.76fr)] items-center gap-16 min-h-[710px] py-[78px_0_56px] max-[980px]:grid-cols-1 max-[980px]:min-h-0 max-[980px]:pt-16 max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div>
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Public CDN for modern builders</span>
          <h1 className="font-heading mt-[22px] max-w-[840px] text-[clamp(4.2rem,8vw,8.8rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance max-[640px]:text-[clamp(3.05rem,17vw,5.1rem)]">让公共资源加载像星光一样快。</h1>
          <p className="mt-7 max-w-[660px] text-muted text-[clamp(1.04rem,1.9vw,1.22rem)] leading-[1.9]">Star⭐CDN 为 Jsdelivr、Gravatar、Cdnjs 等公共资源提供稳定、轻量、无需配置的镜像加速服务，专为国内访问体验重新设计。</p>
          <div className="flex flex-wrap gap-3 mt-[38px]">
            <Button asChild size="lg" className="rounded-full px-6 min-h-[52px] font-extrabold">
              <a href="#usage">立即接入</a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-6 min-h-[52px] font-extrabold hover:bg-surface">
              <a href="#features">了解能力</a>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[500px] isolate max-[980px]:min-h-[420px] max-[640px]:min-h-[310px]" aria-hidden="true">
          <div className="signal-field">
            <span className="absolute z-[2] w-3 h-3 rounded-full bg-foreground shadow-[0_0_0_8px_rgba(23,23,19,0.05)] top-[18%] left-[36%]" />
            <span className="absolute z-[2] w-3 h-3 rounded-full bg-moss shadow-[0_0_0_8px_rgba(23,23,19,0.05)] top-[38%] right-[21%]" />
            <span className="absolute z-[2] w-3 h-3 rounded-full bg-clay shadow-[0_0_0_8px_rgba(23,23,19,0.05)] left-[24%] bottom-[25%]" />
            <span className="absolute z-[2] w-3 h-3 rounded-full bg-brass shadow-[0_0_0_8px_rgba(23,23,19,0.05)] right-[34%] bottom-[17%]" />
            <i className="absolute z-[1] h-px bg-gradient-to-r from-transparent via-[rgba(36,32,23,0.3)] to-transparent origin-left top-[29%] left-[38%] w-[35%] rotate-[18deg]" />
            <i className="absolute z-[1] h-px bg-gradient-to-r from-transparent via-[rgba(36,32,23,0.3)] to-transparent origin-left top-[49%] left-[26%] w-[49%] -rotate-[14deg]" />
            <i className="absolute z-[1] h-px bg-gradient-to-r from-transparent via-[rgba(36,32,23,0.3)] to-transparent origin-left bottom-[28%] left-[26%] w-[40%] rotate-[21deg]" />
          </div>
          <div className="absolute right-[3%] bottom-[10%] z-[3] py-[22px] px-6 border-l border-line bg-gradient-to-r from-[rgba(247,241,230,0.88)] to-[rgba(247,241,230,0.28)] backdrop-blur-[16px] max-[640px]:right-0 max-[640px]:bottom-[4%]">
            <span className="block text-muted text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">median latency</span>
            <strong className="block mt-[5px] text-[3.4rem] leading-none tracking-[-0.08em]">30ms</strong>
          </div>
        </div>
      </section>

      {/* ── Metrics Strip ── */}
      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto grid grid-cols-4 mb-[104px] border-y border-line max-[980px]:grid-cols-2 max-[640px]:w-[min(calc(100%-26px),1160px)] max-[640px]:grid-cols-1" aria-label="服务指标">
        {metrics.map((metric, i) => (
          <div key={metric.label} className={`py-7 px-[26px] border-r border-line-soft last:border-r-0 max-[980px]:border-b max-[980px]:border-r-0 [&:nth-child(2)]:max-[980px]:border-r-0 [&:nth-child(-n+2)]:max-[980px]:border-b max-[640px]:border-b max-[640px]:border-r-0 last:max-[640px]:border-b-0`}>
            <strong className="block text-foreground text-[clamp(2.1rem,4vw,3.8rem)] leading-none tracking-[-0.07em]">{metric.value}</strong>
            <span className="block mt-[13px] text-muted font-bold">{metric.label}</span>
          </div>
        ))}
      </section>

      {/* ── Service Section ── */}
      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div className="max-w-[780px] mb-[38px] [&.compact]:max-w-[610px] compact">
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">镜像资源</span>
          <h2 className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">把常用资源纳入同一条高速轨道</h2>
        </div>
        <div className="grid grid-cols-3 border-y border-line max-[980px]:grid-cols-1">
          {services.map((service) => (
            <Card key={service.name} className="flex flex-col p-[34px_30px] border-r border-line-soft last:border-r-0 bg-transparent border-0 rounded-none shadow-none transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[rgba(255,252,245,0.38)] hover:-translate-y-1 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:border-line-soft last:max-[980px]:border-b-0">
              <Image src={service.image} width={76} height={76} alt={`${service.name} CDN 镜像加速`} style={{ filter: 'saturate(0.74) contrast(0.96)' }} />
              <h3 className="mt-[18px] mb-[10px] text-foreground text-[1.34rem]">{service.name}</h3>
              <p className="text-muted leading-[1.78]">{service.desc}</p>
              <ServiceStatus serviceName={service.name} />
            </Card>
          ))}
        </div>
      </section>

      {/* ── Feature Section ── */}
      <section id="features" className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div className="max-w-[780px] mb-[38px]">
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">核心能力</span>
          <h2 className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">克制、稳定、快速，重新梳理 CDN 产品表达。</h2>
          <p className="text-muted text-[1.06rem] leading-[1.85]">以性能、安全、透明和易接入为设计中心，把旧式组件堆叠重构成更清晰的产品叙事。</p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-line max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
          {features.map((feature, i) => {
            const isDark = i === 1 || i === 4;
            return (
              <article key={feature.title} className={`min-h-[272px] p-8 transition-[background,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-[640px]:min-h-0 max-[640px]:p-[26px_22px] ${isDark ? 'bg-[#242723] hover:bg-[#2a2d28]' : 'bg-[rgba(247,241,230,0.82)] hover:bg-[rgba(255,252,245,0.74)]'} hover:-translate-y-[3px]`}>
                <span className={`inline-flex w-fit text-[0.74rem] font-extrabold tracking-[0.16em] uppercase ${isDark ? 'text-[rgba(214,196,153,0.86)]' : 'text-moss'}`}>{feature.kicker}</span>
                <h3 className={`mt-[18px] mb-[10px] text-[1.34rem] ${isDark ? 'text-background' : 'text-foreground'}`}>{feature.title}</h3>
                <p className={`leading-[1.78] ${isDark ? 'text-[rgba(247,241,230,0.7)]' : 'text-muted'}`}>{feature.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Network Section ── */}
      <section id="network" className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto grid grid-cols-[0.86fr_1.14fr] gap-[42px] items-center mt-[34px] mb-[92px] py-[52px_0] border-y border-line max-[980px]:grid-cols-1 max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div>
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Delivery model</span>
          <h2 className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">不堆假节点数字，只讲真实的分发路径。</h2>
          <p className="text-muted text-[1.06rem] leading-[1.85]">公共库加速的关键不是地图上亮几个点，而是缓存、回源、刷新和访问侧路径是否足够稳定。这里用产品逻辑解释网络层，而不是制造"全球在线"的幻觉。</p>
        </div>
        <div className="grid gap-0 border-t border-line-soft">
          {networkFlows.map((flow, index) => (
            <article key={flow.from} className="grid grid-cols-[52px_1fr] gap-6 items-start py-6 border-b border-line-soft max-[640px]:grid-cols-1 max-[640px]:gap-3" style={{ animation: 'revealNode 0.72s cubic-bezier(0.22, 1, 0.36, 1) both', animationDelay: `${index * 120}ms` }}>
              <div className="text-[rgba(184,121,74,0.74)] text-[1.5rem] font-extrabold leading-none tracking-[-0.05em]">0{index + 1}</div>
              <div className="grid gap-3">
                <div className="grid grid-cols-[max-content_minmax(80px,1fr)_max-content] gap-4 items-center text-foreground text-[clamp(1rem,1.8vw,1.18rem)] font-extrabold max-[640px]:grid-cols-1 max-[640px]:gap-[10px]">
                  <span>{flow.from}</span>
                  <i className="flow-route-line max-[640px]:w-full" />
                  <span>{flow.to}</span>
                </div>
                <p className="max-w-[620px] m-0 text-muted leading-[1.8]">{flow.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Usage Section ── */}
      <section id="usage" className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div className="max-w-[780px] mb-[38px]">
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">接入指南</span>
          <h2 className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">四步完成替换，不改变你的工程结构。</h2>
        </div>
        <div className="grid grid-cols-4 border-y border-line max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
          {steps.map((step, index) => (
            <article key={step.title} className="flex flex-col min-h-[282px] p-[28px_24px] border-r border-line-soft last:border-r-0 max-[980px]:border-b max-[980px]:border-r-0 [&:nth-child(2)]:max-[980px]:border-r-0 [&:nth-child(-n+2)]:max-[980px]:border-b last:max-[980px]:border-b-0 max-[640px]:border-b max-[640px]:border-r-0 last:max-[640px]:border-b-0">
              <span className="text-[rgba(184,121,74,0.78)] text-[2.7rem] font-extrabold tracking-[-0.08em]">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-[18px] mb-[10px] text-foreground text-[1.34rem]">{step.title}</h3>
              <code className="mt-auto overflow-wrap-anywhere pt-[14px] border-t border-line-soft text-ink-soft font-mono text-[0.84rem] leading-[1.68] block">{step.code}</code>
            </article>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px mt-6 bg-line-soft max-[980px]:grid-cols-1">
          {recipes.map((recipe) => (
            <article key={recipe.name} className="p-[26px_24px] bg-[rgba(247,241,230,0.82)]">
              <h3 className="mt-[18px] mb-[10px] text-foreground text-[1.34rem]">{recipe.name}</h3>
              <p className="text-muted leading-[1.78]">源地址：<code className="mt-auto overflow-wrap-anywhere pt-[14px] border-t border-line-soft text-ink-soft font-mono text-[0.84rem] leading-[1.68] block">{recipe.source}</code></p>
              <p className="text-muted leading-[1.78]">替换为：<code className="mt-auto overflow-wrap-anywhere pt-[14px] border-t border-line-soft text-ink-soft font-mono text-[0.84rem] leading-[1.68] block">{recipe.target}</code></p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Partners Section ── */}
      <section className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto flex items-center justify-between gap-[34px] py-11 mb-[88px] border-y border-line max-[980px]:flex-col max-[980px]:items-start max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div>
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Trusted ecosystem</span>
          <h2 className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">与开放生态共同运行</h2>
        </div>
        <div className="flex flex-wrap gap-[22px] items-center justify-end">
          <Image src="/img/cloudflare.svg" width={180} height={58} alt="Cloudflare CDN 基础设施" className="w-auto max-h-12 object-contain [filter:grayscale(1)_contrast(0.88)_opacity(0.72)] transition-[filter,transform] duration-300 hover:[filter:grayscale(0.25)_contrast(0.94)_opacity(0.9)] hover:-translate-y-0.5" />
          <Image src="/img/fido-s.webp" width={180} height={58} alt="云驰互联合作生态" className="w-auto max-h-12 object-contain [filter:grayscale(1)_contrast(0.88)_opacity(0.72)] transition-[filter,transform] duration-300 hover:[filter:grayscale(0.25)_contrast(0.94)_opacity(0.9)] hover:-translate-y-0.5" />
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]" aria-labelledby="heading-faq">
        <div className="max-w-[610px] mb-[38px]">
          <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">FAQ</span>
          <h2 id="heading-faq" className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">常见问题</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-[42px] border-t border-line max-[980px]:grid-cols-1">
          {faqs.map((faq) => (
            <details key={faq.q} className="faq-item overflow-hidden py-6 border-b border-line-soft transition-[background,padding] duration-300">
              <summary className="flex items-center justify-between gap-[18px] cursor-pointer text-foreground text-[1.08rem] font-extrabold list-none [&::-webkit-details-marker]:hidden [&::after]:content-['+'] [&::after]:flex-none [&::after]:text-moss [&::after]:font-bold [&::after]:transition-[transform,color] [&::after]:duration-300 [&::after]:ease-[cubic-bezier(0.22,1,0.36,1)]">{faq.q}</summary>
              <p className="m-0 pt-[14px] pr-[26px] text-muted leading-[1.78] -translate-y-1.5 opacity-0 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Feedback Section ── */}
      <section id="feedback" className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto py-[42px_0_82px] max-[640px]:w-[min(calc(100%-26px),1160px)]" aria-labelledby="heading-feedback">
        <div className="feedback-card-bg grid grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)] gap-[54px] items-center relative overflow-hidden p-[clamp(30px,5vw,58px)] border-y border-line max-[980px]:grid-cols-1 max-[980px]:gap-7 max-[640px]:p-[28px_18px]">
          {/* Decorative inner borders */}
          <div className="absolute inset-y-[18px] inset-x-0 pointer-events-none border-t border-b border-[rgba(36,32,23,0.07)]" />
          {/* REPORT watermark */}
          <div className="absolute right-[clamp(22px,4vw,54px)] top-[clamp(20px,3.8vw,46px)] text-[rgba(36,32,23,0.06)] text-[clamp(3.2rem,9vw,7.4rem)] font-black leading-none tracking-[-0.08em] pointer-events-none max-[640px]:hidden">REPORT</div>

          <div className="relative grid place-items-center min-h-[330px] isolate max-[980px]:min-h-[240px]" aria-hidden="true">
            <div className="feedback-visual-blob" />
            <div className="absolute w-[70%] h-px bottom-12 bg-gradient-to-r from-transparent via-[rgba(36,32,23,0.18)] to-transparent" />
            <Image src="/star/images/iocdn_feedback.png" width={280} height={220} alt="" className="relative z-[1] justify-self-center max-w-[min(280px,88%)] [filter:saturate(0.68)_contrast(0.94)_drop-shadow(0_26px_36px_rgba(49,41,26,0.14))]" />
          </div>

          <div className="relative z-[2] max-w-[720px]">
            <span className="inline-flex w-fit text-moss text-[0.74rem] font-extrabold tracking-[0.16em] uppercase">Feedback loop</span>
            <h2 id="heading-feedback" className="font-heading mt-[15px] text-[clamp(2.35rem,5vw,5.1rem)] font-black text-foreground leading-[1.02] tracking-[-0.065em] text-balance">发现异常？请直接告诉我们。</h2>
            <p className="text-muted text-[1.06rem] leading-[1.85]">资源加载异常、访问变慢、证书错误、安全风险或滥用内容，都可以通过邮件、Issue 或群聊反馈。我们更重视清晰、具体、可复现的描述。</p>
            <div className="grid grid-cols-2 gap-3 mt-[30px] max-[640px]:grid-cols-1">
              <a className="relative grid gap-1 min-h-[86px] p-[18px_20px] border border-line text-foreground bg-[rgba(247,241,230,0.42)] transition-[transform,background,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[rgba(36,32,23,0.3)] hover:bg-[rgba(255,252,245,0.68)] [&::after]:content-['↗'] [&::after]:absolute [&::after]:right-[18px] [&::after]:top-4 [&::after]:text-[rgba(36,32,23,0.36)] [&::after]:text-base [&::after]:transition-[transform,color] [&::after]:duration-300 hover:[&::after]:text-current hover:[&::after]:translate-x-[2px] hover:[&::after]:-translate-y-[2px] bg-foreground border-foreground text-primary-foreground max-[640px]:min-h-[78px]" href="mailto:help@wuxit.cn">
                <span className="text-[rgba(250,245,236,0.62)] text-[0.76rem] font-extrabold tracking-[0.12em] uppercase">发送邮件</span>
                <strong className="self-end pr-7 text-[1.02rem] leading-[1.35] overflow-wrap-anywhere">help@wuxit.cn</strong>
              </a>
              <a className="relative grid gap-1 min-h-[86px] p-[18px_20px] border border-line text-foreground bg-[rgba(247,241,230,0.42)] transition-[transform,background,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[rgba(36,32,23,0.3)] hover:bg-[rgba(255,252,245,0.68)] [&::after]:content-['↗'] [&::after]:absolute [&::after]:right-[18px] [&::after]:top-4 [&::after]:text-[rgba(36,32,23,0.36)] [&::after]:text-base [&::after]:transition-[transform,color] [&::after]:duration-300 hover:[&::after]:text-current hover:[&::after]:translate-x-[2px] hover:[&::after]:-translate-y-[2px] bg-[rgba(255,252,245,0.5)] max-[640px]:min-h-[78px]" href="https://github.com/chizw/StarCDN/issues" target="_blank" rel="noreferrer">
                <span className="text-[rgba(112,108,93,0.86)] text-[0.76rem] font-extrabold tracking-[0.12em] uppercase">提交 Issue</span>
                <strong className="self-end pr-7 text-[1.02rem] leading-[1.35] overflow-wrap-anywhere">GitHub Repository</strong>
              </a>
            </div>
            <a className="feedback-link-underline inline-flex items-center w-fit mt-2 text-foreground font-extrabold" href="https://qm.qq.com/q/sugzhf6lQO" target="_blank" rel="noreferrer">加入 QQ 群沟通</a>
            <div className="grid grid-cols-2 gap-[14px] mt-7 max-[640px]:grid-cols-1">
              <div className="relative min-h-[118px] overflow-hidden p-[18px_20px_20px] border border-[rgba(36,32,23,0.09)] rounded-[22px] bg-[rgba(255,252,245,0.46)] shadow-[0_16px_42px_rgba(49,41,26,0.06)]">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_16%,rgba(111,125,82,0.14),transparent_38%),linear-gradient(135deg,rgba(255,252,245,0.34),transparent_62%)]" />
                <div className="absolute right-[18px] top-[18px] w-[9px] h-[9px] rounded-full bg-brass shadow-[0_0_0_6px_rgba(178,147,84,0.12)]" />
                <strong className="relative block text-foreground text-[0.96rem]">建议包含</strong>
                <p className="relative mt-2 text-muted text-[0.94rem] leading-[1.7]">资源地址、报错信息、访问时间和截图。</p>
              </div>
              <div className="relative min-h-[118px] overflow-hidden p-[18px_20px_20px] border border-[rgba(36,32,23,0.09)] rounded-[22px] bg-[rgba(255,252,245,0.46)] shadow-[0_16px_42px_rgba(49,41,26,0.06)]">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_16%,rgba(111,125,82,0.14),transparent_38%),linear-gradient(135deg,rgba(255,252,245,0.34),transparent_62%)]" />
                <div className="absolute right-[18px] top-[18px] w-[9px] h-[9px] rounded-full bg-brass shadow-[0_0_0_6px_rgba(178,147,84,0.12)]" />
                <strong className="relative block text-foreground text-[0.96rem]">响应方式</strong>
                <p className="relative mt-2 text-muted text-[0.94rem] leading-[1.7]">优先邮件与 Issue，便于追踪和复现。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-[2] w-[min(1160px,calc(100%-44px))] mx-auto flex flex-wrap items-center justify-between gap-[18px] border-t border-line py-[34px_0_44px] text-[rgba(23,23,19,0.62)] max-[640px]:w-[min(calc(100%-26px),1160px)]">
        <div className="text-foreground text-[1.28rem] font-black">Star⭐CDN</div>
        <div className="flex flex-wrap gap-[18px] font-bold">
          <a href="#features" className="nav-link-underline relative">产品能力</a>
          <a href="#usage" className="nav-link-underline relative">接入指南</a>
          <a href="https://fastjs.qixz.cn" target="_blank" rel="noreferrer">信网智能 CDN</a>
          <a href="https://github.com/chizw/StarCDN" target="_blank" rel="noreferrer">GitHub 项目</a>
        </div>
        <div className="flex flex-wrap gap-[8px_16px] w-full m-0 text-[0.9rem]">
          <span>Copyright © 2024-2026 Star⭐CDN · 信网 · All Rights Reserved</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">ICP备案号待补充</a>
        </div>
      </footer>
    </main>
  );
}
