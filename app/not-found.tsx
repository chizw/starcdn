'use client';

import Link from 'next/link';
import { useLang } from '@/i18n';

export default function NotFound() {
  const { lang } = useLang();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '6rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.5rem',
        lineHeight: 1,
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: '0.75rem',
      }}>
        {lang === 'en' ? 'Page Not Found' : '页面未找到'}
      </h2>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
        maxWidth: 400,
      }}>
        {lang === 'en'
          ? 'The page you are looking for does not exist or has been moved.'
          : '您访问的页面不存在或已被移除，请检查网址是否正确。'}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '10px 24px',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          {lang === 'en' ? 'Back to Home' : '返回首页'}
        </Link>
        <Link
          href="/docs"
          style={{
            padding: '10px 24px',
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          {lang === 'en' ? 'View Docs' : '查看文档'}
        </Link>
      </div>
    </div>
  );
}
