'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal, ParticleBackground } from '@/components/ClientComponents';
import SponsorLogo from '@/components/SponsorLogo';
import { FaqAccordionItem } from '@/components/FaqAccordion';
import AnimatedCounter from '@/components/AnimatedCounter';
import Typewriter from '@/components/Typewriter';
import { useT, useLang } from '@/i18n';
import teamData from './data/team.json';
import partnersData from './data/partners.json';
import faqData from './data/faq.json';

type TeamMember = {
  name: string;
  nameEn?: string;
  role: string;
  roleEn?: string;
  desc: string;
  descEn?: string;
  avatar: string;
  href: string;
};

type Partner = {
  name: string;
  desc: string;
  descEn?: string;
  logo: string;
  logoDark?: string;
  href: string;
};

type FaqItem = {
  q: string;
  qEn: string;
  a: string;
  aEn: string;
};

const teamMembers: TeamMember[] = teamData as TeamMember[];
const partners: Partner[] = partnersData as Partner[];
const faqs: FaqItem[] = faqData as FaqItem[];

export default function HomePage() {
  const t = useT();
  const { lang } = useLang();
  const [partnersLoading] = useState(false);

  return (
    <>
      {/* ==================== Hero ==================== */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="hero-grid"></div>
          <div className="hero-glow hero-glow-1"></div>
          <div className="hero-glow hero-glow-2"></div>
          <div className="hero-glow hero-glow-3"></div>
          <ParticleBackground />
        </div>
        <div className="hero-content container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            {t.home.badge}
          </div>
          <h1 className="hero-title">
            {t.home.title1}<br />
            <Typewriter
              texts={[t.home.title2]}
              typingSpeed={80}
              className="gradient-text"
            />
          </h1>
          <p className="hero-desc">{t.home.desc}</p>
          <div className="hero-code">
            <div className="code-header">
              <span className="code-dot red"></span>
              <span className="code-dot yellow"></span>
              <span className="code-dot green"></span>
              <span className="code-title">{t.home.quickStart}</span>
            </div>
            <div className="code-body">
              <div className="code-line"><span className="code-tag">&lt;script</span> <span className="code-attr">src</span>=<span className="code-val">&quot;https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js&quot;</span><span className="code-tag">&gt;&lt;/script&gt;</span></div>
              <div className="code-line"><span className="code-tag">&lt;link</span> <span className="code-attr">rel</span>=<span className="code-val">&quot;stylesheet&quot;</span> <span className="code-attr">href</span>=<span className="code-val">&quot;https://fastjs.qixz.cn/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css&quot;</span><span className="code-tag">&gt;</span></div>
              <div className="code-line"><span className="code-tag">&lt;script</span> <span className="code-attr">src</span>=<span className="code-val">&quot;https://fastjs.qixz.cn/npm/vue@3.3.4/dist/vue.global.js&quot;</span><span className="code-tag">&gt;&lt;/script&gt;</span></div>
            </div>
          </div>
          <div className="hero-actions">
            <Link href="/docs" className="btn btn-primary">
              {t.home.viewDocs}
              <i className="bi bi-arrow-right" />
            </Link>
            <Link href="/#quickstart" className="btn btn-outline">
              {t.home.getStarted}
              <i className="bi bi-question-circle" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== Stats ==================== */}
      <section className="section" id="stats">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: '100+', label: t.home.stats.nodes },
              { value: '99.99%', label: t.home.stats.availability },
              { value: '50M+', label: t.home.stats.dailyRequests },
              { value: '30ms', label: t.home.stats.latency },
            ].map((stat) => (
              <div className="stat-card" key={stat.label}>
                <AnimatedCounter value={stat.value} />
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Quick Start ==================== */}
      <section className="section" id="quickstart">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.quickStartTitle}</div>
              <h2 className="section-title">{t.home.quickStartSubtitle}</h2>
              <p className="section-desc">{t.home.quickStartDesc}</p>
            </div>
          </ScrollReveal>
          <div className="migration-timeline">
            {[
              { title: t.home.step1Title, desc: t.home.step1Desc, code: <span><span className="migration-hl">npm</span>{'  /  '}<span className="migration-hl">GitHub</span>{'  /  '}<span className="migration-hl">WordPress</span>{'  /  '}<span className="migration-hl">CNB</span></span> },
              { title: t.home.step2Title, desc: t.home.step2Desc, code: (<div className="migration-diff"><div className="migration-diff-line migration-diff-old"><span className="migration-diff-sign">-</span>https://cdn<span className="migration-diff-hl">.jsdelivr.net</span>/npm/jquery@3.7.1/dist/jquery.min.js</div><div className="migration-diff-line migration-diff-new"><span className="migration-diff-sign">+</span>https://fastjs<span className="migration-diff-hl">.qixz.cn</span>/npm/jquery@3.7.1/dist/jquery.min.js</div></div>) },
              { title: t.home.step3Title, desc: t.home.step3Desc, code: <code className="migration-cmd">$ curl -I https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js</code> },
              { title: t.home.step4Title, desc: t.home.step4Desc, code: <code className="migration-cmd">$ find src/ -type f -exec sed -i &apos;s/cdn\.jsdelivr\.net/fastjs.qixz.cn/g&apos; {'{}'}</code> },
              { title: t.home.step5Title, desc: t.home.step5Desc, code: (<div className="migration-done"><i className="bi bi-check-circle-fill" style={{ fontSize: 20 }} />{t.home.step5Done}</div>) },
            ].map((step, i) => (
              <ScrollReveal key={i}>
                <div className="migration-step">
                  <div className="migration-step-marker">
                    <span className="migration-step-num">{i + 1}</span>
                    {i < 4 && <div className="migration-step-connector" />}
                  </div>
                  <div className="migration-step-body">
                    <h4 className="migration-step-title">{step.title}</h4>
                    <p className="migration-step-desc">{step.desc}</p>
                    <div className="migration-step-code">{step.code}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Migration Compare ==================== */}
      <section className="section" id="compare" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.compareTitle}</div>
              <h2 className="section-title">{t.home.compareSubtitle}</h2>
              <p className="section-desc">{t.home.compareDesc}</p>
            </div>
          </ScrollReveal>
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{t.home.compareColSource}</th>
                  <th>{t.home.compareColJsdelivr}</th>
                  <th style={{ color: 'var(--primary-light)' }}>{t.home.compareColMirror}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { source: 'NPM', old: 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js', new_: 'https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js' },
                  { source: 'GitHub', old: 'https://cdn.jsdelivr.net/gh/user/repo@version/file', new_: 'https://fastjs.qixz.cn/gh/user/repo@version/file' },
                  { source: 'WP', old: 'https://cdn.jsdelivr.net/wp/plugins/akismet/tags/4.1.12/akismet.js', new_: 'https://fastjs.qixz.cn/wp/plugins/akismet/tags/4.1.12/akismet.js' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td><span className={`compare-source-tag source-${row.source.toLowerCase()}`}>{row.source}</span></td>
                    <td><code className="compare-old">{row.old}</code></td>
                    <td><code className="compare-new">{row.new_}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==================== Core Features ==================== */}
      <section className="section" id="features">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.coreFeatures}</div>
              <h2 className="section-title">{t.home.whyChoose}</h2>
              <p className="section-desc">{t.home.featuresDesc}</p>
            </div>
          </ScrollReveal>
          <div className="features-grid">
            {[
              { icon: <i className="bi bi-globe2" style={{ fontSize: 24 }} />, title: t.home.feature1Title, desc: t.home.feature1Desc },
              { icon: <i className="bi bi-shield-fill-check" style={{ fontSize: 24 }} />, title: t.home.feature2Title, desc: t.home.feature2Desc },
              { icon: <i className="bi bi-arrow-left-right" style={{ fontSize: 24 }} />, title: t.home.feature3Title, desc: t.home.feature3Desc },
              { icon: <i className="bi bi-grid-fill" style={{ fontSize: 24 }} />, title: t.home.feature4Title, desc: t.home.feature4Desc },
              { icon: <i className="bi bi-hdd-stack" style={{ fontSize: 24 }} />, title: t.home.feature5Title, desc: t.home.feature5Desc },
              { icon: <i className="bi bi-gift-fill" style={{ fontSize: 24 }} />, title: t.home.feature6Title, desc: t.home.feature6Desc },
            ].map((feat, i) => (
              <ScrollReveal key={i}>
                <div className="feature-card">
                  <div className="feature-icon">{feat.icon}</div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Sponsors ==================== */}
      <section className="section" id="sponsors" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.sponsorsTitle}</div>
              <h2 className="section-title">{t.home.sponsorsSubtitle}</h2>
            </div>
          </ScrollReveal>
          <div className="sponsors-grid">
            {partnersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', width: '100%' }}>
                {lang === 'en' ? 'Loading sponsors...' : '加载中...'}
              </div>
            ) : partners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', width: '100%' }}>
                {lang === 'en' ? 'No sponsors data available.' : '暂无赞助商数据'}
              </div>
            ) : (
              partners.map((s, i) => (
                <ScrollReveal key={i}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="sponsor-item">
                    <div className="sponsor-logo-img">
                      <SponsorLogo src={s.logo} darkSrc={s.logoDark} alt={s.name} />
                    </div>
                    <p>{lang === 'en' && s.descEn ? s.descEn : s.desc}</p>
                  </a>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ==================== Team ==================== */}
      <section className="section" id="team">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.teamTitle}</div>
              <h2 className="section-title">{t.home.teamSubtitle}</h2>
            </div>
          </ScrollReveal>
          <div className="team-grid">
            {teamMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', width: '100%' }}>
                {lang === 'en' ? 'Loading team members...' : '加载中...'}
              </div>
            ) : (
              teamMembers.map((m, i) => (
                <ScrollReveal key={i}>
                  <div className="team-card">
                    <a href={m.href} target="_blank" rel="noopener noreferrer" className="member-avatar-link">
                      <Image src={m.avatar} alt={m.name} className="member-avatar-img" width={96} height={96} unoptimized />
                    </a>
                    <h3>{lang === 'en' && m.nameEn ? m.nameEn : m.name}</h3>
                    <span className="team-role">{lang === 'en' && m.roleEn ? m.roleEn : m.role}</span>
                    <p>{lang === 'en' && m.descEn ? m.descEn : m.desc}</p>
                  </div>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ==================== Best Practices ==================== */}
      <section className="section" id="best-practices" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.bestPracticesTitle}</div>
              <h2 className="section-title">{t.home.bestPracticesSubtitle}</h2>
              <p className="section-desc">{t.home.bestPracticesDesc}</p>
            </div>
          </ScrollReveal>
          <div className="features-grid">
            {[
              { icon: <i className="bi bi-patch-check-fill" style={{ fontSize: 24 }} />, title: t.home.bestPractice1Title, desc: t.home.bestPractice1Desc },
              { icon: <i className="bi bi-arrow-repeat" style={{ fontSize: 24 }} />, title: t.home.bestPractice2Title, desc: t.home.bestPractice2Desc },
              { icon: <i className="bi bi-tag-fill" style={{ fontSize: 24 }} />, title: t.home.bestPractice3Title, desc: t.home.bestPractice3Desc },
              { icon: <i className="bi bi-boxes" style={{ fontSize: 24 }} />, title: t.home.bestPractice4Title, desc: t.home.bestPractice4Desc },
              { icon: <i className="bi bi-lightning-charge-fill" style={{ fontSize: 24 }} />, title: t.home.bestPractice5Title, desc: t.home.bestPractice5Desc },
              { icon: <i className="bi bi-clipboard-check-fill" style={{ fontSize: 24 }} />, title: t.home.bestPractice6Title, desc: t.home.bestPractice6Desc },
            ].map((feat, i) => (
              <ScrollReveal key={i}>
                <div className="feature-card">
                  <div className="feature-icon">{feat.icon}</div>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="section" id="faq">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <div className="section-label">{t.home.faqTitle}</div>
              <h2 className="section-title">{t.home.faqSubtitle}</h2>
              <p className="section-desc">{t.home.faqDesc}</p>
            </div>
          </ScrollReveal>
          <div className="faq-list">
            {(faqs.length > 0 ? faqs : [
              { q: t.home.faq1Q, qEn: '', a: t.home.faq1A, aEn: '' },
              { q: t.home.faq2Q, qEn: '', a: t.home.faq2A, aEn: '' },
              { q: t.home.faq3Q, qEn: '', a: t.home.faq3A, aEn: '' },
              { q: t.home.faq4Q, qEn: '', a: t.home.faq4A, aEn: '' },
              { q: t.home.faq5Q, qEn: '', a: t.home.faq5A, aEn: '' },
              { q: t.home.faq6Q, qEn: '', a: t.home.faq6A, aEn: '' },
            ] as FaqItem[]).map((faq, i) => {
              const isEn = lang === 'en';
              const question = isEn && faq.qEn ? faq.qEn : faq.q;
              const answer = isEn && faq.aEn ? faq.aEn : faq.a;
              return (
                <ScrollReveal key={i}>
                  <FaqAccordionItem question={question} answer={answer} />
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta" id="docs">
        <div className="container">
          <ScrollReveal>
            <div className="cta-content">
              <h2>{t.home.ctaTitle}</h2>
              <p>{t.home.ctaDesc}</p>
              <div className="cta-actions">
                <Link href="/docs" className="btn btn-primary btn-lg">{t.home.ctaViewDocs}</Link>
                <Link href="/#quickstart" className="btn btn-outline btn-lg">{t.home.getStarted}</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
