'use client';

import { useEffect, useState } from 'react';
import { useT, useLang } from '@/i18n';

type Entry = {
  id: number;
  version: string;
  date: string;
  author: string;
  desc: string;
  desc_en?: string;
};

const URL = 'https://cdn.jsdmirror.com/cnb/jsdmirror/json@main/version.json';

function isLatest(v: Entry, all: Entry[]) {
  return all.length > 0 && v.id === all[0].id;
}

export default function VersionPage() {
  const t = useT();
  const { lang } = useLang();
  const en = lang === 'en';

  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(URL)
      .then((r) => (r.ok ? r.json() : fetch('/version.json').then((j) => j.json())))
      .then((d: Entry[]) => setData(d.sort((a, b) => b.id - a.id)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const years = (() => {
    const m: Record<string, Entry[]> = {};
    data.forEach((v) => {
      const y = v.date.slice(0, 4);
      (m[y] = m[y] || []).push(v);
    });
    return Object.entries(m).sort(([a], [b]) => +b - +a);
  })();

  const total = data.length;
  const latestVer = data[0]?.version ?? '';

  return (
    <>
      {/* Hero */}
      <section className="ch-hero">
        <div className="container">
          <p className="ch-kicker">{en ? 'CHANGELOG' : '更新日志'}</p>
          <h1>{t.footer.versionHistory}</h1>
          <p className="ch-sub">
            {en
              ? 'Tracking every improvement, fix, and release.'
              : '每一次改进、修复与发布，都在这里留下足迹。'}
          </p>
          <div className="ch-stat-row">
            <div className="ch-stat">
              <span className="ch-stat-big">{latestVer || '—'}</span>
              <span>{en ? 'Current' : '当前版本'}</span>
            </div>
            <div className="ch-stat">
              <span className="ch-stat-big">{total}</span>
              <span>{en ? 'Releases' : '次发布'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="ch-main">
        <div className="container">
          {loading ? (
            <div className="ch-skel">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="ch-skel-row">
                  <div className="ch-skel-dot" />
                  <div className="ch-skel-lines">
                    <span className="ch-skel-l1" />
                    <span className="ch-skel-l2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <p className="ch-empty">{en ? 'No records yet.' : '暂无版本记录。'}</p>
          ) : (
            <div className="ch-timeline">
              {years.map(([year, items]) => (
                <div key={year} className="ch-year-block">
                  <div className="ch-year-anchor">
                    <span className="ch-year-tag">{year}</span>
                    <span className="ch-year-count">
                      {items.length} {en ? 'releases' : '个版本'}
                    </span>
                  </div>
                  <div className="ch-entries">
                    {items.map((v) => {
                      const latest = isLatest(v, data);
                      return (
                        <div key={v.id} className={`ch-entry${latest ? ' ch-entry-latest' : ''}`}>
                          <div className="ch-dot-line">
                            <span className={`ch-dot${latest ? ' ch-dot-accent' : ''}`} />
                          </div>
                          <div className="ch-body">
                            <div className="ch-meta">
                              <span className={`ch-ver${latest ? ' ch-ver-accent' : ''}`}>
                                {v.version}
                              </span>
                              {latest && <span className="ch-latest-tag">{en ? 'NOW' : '当前'}</span>}
                              <span className="ch-date">{v.date}</span>
                            </div>
                            <p className={`ch-desc${latest ? ' ch-desc-accent' : ''}`}>
                              {en && v.desc_en ? v.desc_en : v.desc}
                            </p>
                            <span className="ch-author">{v.author}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
