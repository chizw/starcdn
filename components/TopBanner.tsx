'use client';

import { useState } from 'react';
import { useT, useLang } from '@/i18n';

export default function TopBanner() {
  const t = useT();
  const { lang } = useLang();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const zh = '提示：还在担心第三方公共CDN的安全性？试试使用SRI来增强安全性吧！';
  const en = 'Tip: Worried about third-party CDN security? Try SRI to enhance safety!';

  return (
    <div className="top-banner">
      <div className="top-banner-content">
        <i className="bi bi-layers-fill top-banner-icon" />
        <a href="https://srihash.jsdmirror.com" target="_blank" rel="noreferrer">
          <span className="top-banner-text">
            {lang === 'en' ? en : zh}
          </span>
        </a>
        <button
          className="top-banner-close"
          onClick={() => setDismissed(true)}
          aria-label="关闭"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>
    </div>
  );
}
