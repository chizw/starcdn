'use client';

import { useState, useEffect, useCallback } from 'react';
import { useT } from '@/i18n';
import { useLang } from '@/i18n';
import './docs.css';

/* ===== 可复用的代码块组件 ===== */
const CodeBlock = ({ lang, children }: { lang: string; children: string }) => (
  <div className="code-block-wrap">
    <div className="cb-header">
      <span className="cb-dot red" />
      <span className="cb-dot yellow" />
      <span className="cb-dot green" />
      <span className="cb-lang">{lang}</span>
    </div>
    <pre>{children}</pre>
  </div>
);

/* ===== 提示条 ===== */
const Tip = ({ type, title, children }: { type: 'info' | 'warn' | 'success'; title: string; children: React.ReactNode }) => (
  <div className={`doc-tip doc-tip-${type}`}>
    <strong>{title}</strong>
    {children}
  </div>
);

/* ===== 参数表格行 ===== */
const ParamTable = ({ rows, paramLabel, requiredLabel, descLabel }: { rows: [string, string, string][]; paramLabel: string; requiredLabel: string; descLabel: string }) => (
  <div className="table-wrap">
    <table className="doc-table">
      <thead>
        <tr>
          <th>{paramLabel}</th>
          <th>{requiredLabel}</th>
          <th>{descLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td><code>{r[0]}</code></td>
            <td>{r[1]}</td>
            <td>{r[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function DocsPage() {
  const t = useT();
  const { lang } = useLang();
  const [activeSection, setActiveSection] = useState('');

  // 移动端不需要高亮，跳过所有相关计算
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  // 根据当前滚动位置计算 activeSection（mount / 刷新恢复滚动时立即调用）
  const computeActiveSection = useCallback(() => {
    if (isMobile) return;
    const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('.docs-body h2[id]'));
    if (headings.length === 0) return;
    const NAV_HEIGHT = 80;
    // 找最后一个已经滚过 navbar 下方的 heading，否则用第一个
    let current = headings[0];
    for (const h of headings) {
      if (h.getBoundingClientRect().top - NAV_HEIGHT <= 0) {
        current = h;
      } else {
        break;
      }
    }
    setActiveSection(`#${current.id}`);
  }, [isMobile]);

  // mount 后立即初始化 + 监听浏览器历史滚动恢复
  useEffect(() => {
    if (isMobile) return;
    // 浏览器恢复滚动位置是异步的，下一帧再算
    const raf = requestAnimationFrame(() => {
      computeActiveSection();
    });
    return () => cancelAnimationFrame(raf);
  }, [computeActiveSection, isMobile]);

  // IntersectionObserver: 滚动时高亮当前可见的锚点
  useEffect(() => {
    if (isMobile) return;
    const headings = document.querySelectorAll('.docs-body h2[id]');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveSection(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [isMobile]);

  // activeSection 变化时，sidebar 内部滚动让高亮链接进入视野（Docusaurus 标准行为）
  // 移动端 sidebar 是横排 pill，不执行（否则会强制滚动整个页面）
  useEffect(() => {
    if (!activeSection) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;
    const link = document.querySelector(`.docs-sidebar a[href="${activeSection}"]`);
    if (link) {
      link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeSection]);

  // 点击侧边栏跳转
  const handleSidebarClick = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(href);
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const sidebarGroups = [
    {
      title: t.docs.sidebarGettingStarted,
      links: [
        { href: '#getting-started', label: t.docs.sidebarQuickStart },
        { href: '#url-structure', label: t.docs.sidebarUrlStructure },
      ],
    },
    {
      title: t.home.whyChoose,
      links: [
        { href: '#production', label: t.about.productionTitle },
        { href: '#multi-cdn', label: t.docs.multiCdnTitle },
        { href: '#china', label: t.docs.chinaTitle },
        { href: '#failover', label: t.docs.failoverTitle },
        { href: '#fallback', label: t.docs.sidebarFallback },
      ],
    },
    {
      title: t.nav.docs,
      links: [
        { href: '#npm', label: t.docs.sidebarNpm },
        { href: '#github', label: t.docs.sidebarGitHub },
        { href: '#wordpress', label: 'WordPress' },
        { href: '#cnb', label: 'CNB' },
        { href: '#fonts', label: t.docs.sidebarFonts },
        { href: '#gravatar', label: t.docs.sidebarGravatar },
        { href: '#combine', label: t.docs.sidebarCombine },
        { href: '#caching', label: t.docs.sidebarCaching },
        { href: '#purge', label: t.docs.purgeTitle },
        { href: '#api', label: t.docs.sidebarApi },
        { href: '#rate-limit', label: t.docs.sidebarLimits },
      ],
    },
    {
      title: t.docs.sidebarPackageAuthors,
      links: [
        { href: '#package-author', label: t.docs.sidebarBestPractices },
        { href: '#default-files', label: t.docs.sidebarDefaultFile },
        { href: '#limits', label: t.docs.sidebarLimits },
        { href: '#custom-cdn', label: t.docs.sidebarCustomCDN },
      ],
    },
    {
      title: t.docs.sidebarServiceRef,
      links: [
        { href: '#sri', label: t.docs.sidebarSri },
        { href: '#response-headers', label: t.docs.sidebarResponseHeaders },
        { href: '#reverse-proxy', label: t.docs.sidebarReverseProxy },
      ],
    },
  ];

  const sidebarContent = (
    <aside className="docs-sidebar">
      <nav>
        {sidebarGroups.map((group) => (
          <div key={group.title}>
            <div className="sidebar-title">{group.title}</div>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={activeSection === link.href ? 'active' : ''}
                    onClick={(e) => handleSidebarClick(link.href, e)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      <section className="page-header docs-page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="docs-container">
          <h1>{t.docs.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>{t.docs.subtitle}</p>
        </div>
      </section>

      <div className="docs-container">
        <div className="docs-layout">
          {/* sidebar: sticky 吸附视口，内部独立滚动（Docusaurus 标准模式） */}
          {sidebarContent}

          {/* ===== 正文 ===== */}
          <div className="docs-body">

            {/* --- 快速开始 --- */}
            <h2 id="getting-started">{t.docs.gettingStarted}</h2>
            <p>{t.docs.gettingStartedText}</p>

            <h3>{t.docs.basicUsage}</h3>
            <CodeBlock lang="HTML">{`<!-- ${t.docs.commentImportJquery} -->
<script src="https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js"></script>

<!-- ${t.docs.commentImportBootstrap} -->
<link rel="stylesheet" href="https://fastjs.qixz.cn/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
<script src="https://fastjs.qixz.cn/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>

<!-- ${t.docs.commentImportVue} -->
<script src="https://fastjs.qixz.cn/npm/vue@3.3.4/dist/vue.global.js"></script>`}</CodeBlock>

            <Tip type="info" title={t.docs.migrationTip}>
              {t.docs.migrationTipText}
            </Tip>

            <h2 id="url-structure">{t.docs.urlStructure}</h2>
            <p>{t.docs.urlStructureDesc}</p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>{t.docs.urlTableOrigin}</th>
                  <th>{t.docs.urlTablePrefix}</th>
                  <th>{t.docs.urlTableExample}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>npm</strong></td>
                  <td><code>/npm/</code></td>
                  <td><code>/npm/jquery@3.7.1/dist/jquery.min.js</code></td>
                </tr>
                <tr>
                  <td><strong>GitHub</strong></td>
                  <td><code>/gh/</code></td>
                  <td><code>/gh/user/repo@version/file</code></td>
                </tr>
                <tr>
                  <td><strong>cdnjs</strong></td>
                  <td><code>/cdnjs/</code></td>
                  <td><code>/cdnjs/ajax/libs/jquery/3.7.1/jquery.min.js</code></td>
                </tr>
                <tr>
                  <td><strong>CNB</strong></td>
                  <td><code>/cnb/</code></td>
                  <td><code>/cnb/org/repo@version/file</code></td>
                </tr>
              </tbody>
            </table>

            {/* --- 为什么选择 JSDMirror --- */}
            <h2 id="production">{t.docs.productionTitle}</h2>
            <p>{t.docs.productionDesc1}</p>
            <p>{t.docs.productionDesc2}</p>
            <Tip type="success" title={t.docs.zeroCostMigration}>
              {t.docs.zeroCostMigrationText}
            </Tip>

            <h2 id="multi-cdn">{t.docs.multiCdnTitle}</h2>
            <p>{t.docs.multiCdnDesc}</p>
            <ul>
              <li><strong>{t.docs.multiCdn1}</strong></li>
              <li><strong>{t.docs.multiCdn2}</strong></li>
              <li><strong>{t.docs.multiCdn3}</strong></li>
            </ul>

            <h2 id="china">{t.docs.chinaTitle}</h2>
            <p>{t.docs.chinaDesc}</p>

            <h2 id="failover">{t.docs.failoverTitle}</h2>
            <p>{t.docs.failoverDesc}</p>
            <ul>
              <li><strong>{t.docs.failover1}</strong></li>
              <li><strong>{t.docs.failover2}</strong></li>
              <li><strong>{t.docs.failover3}</strong></li>
            </ul>

            {/* --- 客户端回退 (onerror) --- */}
            <h2 id="fallback">{t.docs.fallbackTitle}</h2>
            <p>{t.docs.fallbackDesc1}</p>
            <p>{t.docs.fallbackDesc2}</p>

            <h3>{t.docs.fallbackExample1Title}</h3>
            <p>{t.docs.fallbackExample1Desc}</p>
            <CodeBlock lang="HTML">{`<!-- ${t.docs.fallbackCommentSingleScript} -->
<script src="https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js"
        onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js'">
</script>

<!-- ${t.docs.fallbackCommentSingleLink} -->
<link rel="stylesheet" href="https://fastjs.qixz.cn/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      onerror="this.onerror=null;this.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'">`}</CodeBlock>

            <h3>{t.docs.fallbackExample2Title}</h3>
            <p>{t.docs.fallbackExample2Desc}</p>
            <CodeBlock lang="JavaScript">{`/* ${t.docs.fallbackCommentGlobalConfig} */
(function() {
  var backups = {
    'fastjs.qixz.cn': 'cdn.jsdelivr.net',
    'fastjs.qixz.cn/npm': 'unpkg.com',
    'fastjs.qixz.cn/gh': 'cdn.jsdelivr.net/gh',
  };

  document.addEventListener('error', function(e) {
    var el = e.target;
    var src = (el.src || el.href || '');
    if (!src) return;

    for (var key in backups) {
      if (src.indexOf(key) !== -1) {
        var fallback = src.replace(key, backups[key]);
        if (el.tagName === 'SCRIPT' && el.src) {
          el.onerror = null;
          el.src = fallback;
        } else if (el.tagName === 'LINK' && el.href) {
          el.onerror = null;
          el.href = fallback;
        }
        break;
      }
    }
  }, true);
})();`}</CodeBlock>

            <h3>{t.docs.fallbackExample3Title}</h3>
            <p>{t.docs.fallbackExample3Desc}</p>
            <CodeBlock lang="HTML">{`<!-- ${t.docs.fallbackCommentMultiAddr} -->
<script>
(function multiFallback(tag, urls, idx) {
  idx = idx || 0;
  if (idx >= urls.length) {
    console.error('[Fallback] ${t.docs.fallbackCommentAllFailed}: ' + urls.join(', '));
    return;
  }
  var el = document.createElement(tag === 'script' ? 'script' : 'link');
  if (tag === 'script') {
    el.src = urls[idx];
    el.async = true;
  } else {
    el.rel = 'stylesheet';
    el.href = urls[idx];
  }
  el.onerror = function() {
    this.onerror = null;
    this.remove();
    multiFallback(tag, urls, idx + 1);
  };
  document.head.appendChild(el);
})('script', [
  'https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js',
  'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
  'https://unpkg.com/jquery@3.7.1/dist/jquery.min.js',
  '/lib/jquery.min.js'     // ${t.docs.fallbackCommentLocal}
]);`}</CodeBlock>

            <Tip type="info" title={t.docs.fallbackNoteTitle}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>{t.docs.fallbackNoteText1}</li>
                <li>{t.docs.fallbackNoteText2}</li>
                <li>{t.docs.fallbackNoteText3}</li>
              </ul>
            </Tip>

            {/* --- npm --- */}
            <h2 id="npm">{t.docs.npmTitle}</h2>
            <p>{t.docs.npmDesc}</p>

            <h3>{t.docs.npmUrlFormat}</h3>
            <CodeBlock lang="URL">{'https://fastjs.qixz.cn/npm/{package}@{version}/{file}'}</CodeBlock>

            <ParamTable
              paramLabel={t.docs.paramCol}
              requiredLabel={t.docs.requiredCol}
              descLabel={t.docs.descCol}
              rows={[
                [t.docs.npmParam1Name, t.docs.docsYes, t.docs.npmParam1Desc],
                [t.docs.npmParam2Name, t.docs.docsNo, t.docs.npmParam2Desc],
                [t.docs.npmParam3Name, t.docs.docsNo, t.docs.npmParam3Desc],
              ]}
            />

            <h3>{t.docs.npmVersion}</h3>
            <p>{t.docs.npmVersionDesc}</p>

            <table className="doc-table">
              <thead>
                <tr><th>{t.docs.npmMethodTable.method}</th><th>{t.docs.npmMethodTable.example}</th><th>{t.docs.npmMethodTable.desc}</th></tr>
              </thead>
              <tbody>
                <tr><td>{t.docs.npmExact}</td><td><code>jquery@3.7.1</code></td><td>{t.docs.npmExactDesc}</td></tr>
                <tr><td>{t.docs.npmMajor}</td><td><code>jquery@3</code></td><td>{t.docs.npmMajorDesc}</td></tr>
                <tr><td>{t.docs.npmRange}</td><td><code>jquery@3.7</code></td><td>{t.docs.npmRangeDesc}</td></tr>
                <tr><td>{t.docs.npmLatest}</td><td><code>jquery</code></td><td>{t.docs.npmLatestDesc}</td></tr>
              </tbody>
            </table>

            <Tip type="warn" title={t.docs.npmWarnTitle}>
              {t.docs.npmWarnText}
            </Tip>

            <h3>{t.docs.npmScoped}</h3>
            <p>{t.docs.npmScopedDesc}</p>
            <CodeBlock lang="URL">{`https://fastjs.qixz.cn/npm/@babel/core@7.23.0/lib/index.js
https://fastjs.qixz.cn/npm/@vue/runtime-dom@3.3.4/dist/runtime-dom.esm-browser.js`}</CodeBlock>

            <h3>{t.docs.npmFilelist}</h3>
            <p>{t.docs.npmFilelistDesc}</p>
            <CodeBlock lang="URL">{`https://fastjs.qixz.cn/npm/jquery@3.7.1/
https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/`}</CodeBlock>

            <h3>{t.docs.docsExample}</h3>
            <CodeBlock lang="HTML">{`<!-- ${t.docs.commentSpecificVersion} -->
<script src="https://fastjs.qixz.cn/npm/jquery@3.7.1/dist/jquery.min.js"></script>

<!-- ${t.docs.commentLatestVersion} -->
<script src="https://fastjs.qixz.cn/npm/vue/dist/vue.global.js"></script>

<!-- Bootstrap CSS -->
<link rel="stylesheet" href="https://fastjs.qixz.cn/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">

<!-- ${t.docs.commentScopedPackage} -->
<script src="https://fastjs.qixz.cn/npm/@babel/standalone@7.23.0/babel.min.js"></script>`}</CodeBlock>

            {/* --- GitHub --- */}
            <h2 id="github">{t.docs.githubTitle}</h2>
            <p>{t.docs.githubDesc}</p>

            <h3>{t.docs.npmUrlFormat}</h3>
            <CodeBlock lang="URL">{'https://fastjs.qixz.cn/gh/{user}/{repo}@{branch}/{file}'}</CodeBlock>

            <ParamTable
              paramLabel={t.docs.paramCol}
              requiredLabel={t.docs.requiredCol}
              descLabel={t.docs.descCol}
              rows={[
                [t.docs.ghParam1Name, t.docs.docsYes, t.docs.ghParam1Desc],
                [t.docs.ghParam2Name, t.docs.docsYes, t.docs.ghParam2Desc],
                [t.docs.ghParam3Name, t.docs.docsYes, t.docs.ghParam3Desc],
                [t.docs.ghParam4Name, t.docs.docsNo, t.docs.ghParam4Desc],
              ]}
            />

            <h3>{t.docs.githubVersionTitle}</h3>
            <table className="doc-table">
              <thead>
                <tr><th>{t.docs.npmMethodTable.method}</th><th>{t.docs.npmMethodTable.example}</th><th>{t.docs.npmMethodTable.desc}</th></tr>
              </thead>
              <tbody>
                <tr><td>{t.docs.githubTag}</td><td><code>@v5.3.0</code></td><td>{t.docs.githubTagDesc}</td></tr>
                <tr><td>{t.docs.githubBranch}</td><td><code>@main</code></td><td>{t.docs.githubBranchDesc}</td></tr>
                <tr><td>{t.docs.githubCommit}</td><td><code>@abc1234</code></td><td>{t.docs.githubCommitDesc}</td></tr>
              </tbody>
            </table>

            <h3>{t.docs.docsExample}</h3>
            <CodeBlock lang="URL">{`https://fastjs.qixz.cn/gh/twbs/bootstrap@v5.3.0/dist/css/bootstrap.min.css

https://fastjs.qixz.cn/gh/jquery/jquery@main/dist/jquery.min.js

https://fastjs.qixz.cn/gh/user/repo@a1b2c3d/dist/bundle.js`}</CodeBlock>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>
              {t.docs.githubRefNote}
            </p>

            <Tip type="info" title={t.docs.githubTipTitle}>
              {t.docs.githubTipText}
            </Tip>

            {/* --- WordPress --- */}
            <h2 id="wordpress">{t.docs.wpTitle}</h2>
            <p>{t.docs.wpDesc}</p>

            <h3>{t.docs.wpUrlFormat}</h3>
            <CodeBlock lang="URL">{`https://cdn.jsdmirror.com/wp/plugins/{slug}/tags/{version}/{file}
https://cdn.jsdmirror.com/wp/themes/{slug}/{version}/{file}`}</CodeBlock>

            <ParamTable
              paramLabel={t.docs.paramCol}
              requiredLabel={t.docs.requiredCol}
              descLabel={t.docs.descCol}
              rows={[
                ['plugins|themes', t.docs.docsYes, t.docs.wpPluginsDesc],
                ['{slug}', t.docs.docsYes, t.docs.wpSlugDesc],
                ['{version}', t.docs.docsYes, t.docs.wpVersionDesc],
                ['{file}', t.docs.docsNo, t.docs.docsFilePath],
              ]}
            />

            <h3>{t.docs.docsExample}</h3>
            <CodeBlock lang="URL">{`https://cdn.jsdmirror.com/wp/plugins/akismet/tags/4.1.12/akismet.js

https://cdn.jsdmirror.com/wp/themes/twentytwenty/2.0/style.css`}</CodeBlock>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>
              第一条为 <strong>Akismet 插件</strong>，第二条为 <strong>TwentyTwenty 主题</strong>。
            </p>

            {/* --- CNB --- */}
            <h2 id="cnb">{t.docs.cnbTitle}</h2>
            <p>{t.docs.cnbDesc}</p>

            <h3>{t.docs.cnbUrlFormat}</h3>
            <CodeBlock lang="URL">{`https://cdn.jsdmirror.com/cnb/{org}/{repo}@{version}/{file}

https://cdn.jsdmirror.com/cnb/jsdmirror/jsdmirror@main/README.md`}</CodeBlock>

            <ParamTable
              paramLabel={t.docs.paramCol}
              requiredLabel={t.docs.requiredCol}
              descLabel={t.docs.descCol}
              rows={[
                ['{org}/{repo}', t.docs.docsYes, t.docs.docsCnbPackageDesc],
                ['{version}', t.docs.docsNo, t.docs.docsCnbVersionDesc],
                ['{file}', t.docs.docsNo, t.docs.docsFilePath],
              ]}
            />

            {/* --- Google Fonts --- */}
            <h2 id="fonts">{t.docs.fontsTitle}</h2>
            <p>{t.docs.fontsDesc}</p>

            <h3>{t.docs.fontsUrlFormat}</h3>
            <p>{t.docs.fontsUrlFormatDesc}</p>
            <CodeBlock lang="URL">{'https://fonts.cdn.xzzo.cn/css2?family={Font}:wght@{weight}&display=swap'}</CodeBlock>

            <h3>{t.docs.fontsExample}</h3>
            <CodeBlock lang="URL">{'https://fonts.cdn.xzzo.cn/css2?family=Roboto:wght@400&display=swap'}</CodeBlock>

            <h3>{t.docs.fontsUsage}</h3>
            <p>{t.docs.fontsUsageDesc}</p>
            <CodeBlock lang="HTML">{`<!-- ${t.docs.commentPreconnectFonts} -->
<link rel="preconnect" href="https://fonts.cdn.xzzo.cn">
<link rel="preconnect" href="https://font.cdn.xzzo.cn" crossorigin>

<!-- ${t.docs.commentImportRoboto} -->
<link rel="stylesheet" href="https://fonts.cdn.xzzo.cn/css2?family=Roboto:wght@400;700&display=swap">

<style>
  body {
    font-family: 'Roboto', sans-serif;
  }
</style>`}</CodeBlock>

            <Tip type="info" title={t.docs.fontsTipTitle}>
              {t.docs.fontsTipText}
            </Tip>

            {/* --- Gravatar --- */}
            <h2 id="gravatar">{t.docs.gravatarTitle}</h2>
            <p>{t.docs.gravatarDesc}</p>

            <h3>{t.docs.gravatarUrlFormat}</h3>
            <p>{t.docs.gravatarUrlFormatDesc}</p>
            <CodeBlock lang="URL">{'https://gravatar.cdn.xzzo.cn/avatar/{sha256(email)}'}</CodeBlock>

            <h3>{t.docs.gravatarExample}</h3>
            <CodeBlock lang="URL">{'https://gravatar.cdn.xzzo.cn/avatar/5d549030c6a922e55d14e5df541602d8053f864865da5c4a172c07d6bc9c4766'}</CodeBlock>

            <h3>{t.docs.gravatarUsage}</h3>
            <p>{t.docs.gravatarUsageDesc}</p>
            <CodeBlock lang="JavaScript">{`const sha256 = require('js-sha256');

function getGravatarURL(email) {
  // ${t.docs.commentTrimAndLowercase}
  const address = String(email).trim().toLowerCase();
  // ${t.docs.commentSha256Hash}
  const hash = sha256(address);
  // ${t.docs.commentConcatUrl}
  return \`https://gravatar.cdn.xzzo.cn/avatar/\${hash}\`;
}`}</CodeBlock>

            <CodeBlock lang="PHP">{`<?php
function get_gravatar_url($email) {
  // ${t.docs.commentTrimAndLowercase}
  $address = strtolower(trim($email));
  // ${t.docs.commentSha256Hash}
  $hash = hash('sha256', $address);
  // ${t.docs.commentConcatUrl}
  return 'https://gravatar.cdn.xzzo.cn/avatar/' . $hash;
}`}</CodeBlock>

            <Tip type="info" title={t.docs.gravatarTipTitle}>
              {t.docs.gravatarTipText}
            </Tip>

            {/* --- 合并多个文件 --- */}
            <h2 id="combine">{t.docs.combineTitle}</h2>
            <p>{t.docs.combineDesc}</p>

            <h3>{t.docs.combineUrlFormat}</h3>
            <CodeBlock lang="URL">{'https://cdn.jsdmirror.com/combine/{source}/{package}@{version}/{file1},{source}/{package}@{version}/{file2}'}</CodeBlock>

            <h3>{t.docs.docsExample}</h3>
            <CodeBlock lang="URL">{`https://cdn.jsdmirror.com/combine/npm/jquery@3.7.1/dist/jquery.min.js,npm/bootstrap@5.3.0/dist/js/bootstrap.min.js

https://cdn.jsdmirror.com/combine/gh/user/repo@main/a.js,gh/user/repo@main/b.js`}</CodeBlock>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>
              第一条为合并两个 npm 包，第二条为合并两个 GitHub 文件。
            </p>

            <Tip type="warn" title={t.docs.combineWarnTitle}>
              {t.docs.combineWarnText}
            </Tip>

            {/* --- 缓存策略 --- */}
            <h2 id="caching">{t.docs.cachingTitle}</h2>
            <p>{t.docs.cachingDesc}</p>
            <ul>
              <li><strong>{t.docs.cachingBrowser}</strong></li>
              <li><strong>{t.docs.cachingEdge}</strong></li>
              <li><strong>{t.docs.cachingShield}</strong></li>
              <li><strong>{t.docs.cachingOrigin}</strong></li>
            </ul>

            <h3>{t.docs.cachingVersionedTitle}</h3>
            <p>{t.docs.cachingVersionedDesc}</p>

            <h3>{t.docs.cachingUnversionedTitle}</h3>
            <p>{t.docs.cachingUnversionedDesc}</p>

            <table className="doc-table">
              <thead>
                <tr><th>{t.docs.cachingTable.urlType}</th><th>{t.docs.cachingTable.cacheTime}</th><th>{t.docs.cachingTable.updateWhen}</th></tr>
              </thead>
              <tbody>
                <tr><td><code>jquery@3.7.1</code></td><td>{t.docs.docsCache1Year}</td><td>{t.docs.cachingTable.immutable}</td></tr>
                <tr><td><code>jquery@3</code></td><td>{t.docs.docsCache12Hours}</td><td>{t.docs.cachingTable.majorUpdate}</td></tr>
                <tr><td><code>jquery</code></td><td>{t.docs.docsCache12Hours}</td><td>{t.docs.cachingTable.anyUpdate}</td></tr>
              </tbody>
            </table>

            {/* --- 刷新缓存 --- */}
            <h2 id="purge">{t.docs.purgeTitle}</h2>
            <p>{t.docs.purgeDesc1}</p>
            <ol>
              <li>{t.docs.purgeStep1} <a href="https://eo.xzzo.cn/cache/" target="_blank" rel="noopener noreferrer">https://eo.xzzo.cn/cache/</a></li>
              <li>{t.docs.purgeStep2}</li>
              <li>{t.docs.purgeStep3}</li>
            </ol>
            <Tip type="info" title={t.docs.purgeTipTitle}>
              {t.docs.purgeTipText}
            </Tip>

            {/* --- API --- */}
            <h2 id="api">{t.docs.apiTitle}</h2>

            <h3>{t.docs.apiMetaTitle}</h3>
            <p>{t.docs.apiMetaDesc}</p>
            <CodeBlock lang="URL">{`https://cdn.jsdmirror.com/npm/jquery@3.7.1/package.json

https://cdn.jsdmirror.com/npm/jquery/`}</CodeBlock>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>
              {t.docs.apiMetaPackage}；{t.docs.apiMetaVersions}
            </p>

            <h3>{t.docs.apiStatsTitle}</h3>
            <div className="table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>{t.docs.apiStatsMethod}</th><th>{t.docs.apiStatsEndpoint}</th><th>{t.docs.apiStatsDescCol}</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>GET</td>
                    <td><code>https://status.jsdmirror.com/</code></td>
                    <td>{t.docs.apiStatsStatus}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>{t.docs.apiPurgeTitle}</h3>
            <div className="table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>{t.docs.apiStatsMethod}</th><th>{t.docs.apiStatsEndpoint}</th><th>{t.docs.apiStatsDescCol}</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>POST</td>
                    <td><code>https://eo.xzzo.cn/cache/</code></td>
                    <td>{t.docs.apiPurgeDesc}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* --- 速率限制 --- */}
            <h2 id="rate-limit">{t.docs.rateLimitTitle}</h2>
            <p>{t.docs.rateLimitDesc}</p>
            <div className="table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>{t.docs.rateLimitPlan}</th><th>{t.docs.rateLimitSpeed}</th><th>{t.docs.rateLimitQps}</th><th>{t.docs.rateLimitTraffic}</th></tr>
                </thead>
                <tbody>
                  <tr><td>免费</td><td>{t.docs.rateLimitFree}</td><td>300</td><td>100 GB</td></tr>
                  <tr><td>个人</td><td>{t.docs.rateLimitPersonal}</td><td>1,000</td><td>1 TB</td></tr>
                  <tr><td>定制</td><td>{t.docs.rateLimitCustom}</td><td>{t.docs.rateLimitUnlimited}</td><td>{t.docs.rateLimitUnlimited}</td></tr>
                </tbody>
              </table>
            </div>
            <Tip type="warn" title={t.docs.rateLimitWarnTitle}>
              {t.docs.rateLimitWarnText}
            </Tip>

            {/* ==================== 软件包作者指南 ==================== */}

            <h2 id="package-author">{t.docs.packageTitle}</h2>
            <p>{t.docs.packageDesc1}</p>
            <ul>
              <li>{t.docs.packageBullet1}</li>
              <li>{t.docs.packageBullet2}</li>
              <li>{t.docs.packageBullet3}</li>
              <li>{t.docs.packageBullet4}</li>
              <li>{t.docs.packageBullet5}</li>
            </ul>

            <h2 id="default-files">{t.docs.packageDefaultTitle}</h2>
            <p>{t.docs.packageDefaultDesc}</p>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>{t.docs.packageDefaultTable.priority}</th>
                  <th>{t.docs.packageDefaultTable.field}</th>
                  <th>{t.docs.packageDefaultTable.desc}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: 'rgba(0, 102, 255, 0.06)' }}>
                  <td><strong>1（最高）</strong></td>
                  <td><code>jsdelivr</code></td>
                  <td>{t.docs.packageDefaultTable.jsdelivr}</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td><code>browser</code></td>
                  <td>{t.docs.packageDefaultTable.browser}</td>
                </tr>
                  <tr>
                  <td>3</td>
                  <td><code>main</code></td>
                  <td>{t.docs.packageDefaultTable.main}</td>
                </tr>
              </tbody>
            </table>

            <p>{t.docs.packageDefaultNote}</p>

            <Tip type="warn" title={t.docs.packageDefaultWarnTitle}>
              {t.docs.packageDefaultWarnText}
            </Tip>

            <h3>{t.docs.packageJsCssTitle}</h3>
            <p>{t.docs.packageJsCssDesc}</p>

            <CodeBlock lang="package.json">{`{
  "name": "my-library",
  "version": "1.0.0",
  "jsdelivr": "./dist/my-library.min.js",
  "style": "./dist/my-library.min.css"
}`}</CodeBlock>

            {/* --- 限制 --- */}
            <h2 id="limits">{t.docs.limitsTitle}</h2>
            <p>{t.docs.limitsDesc}</p>
            <ul>
              <li><strong>{t.docs.limitsBullet1}</strong></li>
              <li><strong>{t.docs.limitsBullet2}</strong></li>
            </ul>
            <p>{t.docs.limitsNote}</p>

            <Tip type="info" title={t.docs.limitSecurityTitle}>
              {t.docs.limitSecurityText}
            </Tip>

            {/* --- 自定义 CDN 托管 --- */}
            <h2 id="custom-cdn">{t.docs.customCdnTitle}</h2>
            <p>{t.docs.customCdnDesc}</p>

            <h3>{t.docs.customCdnScenariosTitle}</h3>
            <ul>
              <li><strong>{t.docs.customCdnScenario1}</strong></li>
              <li><strong>{t.docs.customCdnScenario2}</strong></li>
              <li><strong>{t.docs.customCdnScenario3}</strong></li>
              <li>{t.docs.customCdnScenario4}</li>
            </ul>

            {/* ==================== SRI 子资源完整性 ==================== */}
            <h2 id="sri">{t.docs.sriTitle}</h2>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
              {t.docs.sriSubtitle}
            </p>

            {/* 什么是 SRI */}
            <h3>{t.docs.sriIntroTitle}</h3>
            <p>
              {t.docs.sriIntroText1}
              <code>integrity</code>
              {t.docs.sriIntroText3}
            </p>

            {/* SRI 如何工作 */}
            <h3>{t.docs.sriHowTitle}</h3>
            <p>{t.docs.sriHowText1}</p>
            <p>
              {t.docs.sriHowText2}
              <code>integrity</code>
              {t.docs.sriHowText4}
              <code>integrity</code>
              {t.docs.sriHowText6}
            </p>
            <ul>
              <li>{t.docs.sriHowBullet1}</li>
              <li>{t.docs.sriHowBullet2}</li>
            </ul>

            {/* 如何使用 */}
            <h3>{t.docs.sriUsageTitle}</h3>
            <p>
              {t.docs.sriUsageText1}
              <code>integrity</code>
              {t.docs.sriUsageText2}
              <code>crossorigin</code>
              {t.docs.sriUsageText3}
            </p>

            <h4>{t.docs.sriUsageFormatTitle}</h4>
            <p>{t.docs.sriUsageFormat}</p>
            <CodeBlock lang="html">{`integrity="sha384-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}</CodeBlock>

            <p style={{ marginTop: 12 }}>{t.docs.sriUsageAlgos}</p>
            <ul>
              <li>{t.docs.sriUsageAlgoSha256}</li>
              <li>{t.docs.sriUsageAlgoSha384}</li>
              <li>{t.docs.sriUsageAlgoSha512}</li>
            </ul>
            <Tip type="info" title={lang === 'en' ? 'Recommendation' : '建议'}>
              {t.docs.sriUsageRecommend}
            </Tip>

            {/* 生成 SRI 哈希值 */}
            <h3>{t.docs.sriGenTitle}</h3>

            <h4>{t.docs.sriGenCmdTitle}</h4>
            <p>{t.docs.sriGenCmdOpenSsl}</p>
            <CodeBlock lang="bash">{`cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A`}</CodeBlock>

            <p style={{ marginTop: 12 }}>{t.docs.sriGenCmdShasum}</p>
            <CodeBlock lang="bash">{`shasum -b -a 384 FILENAME.js | awk '{ print $1 }' | xxd -r -p | base64`}</CodeBlock>

            <p style={{ marginTop: 12 }}>{t.docs.sriGenCmdWin}</p>
            <CodeBlock lang="batch">{`@echo off
set bits=384
openssl dgst -sha%bits% -binary %1% | openssl base64 -A > tmp
set /p a= < tmp
del tmp
echo sha%bits%-%a%
pause`}</CodeBlock>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.docs.sriGenCmdWinDesc}</p>

            {/* CORS 与 SRI */}
            <h3>{t.docs.sriCorsTitle}</h3>
            <p>
              {t.docs.sriCorsText1}
              <code>Access-Control-Allow-Origin</code>
              {t.docs.sriCorsText2}
              <code>crossorigin="anonymous"</code>
              {t.docs.sriCorsText4}
            </p>
            <Tip type="warn" title={lang === 'en' ? 'Important' : '请注意'}>
              <p style={{ margin: 0 }}>{t.docs.sriCorsText5}</p>
              <p style={{ margin: '8px 0 0' }}>{t.docs.sriCorsText6}</p>
            </Tip>

            {/* 示例 */}
            <h3>{t.docs.sriExampleJsTitle}</h3>
            <CodeBlock lang="html">{`<script
  src="https://cdn.jsdmirror.com/npm/jquery@3.7.1/dist/jquery.min.js"
  integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g=="
  crossorigin="anonymous">
</script>`}</CodeBlock>

            <h3>{t.docs.sriExampleCssTitle}</h3>
            <CodeBlock lang="html">{`<link
  rel="stylesheet"
  href="https://cdn.jsdmirror.com/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  integrity="sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg=="
  crossorigin="anonymous">`}</CodeBlock>

            <h3>{t.docs.sriExampleMultipleTitle}</h3>
            <p>{t.docs.sriExampleMultipleDesc}</p>
            <CodeBlock lang="html">{`<script
  src="https://cdn.jsdmirror.com/npm/lodash@4.17.21/lodash.min.js"
  integrity="sha384-M6AVYaH6du1M4aPFfoO9lfZxjGbksZf5X0U4Y6L+ZxgZh8Bj8TsNhqgIz6qSPbw sha512-F7IzMNt3cX/jKpJOBaVWyOQZrF2Yy5L3y7LqR+uGW8bPqCwnCsxHX9kRr3jDF/HkBHCeQQ5VgSYVjXZQbbKVw=="
  crossorigin="anonymous">
</script>`}</CodeBlock>

            {/* 浏览器如何处理 SRI */}
            <h3>{t.docs.sriBrowserTitle}</h3>
            <ol>
              <li>{t.docs.sriBrowserStep1}</li>
              <li>{t.docs.sriBrowserStep2}</li>
              <li>{t.docs.sriBrowserStep3}</li>
              <li>{t.docs.sriBrowserStep4}</li>
              <li>{t.docs.sriBrowserStep5}</li>
              <li>{t.docs.sriBrowserStep6}</li>
            </ol>

            <Tip type="warn" title={lang === 'en' ? 'Important' : '请注意'}>
              <p style={{ margin: 0 }}>{t.docs.sriNote}</p>
            </Tip>

            {/* ==================== JSDMirror 响应头一览（独立板块） ==================== */}
            <h2 id="response-headers">{t.docs.reverseProxyHeaderIntroTitle}</h2>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '14px 18px',
              margin: '16px 0 20px',
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}>
              {t.docs.reverseProxyHeaderIntroDesc}
            </div>

            {(() => {
              const all = (t.docs.reverseProxyHeaderTable as { name: string; purpose: string; note?: string }[]).map((h) => ({
                ...h,
                name: h.name.includes(' / ') ? h.name.replace(' / ', '、') : h.name,
              }));
              return (
                <div className="table-wrap">
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th style={{ width: '32%' }}>{t.docs.tableParam}</th>
                        <th>{t.docs.tableDesc}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {all.map((h) => (
                        <tr key={h.name}>
                          <td><code>{h.name}</code></td>
                          <td style={{ fontSize: 13 }}>{h.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* ==================== 反向代理说明 ==================== */}
            <h2 id="reverse-proxy">{t.docs.reverseProxyTitle}</h2>
            <p>{t.docs.reverseProxyDesc}</p>

            {/* 需要清理的响应头 */}
            {(() => {
              const all = t.docs.reverseProxyHeaderTable as { name: string; purpose: string; note?: string }[];
              const removeHeaders = all.filter((h) => h.note);
              return (
                <>
                  <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--danger, #ef4444)' }}>
                    ⚠ {t.docs.reverseProxyHeaderRemoveTitle}（{removeHeaders.length} 个）
                  </h4>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderLeft: '3px solid var(--danger, #ef4444)',
                    borderRadius: '0 var(--radius) var(--radius) 0',
                    padding: '14px 18px',
                    marginBottom: 20,
                  }}>
                    <code style={{
                      color: 'var(--danger, #ef4444)',
                      fontSize: 13,
                      lineHeight: 2,
                      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                      wordBreak: 'break-all',
                    }}>
                      {removeHeaders.map((h) => h.name).join('、')}
                    </code>
                  </div>
                </>
              );
            })()}

            <h3>{t.docs.reverseProxyReasonTitle}</h3>
            <p>{t.docs.reverseProxyReasonText}</p>

            <h3>{t.docs.reverseProxyConsequenceTitle}</h3>
            <p>{t.docs.reverseProxyConsequenceText}</p>

            <Tip type="warn" title={t.docs.reverseProxySpecialTitle}>
              {t.docs.reverseProxySpecialText}
            </Tip>

            <h3>{t.docs.reverseProxyNginxTitle}</h3>
            <CodeBlock lang="nginx">{`# ${t.docs.commentNginxAddBlock}
location / {
    proxy_pass https://cdn.jsdmirror.com;

    # ${t.docs.commentNginxCleanHeaders}
    proxy_hide_header server;
    proxy_hide_header cdn;
    proxy_hide_header x-served-by;
    proxy_hide_header x-client-ip;
    proxy_hide_header x-client-city;
    proxy_hide_header x-client-country;
    proxy_hide_header x-client-continent;
    proxy_hide_header x-client-port;
    proxy_hide_header requestsource;
    proxy_hide_header x-ua;
    proxy_hide_header x-platform;
    proxy_hide_header x-request-uri;

    # ${t.docs.commentNginxExtraClean}
    proxy_hide_header x-cache;
    proxy_hide_header x-cache-hits;
    proxy_hide_header via;
}`}</CodeBlock>

            <Tip type="success" title={t.docs.contactTitle}>
              {t.docs.contactText}
            </Tip>
          </div>
        </div>
      </div>
    </>
  );
}
