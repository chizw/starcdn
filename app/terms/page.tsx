'use client';

import { useLang } from '@/i18n';

export default function TermsPage() {
  const { lang } = useLang();
  const isEn = lang === 'en';

  return (
    <>
      <section className="page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1>{isEn ? 'Terms of Service' : '用户协议'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{isEn ? 'Rules and responsibilities for using our service' : '使用我们服务的规则与责任'}</p>
        </div>
      </section>

      <section style={{ padding: '60px 0 80px' }}>
        <div className="container">
          <div className="legal-layout">
            {/* Sidebar TOC */}
            <aside className="legal-toc">
              <div className="legal-toc-inner">
                <h4 className="legal-toc-title">{isEn ? 'Contents' : '目录'}</h4>
                <ul>
                  {isEn ? (
                    <>
                      <li><a href="#s01">General</a></li>
                      <li><a href="#s02">Service Description</a></li>
                      <li><a href="#s03">User Responsibilities</a></li>
                      <li><a href="#s04">Disclaimer</a></li>
                      <li><a href="#s05">Intellectual Property</a></li>
                      <li><a href="#s06">Miscellaneous</a></li>
                    </>
                  ) : (
                    <>
                      <li><a href="#s01">总则</a></li>
                      <li><a href="#s02">服务内容</a></li>
                      <li><a href="#s03">用户责任</a></li>
                      <li><a href="#s04">免责声明</a></li>
                      <li><a href="#s05">知识产权</a></li>
                      <li><a href="#s06">其他</a></li>
                    </>
                  )}
                </ul>
              </div>
            </aside>

            {/* Main content */}
            <div className="legal-card">
              <div className="legal-card-header">
                <div className="legal-icon">
                  <i className="bi bi-file-earmark-text" />
                </div>
                <div>
                  <h2>{isEn ? 'Terms of Service' : '用户服务协议'}</h2>
                  <p className="legal-date">{isEn ? 'Last Updated: January 1, 2026' : '更新日期：2026 年 1 月 1 日'}</p>
                </div>
              </div>

              <div className="legal-intro">
                <p>
                  {isEn
                    ? 'Welcome to JSDMirror. By using our CDN acceleration service, you agree to these terms. Please read them carefully before using the service.'
                    : '欢迎使用 JSDMirror。使用我们的 CDN 加速服务即表示您同意本协议。请在使用前仔细阅读以下条款。'}
                </p>
              </div>

              <div className="legal-body">
                {isEn ? (
                  <>
                    <div className="legal-section" id="s01">
                      <h3><span className="legal-num">01</span>General</h3>
                      <p>Welcome to JSDMirror (&quot;the Service&quot;). This agreement is a legal agreement between you and JSDMirror regarding the use of the Service.</p>
                      <p>By using the Service, you agree to be bound by these terms. If you do not agree, please do not use the Service.</p>
                    </div>
                    <div className="legal-section" id="s02">
                      <h3><span className="legal-num">02</span>Service Description</h3>
                      <p>JSDMirror provides CDN acceleration for frontend public resources, including NPM packages, GitHub files, and WordPress acceleration.</p>
                      <p>We reserve the right to modify or discontinue services at any time.</p>
                    </div>
                    <div className="legal-section" id="s03">
                      <h3><span className="legal-num">03</span>User Responsibilities</h3>
                      <p>You agree not to use the Service for any illegal activities.</p>
                      <p>We reserve the right to suspend or terminate access for users who violate these terms.</p>
                    </div>
                    <div className="legal-section" id="s04">
                      <h3><span className="legal-num">04</span>Disclaimer</h3>
                      <p>The Service is provided &quot;as is&quot; without any warranties.</p>
                      <p>We are not liable for any damages arising from the use of the Service.</p>
                    </div>
                    <div className="legal-section" id="s05">
                      <h3><span className="legal-num">05</span>Intellectual Property</h3>
                      <p>Resources distributed through the Service remain the property of their original rights holders.</p>
                      <p>The JSDMirror name and branding are the property of the JSDMirror team.</p>
                    </div>
                    <div className="legal-section" id="s06">
                      <h3><span className="legal-num">06</span>Miscellaneous</h3>
                      <p>This agreement is governed by the laws of the People&apos;s Republic of China.</p>
                      <p>If any provision is found invalid, the remaining provisions remain in effect.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="legal-section" id="s01">
                      <h3><span className="legal-num">01</span>总则</h3>
                      <p>欢迎使用 JSDMirror（以下简称"本服务"）。本协议是您与 JSDMirror 之间关于使用本服务的法律协议。</p>
                      <p>在使用本服务前，请您务必仔细阅读并充分理解本协议的全部内容。一旦您开始使用本服务，即视为您已阅读并同意接受本协议的全部条款。</p>
                      <p>本服务由 JSDMirror 团队提供和运营。我们保留随时修改本协议的权利，修改后的协议将在本页面公布。</p>
                    </div>
                    <div className="legal-section" id="s02">
                      <h3><span className="legal-num">02</span>服务内容</h3>
                      <p>JSDMirror 提供前端公共资源的 CDN 加速服务，包括但不限于：NPM 包加速、GitHub 文件加速、WordPress 加速等。</p>
                      <p>我们保留根据实际情况调整服务内容和范围的权利，包括但不限于增加、修改或终止某些服务。</p>
                    </div>
                    <div className="legal-section" id="s03">
                      <h3><span className="legal-num">03</span>用户责任</h3>
                      <p>您不得利用本服务从事任何违法活动，包括但不限于传播违法信息、侵犯他人知识产权、传播恶意软件等。</p>
                      <p>您应当合法使用本服务提供的资源，不得进行任何可能影响服务稳定性的行为。</p>
                      <p>对于违反本协议的用户，我们有权暂停或终止提供服务。</p>
                    </div>
                    <div className="legal-section" id="s04">
                      <h3><span className="legal-num">04</span>免责声明</h3>
                      <p>本服务按"现状"提供，不提供任何明示或暗示的保证。</p>
                      <p>我们不保证服务不会中断，不保证服务的及时性、安全性或准确性。</p>
                      <p>在法律允许的最大范围内，我们对因使用本服务而产生的任何直接或间接损失不承担责任。</p>
                    </div>
                    <div className="legal-section" id="s05">
                      <h3><span className="legal-num">05</span>知识产权</h3>
                      <p>通过本服务分发的资源，其知识产权归原始权利人所有。</p>
                      <p>JSDMirror 的名称、标识和网站内容的知识产权归 JSDMirror 团队所有。</p>
                    </div>
                    <div className="legal-section" id="s06">
                      <h3><span className="legal-num">06</span>其他</h3>
                      <p>本协议的解释、效力及争议的解决，适用中华人民共和国法律。</p>
                      <p>如本协议任何条款被认定为无效，不影响其他条款的效力。</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
