'use client';

import { useEffect, useState } from 'react';
import { useT, useLang } from '@/i18n';

type NoticeItem = {
  id: number;
  date: string;
  tag: string;
  tag_en: string;
  title: string;
  title_en: string;
  desc: string;
  desc_en: string;
};

const tagTypeClass: Record<string, string> = {
  '功能更新': 'update',
  '公告': 'announcement',
  '维护通知': 'maintenance',
  'Update': 'update',
  'Announcement': 'announcement',
  'Maintenance': 'maintenance',
};

export default function NoticesPage() {
  const t = useT();
  const { lang } = useLang();
  const isEn = lang === 'en';
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = 'https://cdn.jsdmirror.com/cnb/jsdmirror/json@main/notices.json';
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data: NoticeItem[]) => {
        setNotices(data.reverse());
        setLoading(false);
      })
      .catch(() => {
        // 本地开发时回退到 public 目录
        fetch('/notices.json')
          .then((res) => res.ok ? res.json() : Promise.reject())
          .then((data: NoticeItem[]) => {
            setNotices(data.reverse());
            setLoading(false);
          })
          .catch(() => {
            setNotices([]);
            setLoading(false);
          });
      });
  }, []);

  return (
    <>
      <section className="page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1>{t.noticesPage.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.noticesPage.subtitle}</p>
        </div>
      </section>

      <div className="notices-list" style={{ padding: '48px 24px 80px' }}>
        {loading ? (
          <div className="version-loading">{isEn ? 'Loading...' : '加载中...'}</div>
        ) : notices.length === 0 ? (
          <div className="version-loading">{isEn ? 'No announcements yet' : '暂无公告'}</div>
        ) : (
          notices.map((item) => {
            const tag = isEn ? item.tag_en : item.tag;
            const tagClass = tagTypeClass[tag] || 'update';

            return (
              <div key={item.id} className="notice-card">
                <div className="notice-meta">
                  <span className={`notice-tag ${tagClass}`}>{tag}</span>
                  <span>{item.date}</span>
                </div>
                <h3>{isEn ? item.title_en : item.title}</h3>
                <p>{isEn ? item.desc_en : item.desc}</p>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
