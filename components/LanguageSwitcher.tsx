'use client';

import { useLang } from '@/i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  const toggle = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      className="lang-switch"
      onClick={toggle}
      aria-label="Switch Language"
      title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <span className={`lang-option${lang === 'zh' ? ' active' : ''}`}>中</span>
      <span className="lang-sep">/</span>
      <span className={`lang-option${lang === 'en' ? ' active' : ''}`}>EN</span>
    </button>
  );
}
