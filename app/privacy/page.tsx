'use client';

import { useLang } from '@/i18n';

export default function PrivacyPage() {
  const { lang } = useLang();
  const isEn = lang === 'en';

  return (
    <>
      <section className="page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1>{isEn ? 'Privacy Policy' : '隐私政策'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{isEn ? 'How we collect, use and protect your data' : '我们如何收集、使用和保护您的数据'}</p>
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
                      <li><a href="#s01">Information Collection</a></li>
                      <li><a href="#s02">Information Usage</a></li>
                      <li><a href="#s03">Data Storage &amp; Protection</a></li>
                      <li><a href="#s04">Information Sharing</a></li>
                      <li><a href="#s05">Your Rights</a></li>
                      <li><a href="#s06">Policy Updates</a></li>
                    </>
                  ) : (
                    <>
                      <li><a href="#s01">信息收集</a></li>
                      <li><a href="#s02">信息使用</a></li>
                      <li><a href="#s03">信息存储与保护</a></li>
                      <li><a href="#s04">信息共享</a></li>
                      <li><a href="#s05">您的权利</a></li>
                      <li><a href="#s06">政策更新</a></li>
                    </>
                  )}
                </ul>
              </div>
            </aside>

            {/* Main content */}
            <div className="legal-card">
              <div className="legal-card-header">
                <div className="legal-icon">
                  <i className="bi bi-shield-fill-check" />
                </div>
                <div>
                  <h2>{isEn ? 'Privacy Policy' : '隐私政策'}</h2>
                  <p className="legal-date">{isEn ? 'Last Updated: January 1, 2026' : '更新日期：2026 年 1 月 1 日'}</p>
                </div>
              </div>

              <div className="legal-intro">
                <p>
                  {isEn
                    ? 'This Privacy Policy explains how JSDMirror collects, uses, and protects your information when you use our CDN acceleration service. We are committed to protecting your privacy and handling your data transparently.'
                    : '本隐私政策说明了 JSDMirror 在您使用 CDN 加速服务时如何收集、使用和保护您的信息。我们致力于保护您的隐私，并以透明的方式处理您的数据。'}
                </p>
              </div>

              <div className="legal-body">
                {isEn ? (
                  <>
                    <div className="legal-section" id="s01">
                      <h3><span className="legal-num">01</span>Information Collection</h3>
                      <p>We only collect the minimum information necessary to provide the Service: request logs (URL, timestamp, IP address), traffic statistics.</p>
                      <p>We do not actively collect personal information such as name, email, or phone number.</p>
                    </div>
                    <div className="legal-section" id="s02">
                      <h3><span className="legal-num">02</span>Information Usage</h3>
                      <p>Collected information is used solely for: service operation, quality optimization, security protection, and abuse detection.</p>
                      <p>We do not use your information for advertising or commercial marketing.</p>
                    </div>
                    <div className="legal-section" id="s03">
                      <h3><span className="legal-num">03</span>Data Storage &amp; Protection</h3>
                      <p>In compliance with the Cybersecurity Law of the People&apos;s Republic of China, network logs are retained for no less than six months.</p>
                      <p>We employ industry-standard security measures including encrypted transmission, access control, and data anonymization.</p>
                    </div>
                    <div className="legal-section" id="s04">
                      <h3><span className="legal-num">04</span>Information Sharing</h3>
                      <p>We do not sell, rent, or share your information with third parties.</p>
                      <p>We may disclose information when required by law.</p>
                    </div>
                    <div className="legal-section" id="s05">
                      <h3><span className="legal-num">05</span>Your Rights</h3>
                      <p>You have the right to request access, correction, or deletion of your information.</p>
                    </div>
                    <div className="legal-section" id="s06">
                      <h3><span className="legal-num">06</span>Policy Updates</h3>
                      <p>We may update this policy from time to time. Updates will be posted on this page.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="legal-section" id="s01">
                      <h3><span className="legal-num">01</span>信息收集</h3>
                      <p>我们仅收集提供服务所必需的最少量信息，包括：请求日志（URL、时间戳、IP 地址）、流量统计数据。</p>
                      <p>我们不会主动收集您的个人信息，如姓名、邮箱、电话号码等（除非您主动提供）。</p>
                      <p>我们使用 Cookie 等技术来维持服务的正常运行。</p>
                    </div>
                    <div className="legal-section" id="s02">
                      <h3><span className="legal-num">02</span>信息使用</h3>
                      <p>收集的信息仅用于：保障服务正常运行、优化服务质量、安全防护和滥用检测。</p>
                      <p>我们不会将您的信息用于广告推送或任何商业营销目的。</p>
                    </div>
                    <div className="legal-section" id="s03">
                      <h3><span className="legal-num">03</span>信息存储与保护</h3>
                      <p>根据《中华人民共和国网络安全法》要求，网络日志留存不少于六个月。我们严格遵守法律规定。</p>
                      <p>我们采用行业标准的安全措施保护数据安全，包括加密传输、访问控制、数据脱敏等。</p>
                    </div>
                    <div className="legal-section" id="s04">
                      <h3><span className="legal-num">04</span>信息共享</h3>
                      <p>我们不会将您的信息出售、出租或分享给第三方。</p>
                      <p>在法律要求或保护我们合法权益的情况下，我们可能会依法提供相关信息。</p>
                    </div>
                    <div className="legal-section" id="s05">
                      <h3><span className="legal-num">05</span>您的权利</h3>
                      <p>您有权要求查阅、更正或删除我们持有的与您相关的信息。</p>
                      <p>如有任何隐私相关问题，请通过邮箱 <a href="mailto:ayao@cola.email">ayao@cola.email</a> 联系我们。</p>
                    </div>
                    <div className="legal-section" id="s06">
                      <h3><span className="legal-num">06</span>政策更新</h3>
                      <p>我们可能会不时更新本隐私政策，更新后的政策将在本页面公布。</p>
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
