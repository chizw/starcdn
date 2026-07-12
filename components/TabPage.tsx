'use client';

import { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

export function TabPage({ title, subtitle, tabs }: { title: string; subtitle: string; tabs: Tab[] }) {
  const [active, setActive] = useState(0);

  return (
    <>
      <section className="page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1>{title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{subtitle}</p>
        </div>
      </section>

      <div className="container">
        <div className="tab-container">
          <div className="tab-buttons">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                className={`tablinks${active === i ? ' active' : ''}`}
                onClick={() => setActive(i)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {tabs.map((tab, i) => (
            <div key={tab.label} className={`tabcontent${active === i ? ' active' : ''}`}>
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
