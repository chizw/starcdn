'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useT } from '@/i18n';

const VERSION_URL = 'https://cdn.jsdmirror.com/cnb/jsdmirror/json@main/version.json';

export default function Footer() {
  const t = useT();
  const [openCols, setOpenCols] = useState<Set<number>>(new Set());
  const [latestVer, setLatestVer] = useState('');

  useEffect(() => {
    fetch(VERSION_URL)
      .then((r) => (r.ok ? r.json() : fetch('/version.json').then((j) => j.json())))
      .then((d: { id: number; version: string }[]) => {
        if (d.length > 0) setLatestVer(d.sort((a, b) => b.id - a.id)[0].version);
      })
      .catch(() => setLatestVer('V3.1.5'));
  }, []);

  const toggleCol = (idx: number) => {
    setOpenCols((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const colData = [
    {
      title: t.footer.quickLinks,
      links: [
        { href: '/', label: t.footer.home },
        { href: '/about', label: t.footer.about },
        { href: '/sponsor', label: t.footer.sponsorChannel },
        { href: '/notices', label: t.footer.noticeCenter },
      ],
    },
    {
      title: t.footer.support,
      links: [
        { href: '/terms', label: t.footer.terms },
        { href: '/privacy', label: t.footer.privacy },
        { href: '/docs', label: t.footer.usageDocs },
        { href: 'https://status.jsdmirror.com/', label: t.footer.status },
        { href: 'mailto:ayao@cola.email', label: t.footer.contactSupport },
      ],
    },
    {
      title: t.footer.contact,
      links: [
        { href: 'mailto:kr@cola.email', label: t.footer.joinUs },
        { href: 'mailto:ayao@cola.email', label: t.footer.contactUs },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: 'https://cos.jsdmirror.com/images/2021/09/10/qq.png',
      href: 'https://qm.qq.com/cgi-bin/qm/qr?k=PWdCZAYnc5G33n8CsXB4swW7CmCa6zMD&jump_from=webapi&authKey=2TBqZa9/Mr1xMqiQZ8+JpuQY/NMH7ZNgMiyvEiaiOTr5wGDhtbcPq9/WtBjPW8ps',
      alt: 'QQ',
      qr: null as string | null,
    },
    {
      icon: 'https://cos.jsdmirror.com/images/2021/09/10/wecom.png',
      href: '#',
      alt: '企业微信',
      qr: 'https://cos.jsdmirror.com/jsdmirror/static/img/wecom.jpg',
    },
    {
      icon: 'https://cos.jsdmirror.com/images/2021/09/10/tg.png',
      href: '#',
      alt: 'Telegram',
      qr: 'https://cos.jsdmirror.com/jsdmirror/static/img/3b1a21d2db801c859a11646b9c6d3e0b.png',
    },
    {
      icon: 'https://cos.jsdmirror.com/images/2021/09/10/bilibili.png',
      href: 'https://space.bilibili.com/293201568',
      alt: 'Bilibili',
      qr: null as string | null,
    },
    {
      icon: 'https://cos.jsdmirror.com/images/2021/09/10/github.png',
      href: 'https://github.com/jsdmirror/www.jsdmirror.com',
      alt: 'GitHub',
      qr: null as string | null,
    },
    {
      icon: 'https://cos.jsdmirror.com/images/2021/09/10/cnb.png',
      href: 'https://cnb.cool/jsdmirror',
      alt: 'CNB',
      qr: null as string | null,
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="footer-brand-logo">
              <Image
                src="https://cos.jsdmirror.com/2023/08/29/background.png"
                alt="JSDMirror"
                width={70}
                height={70}
                style={{ width: '70px', height: 'auto' }}
                unoptimized
              />
            </div>
            <p>{t.footer.brand}</p>
            <div className="focus_us">
              <h3 className="focus-title">{t.footer.followUs}</h3>
              <ul className="focus_list">
                {/* QQ */}
                <li>
                  <a href={socialLinks[0].href} target="_blank" rel="noopener noreferrer" className="focus-link qq-btn">
                    <Image className="icon" src={socialLinks[0].icon} alt="QQ" width={24} height={24} unoptimized />
                  </a>
                </li>
                {/* 企业微信 */}
                <li>
                  <a className="focus-link wecom-btn" onClick={(e) => e.preventDefault()}>
                    <Image className="icon" src={socialLinks[1].icon} alt="企业微信" width={24} height={24} unoptimized />
                    <Image className="qr-code wecom-code" src={socialLinks[1].qr!} alt="企业微信二维码" width={120} height={120} unoptimized />
                  </a>
                </li>
                {/* Telegram */}
                <li>
                  <a className="focus-link tg-btn" onClick={(e) => e.preventDefault()}>
                    <Image className="icon" src={socialLinks[2].icon} alt="Telegram" width={24} height={24} unoptimized />
                    <Image className="qr-code tg-code" src={socialLinks[2].qr!} alt="TG二维码" width={120} height={120} unoptimized />
                  </a>
                </li>
                {/* B站 */}
                <li>
                  <a href={socialLinks[3].href} target="_blank" rel="noopener noreferrer" className="focus-link">
                    <Image className="icon" src={socialLinks[3].icon} alt="Bilibili" width={24} height={24} unoptimized />
                  </a>
                </li>
                {/* GitHub */}
                <li>
                  <a href={socialLinks[4].href} target="_blank" rel="noopener noreferrer" className="focus-link">
                    <Image className="icon" src={socialLinks[4].icon} alt="GitHub" width={24} height={24} unoptimized />
                  </a>
                </li>
                {/* CNB */}
                <li>
                  <a href={socialLinks[5].href} target="_blank" rel="noopener noreferrer" className="focus-link">
                    <Image className="icon" src={socialLinks[5].icon} alt="CNB" width={24} height={24} unoptimized />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {colData.map((col, idx) => (
            <div key={col.title} className={`footer-section footer-col${openCols.has(idx) ? ' open' : ''}`}>
              <h4 className="footer-toggle" onClick={() => toggleCol(idx)}>
                {col.title}
                <span className="footer-toggle-arrow">▼</span>
              </h4>
              <div className="footer-content-inner">
                <ul className="footer-links">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('http') || link.href.startsWith('mailto') ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                      ) : (
                        <Link href={link.href}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>&copy; 2023-{new Date().getFullYear()} zeyao All Rights Reserved. {t.footer.copyright}</p>
          <p>
            <a href="http://beian.miit.gov.cn/" className="flag_num" target="_blank" rel="noopener noreferrer">{t.footer.icp1}</a>
            {' | '}
            <a className="flag_num" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=21028102000208" target="_blank" rel="noopener noreferrer">{t.footer.icp2}</a>
            {' | '}
            <a className="flag_num" href="https://icp.gov.moe/?keyword=20223333" target="_blank" rel="noopener noreferrer">{t.footer.icp3}</a>
          </p>
          <p className="copyright">
            <a className="num" href="https://edgeone.ai?referer=jsdmirror.com" target="_blank" rel="noopener noreferrer">
              {t.footer.edgeone}
              <Image src="https://cos.jsdmirror.com/jsdmirror/static/img/serve/EdgeOne.png" alt="Edgeone" className="edgeone-logo" width={80} height={20} unoptimized />
              {t.footer.sponsored}
            </a>
          </p>
          {latestVer && (
            <p className="footer-version">
              <Link href="/version" className="version-btn">
                {t.footer.versionLabel}：{latestVer}
                <i className="bi bi-eye" style={{ marginLeft: 4 }} />
              </Link>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
