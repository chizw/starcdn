'use client';

import { useState } from 'react';

interface CopyCodeBlockProps {
  children: React.ReactNode;
}

export default function CopyCodeBlock({ children }: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Extract text content from child elements
    const container = document.createElement('div');
    container.innerHTML = '';

    // We need to get the code content; get it from the DOM
    const codeEl = document.querySelector('.hero-code .code-body');
    if (!codeEl) return;

    const text = Array.from(codeEl.querySelectorAll('.code-line'))
      .map((line) => line.textContent || '')
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <button
        className="code-copy-btn"
        onClick={handleCopy}
        title={copied ? '已复制' : '复制代码'}
      >
        {copied ? (
          <>
            <i className="bi bi-check-lg" />
            已复制
          </>
        ) : (
          <>
            <i className="bi bi-clipboard" />
            复制
          </>
        )}
      </button>
      {children}
    </div>
  );
}
