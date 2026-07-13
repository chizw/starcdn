'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import zh from './zh';
import en from './en';
import type { Translations } from './zh';

export type Language = 'zh' | 'en';

const dictionaries: Record<Language, Translations> = { zh, en };

const LanguageContext = createContext<{
  lang: Language;
  t: Translations;
  setLang: (l: Language) => void;
}>({ lang: 'zh', t: zh, setLang: () => {} });

export function LanguageProvider({ children, initialLang = 'zh' }: { children: ReactNode; initialLang?: Language }) {
  const [lang, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    // 从 cookie 同步真实语言（首次访问 cookie 由 middleware 写入）
    const timer = window.setTimeout(() => {
      const m = document.cookie.match(/(?:^|;\s*)lang=(en|zh)(?:;|$)/);
      if (m) {
        const cookieLang = m[1] as Language;
        if (cookieLang !== lang) setLangState(cookieLang);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.cookie = `lang=${l};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN';
    document.documentElement.setAttribute('data-lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  const { t } = useContext(LanguageContext);
  return t;
}

export function useLang() {
  const { lang, setLang } = useContext(LanguageContext);
  return { lang, setLang };
}

export default LanguageContext;
