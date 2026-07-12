'use client';

import { useLang } from '@/i18n';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>
        {lang === 'en' ? 'Something went wrong' : '出错了'}
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 480 }}>
        {lang === 'en'
          ? 'An unexpected error occurred. Please try again.'
          : '发生了一个意外错误，请重试。'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '10px 24px',
          background: 'var(--primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        {lang === 'en' ? 'Try again' : '重试'}
      </button>
    </div>
  );
}
