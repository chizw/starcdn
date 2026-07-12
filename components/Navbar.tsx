'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useT, useLang } from '@/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useT();
  const { lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }

    const mq = window.matchMedia('(max-width: 930px)');
    setIsMobile(mq.matches);
    if (mq.matches) setScrolled(true);
    const onMq = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches) setScrolled(true);
    };
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  useEffect(() => {
    const onScroll = () => {
      if (isMobile) {
        setScrolled(true);
      } else {
        setScrolled(window.scrollY > 50);
      }
      const sy = window.scrollY + 120;
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach((s) => {
        const el = s as HTMLElement;
        if (sy >= el.offsetTop && sy < el.offsetTop + el.offsetHeight) {
          current = el.getAttribute('id') || '';
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '/#home', label: t.nav.home },
    { href: '/about', label: t.nav.about },
    { href: '/sponsor', label: t.nav.sponsor },
    { href: '/notices', label: t.nav.notices },
  ];

  const isActive = (href: string) => {
    const id = href.split('#')[1];
    return activeSection === id;
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container nav-container">
          <div className="nav-brand">
            <a href="/">
              <img src="https://cos.jsdmirror.com/2023/08/29/logo.png" alt="JSDMirror" style={{ height: '30px' }} />
            </a>
          </div>
          <ul className={`nav-links${menuOpen ? ' active' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isActive(link.href) ? 'nav-active' : ''}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/docs" className="nav-doc-link" onClick={closeMenu}>{t.nav.docs}</Link>
            </li>
            <li>
              {lang === 'zh' ? (
                <a href="https://cnb.cool/jsdmirror/home" target="_blank" rel="noopener noreferrer" className="nav-github">
                  <img className="icon" src="https://cos.jsdmirror.com/images/2021/09/10/cnb.png" alt="CNB" width="18" height="18" />
                </a>
              ) : (
                <a href="https://github.com/jsdmirror/www.jsdmirror.com" target="_blank" rel="noopener noreferrer" className="nav-github">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              )}
            </li>
            <li>
              <LanguageSwitcher />
            </li>
            <li>
              <button className="theme-toggle" onClick={toggleTheme} aria-label="切换主题" title="切换深色/浅色主题">
                <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              </button>
            </li>
          </ul>
          <button
            className={`mobile-menu-btn${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="菜单"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
      {menuOpen && <div className="nav-overlay active" onClick={closeMenu} />}
    </>
  );
}
