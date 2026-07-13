'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function SponsorLogo({ src, darkSrc, alt }: { src: string; darkSrc?: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className="logo-fallback" style={{ display: 'flex' }}>{alt}</span>;
  }

  const hasDark = !!darkSrc;

  return (
    <>
      <Image
        className={hasDark ? 'sponsor-logo-light' : ''}
        src={src}
        alt={alt}
        width={160}
        height={48}
        unoptimized
        onError={() => setError(true)}
      />
      {hasDark && darkSrc && (
        <Image
          className="sponsor-logo-dark"
          src={darkSrc}
          alt={alt}
          width={160}
          height={48}
          unoptimized
          onError={(e) => {
            // dark logo 加载失败时回退到 light logo（隐藏自身，保留 light img 展示）
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </>
  );
}
