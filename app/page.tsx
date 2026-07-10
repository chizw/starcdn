import Image from 'next/image';
import Link from 'next/link';
import ServiceStatus from './components/ServiceStatus';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

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

const partners = [
  { name: '81Cloud', desc: '云计算资源协同', image: '/img/81cloud.webp' },
  { name: 'Cloudflare', desc: '边缘网络生态', image: '/img/cloudflare.svg' },
  { name: 'Aliyun ESA', desc: '边缘安全加速', image: '/img/esa.svg' },
  { name: 'Google', desc: '开放网络生态', image: '/img/google.svg' },
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
    <main className="page-shell overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(39,39,42,0.08),transparent_28rem),linear-gradient(to_bottom,#fff,#fafafa_45%,#f4f4f5)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />

      <header className="container-shell sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/70 bg-zinc-50/80 py-4 backdrop-blur-xl">
        <Link className="flex items-center gap-3" href="/" aria-label="StarCDN 首页">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <Image src="/favicon.ico" alt="StarCDN" width={24} height={24} />
          </span>
          <div className="leading-tight">
            <strong className="block text-sm font-semibold text-zinc-950">StarCDN</strong>
            <span className="text-xs text-zinc-500">fastjs.qixz.cn</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 text-sm text-zinc-600 shadow-sm md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="rounded-full px-4 py-2 transition hover:bg-zinc-100 hover:text-zinc-950">{item.label}</a>
          ))}
        </nav>
        <a className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800" href="https://github.com/chizw/StarCDN" target="_blank" rel="noreferrer">GitHub</a>
      </header>

      <section className="container-shell grid min-h-[calc(100vh-81px)] items-center gap-12 py-20 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <Badge variant="outline" className="mb-6 bg-white/70">Public CDN for modern builders</Badge>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-6xl lg:text-7xl">让公共资源加载像控制台指标一样稳定。</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">Star⭐CDN 为 Jsdelivr、Gravatar、Cdnjs 等公共资源提供稳定、轻量、无需配置的镜像加速服务，专为国内访问体验重新设计。</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800" href="#usage">立即接入</a>
            <a className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-50" href="#features">了解能力</a>
          </div>
        </div>

        <div className="relative rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-2xl shadow-zinc-200/60">
          <div className="rounded-[1.5rem] border border-zinc-100 bg-zinc-950 p-5 text-white">
            <div className="mb-10 flex items-center justify-between text-xs text-zinc-400">
              <span>fastjs.qixz.cn</span>
              <span>live edge routing</span>
            </div>
            <div className="grid gap-3">
              {networkFlows.map((flow, index) => (
                <div key={flow.from} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-950">0{index + 1}</span>
                    <span>{flow.from}</span>
                    <span className="h-px flex-1 bg-white/15" />
                    <span>{flow.to}</span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{flow.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-white p-5 text-zinc-950">
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">median latency</span>
              <div className="mt-2 flex items-end justify-between">
                <strong className="text-5xl font-semibold tracking-tighter">30ms</strong>
                <Badge variant="success">healthy</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4" aria-label="服务指标">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-white/80">
            <CardContent className="p-6">
              <strong className="block text-4xl font-semibold tracking-tight text-zinc-950">{metric.value}</strong>
              <span className="mt-2 block text-sm text-zinc-500">{metric.label}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="container-shell py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="section-kicker">镜像资源</span>
            <h2 className="section-title mt-3">把常用资源纳入同一条高速轨道</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <Card key={service.name} className="transition hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-100 p-3 shadow-sm">
                  <Image src={service.image} width={64} height={64} alt={`${service.name} CDN 镜像加速`} className="h-10 w-10 object-contain" />
                </div>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceStatus serviceName={service.name} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="features" className="container-shell py-16">
        <span className="section-kicker">核心能力</span>
        <h2 className="section-title mt-3 max-w-3xl">克制、稳定、快速，重新梳理 CDN 产品表达。</h2>
        <p className="section-copy">以性能、安全、透明和易接入为设计中心，把旧式组件堆叠重构成更清晰的产品叙事。</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">{feature.kicker}</Badge>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="leading-6">{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="network" className="container-shell grid gap-8 py-16 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <span className="section-kicker">Delivery model</span>
          <h2 className="section-title mt-3">不堆假节点数字，只讲真实的分发路径。</h2>
          <p className="section-copy">公共库加速的关键不是地图上亮几个点，而是缓存、回源、刷新和访问侧路径是否足够稳定。</p>
        </div>
        <div className="grid gap-4">
          {networkFlows.map((flow, index) => (
            <Card key={flow.from}>
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">0{index + 1}</span>
                <div>
                  <h3 className="font-semibold text-zinc-950">{flow.from} → {flow.to}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{flow.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="usage" className="container-shell py-16">
        <span className="section-kicker">接入指南</span>
        <h2 className="section-title mt-3">四步完成替换，不改变你的工程结构。</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">{String(index + 1).padStart(2, '0')}</Badge>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="block break-all rounded-xl bg-zinc-950 p-3 text-xs leading-5 text-zinc-100">{step.code}</code>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.name}>
              <CardHeader>
                <CardTitle>{recipe.name}</CardTitle>
                <CardDescription>源地址：<code>{recipe.source}</code></CardDescription>
                <CardDescription>替换为：<code>{recipe.target}</code></CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell py-16">
        <Card className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="section-kicker">Trusted ecosystem</span>
              <h2 className="section-title mt-3">与开放生态共同运行</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner) => (
              <div key={partner.name} className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <div className="flex h-14 items-center justify-center rounded-xl bg-white px-4 ring-1 ring-zinc-200">
                  <Image src={partner.image} width={150} height={48} alt={partner.name} className="h-auto max-h-8 w-auto object-contain opacity-75 grayscale transition group-hover:opacity-100 group-hover:grayscale-0" />
                </div>
                <strong className="mt-4 block text-sm font-semibold text-zinc-950">{partner.name}</strong>
                <span className="mt-1 block text-xs text-zinc-500">{partner.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="faq" className="container-shell py-16" aria-labelledby="heading-faq">
        <span className="section-kicker">FAQ</span>
        <h2 id="heading-faq" className="section-title mt-3">常见问题</h2>
        <div className="mt-8 grid gap-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-zinc-950">{faq.q}</summary>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="feedback" className="container-shell py-16" aria-labelledby="heading-feedback">
        <Card className="grid overflow-hidden md:grid-cols-[0.8fr_1.2fr]">
          <div className="flex items-center justify-center bg-zinc-950 p-8 text-white">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <Image src="/star/images/iocdn_feedback.png" width={280} height={220} alt="反馈通道示意" className="relative z-10 h-auto max-h-56 w-auto object-contain opacity-85 grayscale contrast-125" />
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                {['URL', 'Error', 'Time', 'Screenshot'].map((item) => (
                  <span key={item} className="rounded-full bg-white/[0.06] px-3 py-1.5 text-center ring-1 ring-white/10">{item}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="p-8 md:p-10">
            <span className="section-kicker">Feedback loop</span>
            <h2 id="heading-feedback" className="section-title mt-3">发现异常？请直接告诉我们。</h2>
            <p className="section-copy">资源加载异常、访问变慢、证书错误、安全风险或滥用内容，都可以通过邮件、Issue 或群聊反馈。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white" href="mailto:help@wuxit.cn">发送邮件 · help@wuxit.cn</a>
              <a className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-950" href="https://github.com/chizw/StarCDN/issues" target="_blank" rel="noreferrer">提交 Issue</a>
              <a className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-950" href="https://qm.qq.com/q/sugzhf6lQO" target="_blank" rel="noreferrer">加入 QQ 群</a>
            </div>
          </div>
        </Card>
      </section>

      <footer className="container-shell border-t border-zinc-200 py-8 text-sm text-zinc-500">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="font-semibold text-zinc-950">Star⭐CDN</div>
          <div className="flex flex-wrap gap-4">
            <a href="#features">产品能力</a>
            <a href="#usage">接入指南</a>
            <a href="https://fastjs.qixz.cn" target="_blank" rel="noreferrer">信网智能 CDN</a>
            <a href="https://github.com/chizw/StarCDN" target="_blank" rel="noreferrer">GitHub 项目</a>
          </div>
        </div>
        <div className="mt-4 flex flex-col justify-between gap-2 md:flex-row">
          <span>Copyright © 2024-2026 Star⭐CDN · 信网 · All Rights Reserved</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">ICP备案号待补充</a>
        </div>
      </footer>
    </main>
  );
}
