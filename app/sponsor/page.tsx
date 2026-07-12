'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n';

export default function SponsorPage() {
  const t = useT();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const paymentItems = [
    {
      icon: 'alipay',
      name: t.sponsor.alipay,
      desc: t.sponsor.alipayDesc,
      qr: '/images/Alipay.jpg',
    },
    {
      icon: 'wechat',
      name: t.sponsor.wechat,
      desc: t.sponsor.wechatDesc,
      qr: '/images/Wechat.jpg',
    },
    {
      icon: 'qq',
      name: t.sponsor.qq,
      desc: t.sponsor.qqDesc,
      qr: '/images/QQ.jpg',
    },
    {
      icon: 'paypal',
      name: t.sponsor.paypal,
      desc: t.sponsor.paypalDesc,
      link: 'http://paypal.me/zeayao',
      linkLabel: 'paypal.me/zeayao',
    },
    {
      icon: 'wechat-work',
      name: t.sponsor.wecom,
      desc: t.sponsor.wecomDesc,
      qr: '/images/Wecom.jpg',
    },
    {
      icon: 'bank',
      name: t.sponsor.bank,
      desc: t.sponsor.bankDesc,
      bankInfo: {
        title: t.sponsor.bankTitle,
        bank: t.sponsor.bankName,
        account: t.sponsor.bankAccount,
      },
    },
  ].filter((pm) => !!pm.name);

  return (
    <>
      <section className="page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1>{t.sponsor.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.sponsor.subtitle}</p>
        </div>
      </section>

      {/* 支付方式 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>{t.sponsor.paymentMethods}</h2>
            <p className="section-desc">{t.sponsor.paymentSubtitle}</p>
          </div>
          <div className="payment-methods">
            {paymentItems.map((pm) => {
              const hasQr = !!pm.qr;
              const hasLink = !!(pm as any).link;
              const hasBank = !!(pm as any).bankInfo;

              return (
                <div key={pm.icon} className={`payment-card${hasQr ? ' has-qr' : ''}`}>
                  <div className={`payment-icon ${pm.icon}`}>
                    {pm.icon === 'alipay' && (
                      <img src="/images/alipay.png" alt={t.sponsor.alipay} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {pm.icon === 'wechat' && (
                      <img src="/images/wechatico.png" alt={t.sponsor.wechat} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {pm.icon === 'qq' && (
                      <img src="/images/qq-logo.png" alt={t.sponsor.qq} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {pm.icon === 'paypal' && (
                      <img src="/images/pp196.png" alt={t.sponsor.paypal} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {pm.icon === 'wechat-work' && (
                      <img src="/images/Wecomico.png" alt={t.sponsor.wecom} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    )}
                    {pm.icon === 'bank' && (
                      <i className="bi bi-bank" style={{ fontSize: 28 }} />
                    )}
                  </div>
                  <div className="payment-card-info">
                    <h3>{pm.name}</h3>
                    <p>{pm.desc}</p>
                  </div>
                  <div className="payment-placeholder">
                    {hasQr ? (
                      <button className="payment-qr-trigger" onClick={() => setLightboxSrc(pm.qr)}>
                        <i className="bi bi-qr-code" />
                        {t.sponsor.clickForQr}
                      </button>
                    ) : hasLink ? (
                      <a href={(pm as any).link} className="payment-link-btn">
                        🔗 {(pm as any).linkLabel}
                      </a>
                    ) : hasBank ? (
                      <div className="payment-bank-info">
                        <p className="bank-name">{(pm as any).bankInfo.title}</p>
                        <p>{(pm as any).bankInfo.bank}</p>
                        <p className="bank-account">{(pm as any).bankInfo.account}</p>
                      </div>
                    ) : (
                      <span>{t.sponsor.qrPending}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 赞助后操作 + 注意事项 */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="instructions-box">
            <h2>{t.sponsor.instructionsTitle}</h2>
            <p className="instructions-sub">{t.sponsor.instructionsDesc}</p>
            <div className="instructions-email">
              <i className="bi bi-envelope" />
              {t.sponsor.instructionsEmail}
            </div>
            <ul className="instructions-list">
              {(t.sponsor.instructionsList as string[]).map((item: string) => (
                <li key={item}>
                  <span className="instructions-num" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="instructions-notice">
              <strong>{t.sponsor.noticeTitle}</strong>
              <ul>
                <li>{t.sponsor.notice1}</li>
                <li>{t.sponsor.notice3}</li>
                <li>{t.sponsor.notice4}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 赞助排行榜入口 */}
      <section className="section leaderboard-section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="leaderboard-link">
            <h3>{t.sponsor.leaderboardTitle}</h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>{t.sponsor.leaderboardSubtitle}</p>
            <Link href="/top" className="btn btn-primary">
              {t.sponsor.leaderboardBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="qr-lightbox" onClick={() => setLightboxSrc(null)}>
          <div className="qr-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="qr-lightbox-close" onClick={() => setLightboxSrc(null)}>
              <i className="bi bi-x-lg" style={{ fontSize: 28 }} />
            </button>
            <img src={lightboxSrc} alt="QR Code" className="qr-lightbox-img" />
          </div>
        </div>
      )}
    </>
  );
}
