'use client';

import Link from 'next/link';
import { useT } from '@/i18n';
import './about.css';

export default function AboutContent() {
  const t = useT();

  return (
    <>
      {/* ===== Page Header ===== */}
      <section className="about-hero">
        <div className="container">
          <p className="about-hero-tag">{t.about.tag}</p>
          <h1 className="about-hero-title">
            {t.about.title1}<br />
            <span className="gradient-text">{t.about.title2}</span>
          </h1>
          <p className="about-hero-desc">{t.about.heroDesc}</p>
        </div>
      </section>

      {/* ===== 我们的使命 ===== */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-bullseye" style={{ fontSize: 28 }} />
            </span>
            {t.about.mission}
          </h2>
          <p className="about-text">{t.about.mission1}</p>
          <p className="about-text">{t.about.mission2}</p>
          <p className="about-text">{t.about.mission3}</p>
        </div>
      </section>

      {/* ===== 三大核心支柱 ===== */}
      <section className="about-pillars section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 40 }}>
            <div className="section-label">{t.about.pillarsLabel}</div>
            <h2 className="section-title">{t.about.pillarsTitle}</h2>
          </div>
          <div className="pillars-grid">
            {[
              {
                title: t.about.p1Title, desc: t.about.p1Desc,
                icon: (<i className="bi bi-rocket-takeoff-fill" style={{ fontSize: 32 }} />),
              },
              {
                title: t.about.p2Title, desc: t.about.p2Desc,
                icon: (<i className="bi bi-shield-fill-check" style={{ fontSize: 32 }} />),
              },
              {
                title: t.about.p3Title, desc: t.about.p3Desc,
                icon: (<i className="bi bi-shield-lock-fill" style={{ fontSize: 32 }} />),
              },
            ].map((p, i) => (
              <div className="pillar-card" key={i}>
                <div className="pillar-icon">{p.icon}</div>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 源站支持 ===== */}
      <section className="section">
        <div className="container">
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-boxes" style={{ fontSize: 28 }} />
            </span>
            {t.about.sourcesTitle}
          </h2>
          <p className="about-text" style={{ marginBottom: 32 }}>{t.about.sourcesDesc}</p>
          <div className="source-grid">
            {[
              { name: 'NPM', color: '#cb3837', desc: t.about.srcNpmDesc, icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331z"/></svg> },
              { name: 'GitHub', color: '#333', desc: t.about.srcGithubDesc, icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg> },
              { name: 'WordPress', color: '#21759b', desc: t.about.srcWpDesc, icon: <svg xmlns="http://www.w3.org/2000/svg" role="img" width="28" height="28" viewBox="0 0 28 28"><title>WordPress.org</title><path fill="currentColor" d="M13.6052 0.923525C16.1432 0.923525 18.6137 1.67953 20.7062 3.09703C22.7447 4.47403 24.3512 6.41803 25.3097 8.68603C26.9837 12.6415 26.5382 17.164 24.1352 20.7145C22.7582 22.753 20.8142 24.3595 18.5462 25.318C14.5907 26.992 10.0682 26.5465 6.51772 24.1435C4.47922 22.7665 2.87272 20.8225 1.91422 18.5545C0.240225 14.599 0.685725 10.0765 3.08872 6.52603C4.46572 4.48753 6.40973 2.88103 8.67772 1.92253C10.2302 1.26103 11.9177 0.923525 13.6052 0.923525ZM13.6052 0.113525C6.15322 0.113525 0.105225 6.16153 0.105225 13.6135C0.105225 21.0655 6.15322 27.1135 13.6052 27.1135C21.0572 27.1135 27.1052 21.0655 27.1052 13.6135C27.1052 6.16153 21.0572 0.113525 13.6052 0.113525Z"/><path fill="currentColor" d="M2.36011 13.6133C2.36011 17.9198 4.81711 21.8618 8.70511 23.7383L3.33211 9.03684C2.68411 10.4813 2.36011 12.0338 2.36011 13.6133ZM21.2061 13.0463C21.2061 11.6558 20.7066 10.6973 20.2746 9.94134C19.8426 9.18534 19.1676 8.22684 19.1676 7.30884C19.1676 6.39084 19.9506 5.31084 21.0576 5.31084H21.2061C16.6296 1.11234 9.51511 1.42284 5.31661 6.01284C4.91161 6.45834 4.53361 6.93084 4.20961 7.43034H4.93861C6.11311 7.43034 7.93561 7.28184 7.93561 7.28184C8.54311 7.24134 8.61061 8.13234 8.00311 8.21334C8.00311 8.21334 7.39561 8.28084 6.72061 8.32134L10.8111 20.5118L13.2681 13.1273L11.5131 8.32134C10.9056 8.28084 10.3386 8.21334 10.3386 8.21334C9.73111 8.17284 9.79861 7.25484 10.4061 7.28184C10.4061 7.28184 12.2691 7.43034 13.3626 7.43034C14.4561 7.43034 16.3596 7.28184 16.3596 7.28184C16.9671 7.24134 17.0346 8.13234 16.4271 8.21334C16.4271 8.21334 15.8196 8.28084 15.1446 8.32134L19.2081 20.4173L20.3691 16.7453C20.8821 15.1388 21.1926 14.0048 21.1926 13.0328L21.2061 13.0463ZM13.7946 14.5853L10.4196 24.3998C12.6876 25.0613 15.1041 25.0073 17.3316 24.2243L17.2506 24.0758L13.7946 14.5853ZM23.4741 8.21334C23.5281 8.59134 23.5551 8.98284 23.5551 9.37434C23.5551 10.5218 23.3391 11.8043 22.7046 13.3973L19.2621 23.3333C24.5271 20.2688 26.4036 13.5593 23.4741 8.21334Z"/></svg> },
              { name: 'CNB', color: '#FF6600', desc: t.about.srcCnbDesc, icon: <img src="https://cos.jsdmirror.com/images/2021/09/10/cnb.png" alt="CNB" width="32" height="32" style={{ objectFit: 'contain' }} /> },
              { name: 'Google Fonts', color: '#4285F4', desc: t.about.srcFontsDesc, icon: <svg viewBox="0 0 24 24" width="32" height="32"><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"/><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"/><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"/><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"/></svg>, nameEl: <><span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>o</span><span style={{ color: '#FBBC05' }}>o</span><span style={{ color: '#4285F4' }}>g</span><span style={{ color: '#34A853' }}>l</span><span style={{ color: '#EA4335' }}>e</span> Fonts</> },
              { name: 'Gravatar', color: '#4678EB', desc: t.about.srcGravatarDesc, icon: <svg viewBox="0 0 256 256" width="32" height="32"><path fill="currentColor" d="M102.397 25.589v89.595c0 14.132 11.457 25.589 25.59 25.589s25.588-11.457 25.588-25.59V55.578c32.265 11.375 53.116 42.72 51.14 76.873c-1.977 34.154-26.305 62.883-59.666 70.46c-33.362 7.577-67.713-7.825-84.249-37.775c-16.535-29.95-11.268-67.225 12.918-91.42c9.827-10.034 9.744-26.11-.187-36.04c-9.931-9.932-26.007-10.015-36.04-.187C-5.687 80.665-12.352 148.33 21.574 199.103c33.925 50.771 98.99 70.507 155.405 47.138c56.414-23.37 88.463-83.336 76.548-143.224C241.61 43.127 189.049-.004 127.987 0c-14.133 0-25.59 11.457-25.59 25.589"/></svg> },
            ].map((src, i) => (
              <div className="source-card" key={i}>
                <div className="source-icon" style={{ color: src.color }}>{src.icon}</div>
                <h3 className="source-name" style={{ color: src.color }}>{src.nameEl || src.name}</h3>
                <p className="source-desc">{src.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 数据看板 ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">StarCDN <span className="gradient-text">{t.about.statsTitle}</span></h2>
          </div>
          <div className="about-stats-grid">
            {[
              { value: '100+', label: t.home.stats.nodes, sub: t.about.statsSub.nodes },
              { value: '99.99%', label: t.home.stats.availability, sub: t.about.statsSub.availability },
              { value: '50M+', label: t.home.stats.dailyRequests, sub: t.about.statsSub.requests },
              { value: '30ms', label: t.home.stats.latency, sub: t.about.statsSub.latency },
            ].map((s, i) => (
              <div className="about-stat-card" key={i}>
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
                <div className="about-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 生产就绪 ===== */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-layers-fill" style={{ fontSize: 28 }} />
            </span>
            {t.about.productionTitle}
          </h2>
          <p className="about-text">{t.about.production1}</p>
          <p className="about-text">{t.about.production2}</p>
          <p className="about-text">{t.about.production3}<Link href="/docs">{t.about.viewDocs}</Link></p>
        </div>
      </section>

      {/* ===== 缓存机制详解 ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-stack" style={{ fontSize: 28 }} />
            </span>
            {t.about.cacheTitle}
          </h2>
          <p className="about-text">{t.about.cacheDesc}</p>
          <div className="cache-levels">
            {[
              { level: 'L1', name: t.about.cacheL1, duration: t.about.cacheL1Dur, desc: t.about.cacheL1Desc, fg: '#22c55e', icon: 'bi-window-stack' },
              { level: 'L2', name: t.about.cacheL2, duration: t.about.cacheL2Dur, desc: t.about.cacheL2Desc, fg: '#3b82f6', icon: 'bi-cloud-arrow-down-fill' },
              { level: 'L3', name: t.about.cacheL3, duration: t.about.cacheL3Dur, desc: t.about.cacheL3Desc, fg: '#0066FF', icon: 'bi-server' },
              { level: 'L4', name: t.about.cacheL4, duration: t.about.cacheL4Dur, desc: t.about.cacheL4Desc, fg: '#f59e0b', icon: 'bi-database-fill-gear' },
            ].map((c, i) => (
              <div className="cache-level-card" key={i}>
                <div className="cache-level-head">
                  <span className="cache-level-badge" style={{ background: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}><i className={`bi ${c.icon}`} /></span>
                  <div>
                    <h4 className="cache-level-name">{c.name}</h4>
                    <span className="cache-level-duration">{c.duration}</span>
                  </div>
                </div>
                <p className="cache-level-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 与 jsDelivr 对比 ===== */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-display" style={{ fontSize: 28 }} />
            </span>
            {t.about.compareTitle}
          </h2>
          <p className="about-text" style={{ marginBottom: 28 }}>{t.about.compareDesc}</p>
          <div className="compare-feature-grid">
            {t.about.compareRows.map((row, i) => (
              <div className={`compare-row${row.win ? ' compare-win' : ''}`} key={i}>
                <div className="compare-row-label">{row.title}</div>
                <div className="compare-row-cells">
                  <div className="compare-cell">{row.jsd}</div>
                  <div className="compare-cell highlight">{row.mirror}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="about-text" style={{ marginTop: 28 }}>
            {t.about.compareMigrate}
            <Link href="/docs"> {t.about.compareGuide}</Link>
          </p>
        </div>
      </section>

      {/* ===== 开源与社区 ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-people-fill" style={{ fontSize: 28 }} />
            </span>
            {t.about.communityTitle}
          </h2>
          <p className="about-text">{t.about.community1}</p>
          <ul className="about-list">
            <li>{t.about.communityGithub}</li>
            <li>{t.about.communityIssues}</li>
            <li>{t.about.communityChat}</li>
            <li>{t.about.communityDocs}</li>
          </ul>
          <div className="community-stats">
            {[
              { num: '3000+', label: t.about.communityProjects },
              { num: '50M+', label: t.about.communityDaily },
              { num: '100+', label: t.about.communityNodes },
              { num: '99.99%', label: t.about.communityUptime },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="community-stat-num">{item.num}</div>
                <div className="community-stat-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 可持续性 ===== */}
      <section className="section">
        <div className="container" style={{ maxWidth: 840 }}>
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-graph-up" style={{ fontSize: 28 }} />
            </span>
            {t.about.sustainabilityTitle}
          </h2>
          <p className="about-text">{t.about.sustainability1}</p>
          <ul className="about-list">
            <li>{t.about.sustainSponsor}</li>
            <li>{t.about.sustainEnterprise}</li>
            <li>{t.about.sustainCommunity}</li>
          </ul>
          <p className="about-text" style={{ marginTop: 24 }}>
            {t.about.sustainPromise}
            <Link href="/sponsor"> {t.about.supportUs}</Link>
          </p>
        </div>
      </section>

      {/* ===== 业务架构 ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-diagram-3-fill" style={{ fontSize: 28 }} />
            </span>
            {t.about.archTitle}
          </h2>
          <p className="about-text" style={{ textAlign: 'center', marginBottom: 32 }}>{t.about.archDesc}</p>
          <div className="architecture-diagram" style={{ width: '100%', overflowX: 'auto', padding: '20px 0', WebkitOverflowScrolling: 'touch' }}>
            <svg viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', minWidth: 960, height: 'auto', display: 'block', overflow: 'visible', fontFamily: "system-ui, -apple-system, sans-serif" }}>
              <defs>
                <marker id="arr-req" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#64748b"/>
                </marker>
                <marker id="arr-miss" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#dc2626"/>
                </marker>
                <marker id="arr-hit" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#16a34a"/>
                </marker>
                <linearGradient id="g-web" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#f1f5f9"/>
                </linearGradient>
                <linearGradient id="g-cdn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8fafc"/><stop offset="100%" stopColor="#f1f5f9"/>
                </linearGradient>
              </defs>

              {/* ========= 分组虚线框 ========= */}
              {/* Web 防护 */}
              <rect x="70" y="60" width="600" height="120" rx="8" fill="url(#g-web)" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,4"/>
              <rect x="70" y="60" width="600" height="120" rx="8" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,4"/>
              <text x="86" y="78" fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="0.5">{t.about.archWebGroup}</text>

              {/* 加速与缓存服务 */}
              <rect x="700" y="60" width="430" height="280" rx="8" fill="url(#g-cdn)" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,4"/>
              <rect x="700" y="60" width="430" height="280" rx="8" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,4"/>
              <text x="716" y="78" fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="0.5">{t.about.archCdnGroup}</text>

              {/* ========= 节点 ========= */}

              {/* 域名接入 - 顶部 */}
              <rect x="160" y="10" width="130" height="38" rx="7" fill="#e6f0ff" stroke="#0066FF" strokeWidth="1.5"/>
              <text x="225" y="34" textAnchor="middle" fill="#004DB3" fontSize="13" fontWeight="600">{t.about.archDomain}</text>

              {/* 用户 - 左侧 */}
              <circle cx="30" cy="120" r="24" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5"/>
              <svg x="18" y="108" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <text x="30" y="158" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="600">{t.about.archUser}</text>

              {/* Web 防护 5 个模块 */}
              {[
                { key: 'archWhitelist', x: 100, color: '#0052CC' },
                { key: 'archBlacklist', x: 220, color: '#0052CC' },
                { key: 'archAudit', x: 340, color: '#0891b2' },
                { key: 'archRateLimit', x: 460, color: '#ea580c' },
                { key: 'archBotMgmt', x: 580, color: '#d97706' },
              ].map((m) => (
                <g key={m.key}>
                  <rect x={m.x} y={100} width="100" height="46" rx="7" fill="#fff" stroke={m.color} strokeWidth="1.4"/>
                  <text x={m.x + 50} y={128} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="600">{String(t.about[m.key as keyof typeof t.about])}</text>
                </g>
              ))}

              {/* 站点加速配置中心 */}
              <g>
                <rect x="720" y="160" width="130" height="70" rx="8" fill="#fff" stroke="#0066FF" strokeWidth="1.5"/>
                <text x="785" y="190" textAnchor="middle" fill="#004DB3" fontSize="12" fontWeight="600">{t.about.archSiteConfig.split('\n')[0]}</text>
                <text x="785" y="210" textAnchor="middle" fill="#004DB3" fontSize="12" fontWeight="600">{t.about.archSiteConfig.split('\n')[1] || ''}</text>
              </g>

              {/* 规则引擎 */}
              <g>
                <rect x="870" y="160" width="130" height="70" rx="8" fill="#fff" stroke="#0066FF" strokeWidth="1.5"/>
                <text x="935" y="200" textAnchor="middle" fill="#004DB3" fontSize="13" fontWeight="600">{t.about.archRuleEngine}</text>
              </g>

              {/* 边缘函数 - 在站点加速和规则引擎上方 */}
              <g>
                <rect x="795" y="90" width="120" height="40" rx="7" fill="#e6f0ff" stroke="#0066FF" strokeWidth="1.3"/>
                <text x="855" y="115" textAnchor="middle" fill="#004DB3" fontSize="12" fontWeight="600">{t.about.archEdgeFunction}</text>
              </g>

              {/* 节点缓存 - 菱形 */}
              <polygon points="855,292 895,320 855,348 815,320" fill="#fff" stroke="#0066FF" strokeWidth="1.6"/>
              <text x="855" y="324" textAnchor="middle" fill="#004DB3" fontSize="10" fontWeight="700">{t.about.archNodeCache}</text>

              {/* 源站 - 数据库圆柱体 */}
              <g>
                <ellipse cx="1065" cy="285" rx="42" ry="16" fill="#fff" stroke="#d97706" strokeWidth="1.5"/>
                <path d="M1023,285 L1023,330 A42,16 0 0 0 1107,330 L1107,285" fill="none" stroke="#d97706" strokeWidth="1.5"/>
                <path d="M1023,330 A42,16 0 0 0 1107,330" fill="none" stroke="#d97706" strokeWidth="1.5"/>
                <ellipse cx="1065" cy="330" rx="42" ry="16" fill="#fff" stroke="#d97706" strokeWidth="1.5"/>
                <text x="1065" y="313" textAnchor="middle" fill="#92400e" fontSize="13" fontWeight="600">{t.about.archOrigin}</text>
              </g>

              {/* ========= 连接线 ========= */}

              {/* 1. 用户 → 域名接入 */}
              <polyline points="54,120 54,48 160,48" fill="none" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>

              {/* 2. 域名接入 → 白名单 */}
              <polyline points="160,48 160,100" fill="none" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>

              {/* 3-6. Web防护模块横向连接 */}
              {[[200, 220], [320, 340], [440, 460], [560, 580]].map(([from, to], i) => (
                <line key={i} x1={from} y1="123" x2={to} y2="123" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>
              ))}

              {/* 7. Bot管理 → 站点加速 */}
              <polyline points="680,123 700,123 700,195 720,195" fill="none" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>

              {/* 8. 站点加速 → 规则引擎 */}
              <line x1="850" y1="195" x2="870" y2="195" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>

              {/* 9. 规则引擎 → 边缘函数 */}
              <polyline points="935,160 935,110 915,110" fill="none" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>

              {/* 10. 边缘函数 → 节点缓存 */}
              <line x1="855" y1="130" x2="855" y2="290" stroke="#64748b" strokeWidth="1.6" markerEnd="url(#arr-req)"/>

              {/* 11. 节点缓存 → 源站 (MISS, 红色虚线) */}
              <polyline points="895,320 990,320 990,285 1023,285" fill="none" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="4,3" markerEnd="url(#arr-miss)"/>

              {/* 12. 源站 → 节点缓存 (响应, 绿色) */}
              <polyline points="1107,330 990,330 990,348 855,348" fill="none" stroke="#16a34a" strokeWidth="1.6" markerEnd="url(#arr-hit)"/>

              {/* 13. 节点缓存 → 站点加速 (缓存命中返回) */}
              <line x1="815" y1="320" x2="785" y2="320" stroke="#16a34a" strokeWidth="1.6"/>

              {/* 14. 响应返回用户 (虚线, 沿框外) */}
              <polyline points="785,320 785,375 30,375 30,144" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeDasharray="5,4" markerEnd="url(#arr-hit)"/>

              {/* ========= 步骤标注 (方框样式) ========= */}
              {[
                { n: 1, x: 42, y: 84 },
                { n: 2, x: 148, y: 72 },
                { n: 3, x: 210, y: 105 },
                { n: 4, x: 330, y: 105 },
                { n: 5, x: 450, y: 105 },
                { n: 6, x: 570, y: 105 },
                { n: 7, x: 690, y: 112 },
                { n: 8, x: 860, y: 188 },
                { n: 9, x: 925, y: 135 },
                { n: 10, x: 845, y: 210 },
                { n: 11, x: 945, y: 305 },
                { n: 12, x: 945, y: 340 },
                { n: 13, x: 800, y: 310 },
                { n: 14, x: 400, y: 385 },
              ].map(({ n, x, y }) => (
                <g key={n}>
                  <rect x={x} y={y} width="16" height="14" rx="2" fill="#fff" stroke="#94a3b8" strokeWidth="1"/>
                  <text x={x + 8} y={y + 10} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">{n}</text>
                </g>
              ))}

              {/* ========= 流程标注 ========= */}
              <text x="120" y="70" fill="#64748b" fontSize="9" fontWeight="500">{t.about.archRequest}</text>
              <text x="635" y="115" fill="#0891b2" fontSize="9" fontWeight="600">{t.about.archSafePass}</text>
              <text x="940" y="272" fill="#dc2626" fontSize="9" fontWeight="600">{t.about.archMissFetch}</text>
              <text x="750" y="295" fill="#16a34a" fontSize="9" fontWeight="600">{t.about.archHitReturn}</text>
              <text x="60" y="395" fill="#16a34a" fontSize="9" fontWeight="600">{t.about.archReturnUser}</text>
            </svg>
          </div>
          <div className="tech-tags">
            {['EdgeOne', '腾讯云 COS', 'Nginx', 'Rust', 'Python', 'React', '多级缓存', '智能调度', 'HTTPS/TLS', 'IPv6', 'API Gateway'].map((tag) => (
              <span key={tag} className="tech-tag">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 发展历程 ===== */}
      <section className="section">
        <div className="container">
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-clock-history" style={{ fontSize: 28 }} />
            </span>
            {t.about.timelineTitle}
          </h2>
          <div className="timeline-list">
            {[
              { year: '2023', text: t.about.t2023 },
              { year: '2024', text: t.about.t2024 },
              { year: '2025', text: t.about.t2025 },
              { year: '2026', text: t.about.t2026 },
            ].map((tl, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-year">{tl.year}</div>
                <div className="timeline-body"><p>{tl.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 联系我们 ===== */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 className="about-section-heading">
            <span className="about-section-icon">
              <i className="bi bi-envelope-fill" style={{ fontSize: 28 }} />
            </span>
            {t.about.contactTitle}
          </h2>
          <div className="contact-grid">
            {[
              { icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, title: t.about.email, desc: 'ayao@cola.email' },
              { icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>, title: t.about.github, desc: 'github.com/chizw' },
              { icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, title: t.about.feedback, desc: t.about.feedbackDesc },
            ].map((item, i) => (
              <div className="contact-card" key={i}>
                {item.icon}
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
