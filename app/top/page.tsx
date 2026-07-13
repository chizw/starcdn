'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/i18n';

const SPONSOR_JSON_URL = 'https://cdn.jsdmirror.com/cnb/jsdmirror/json@main/sponsors.json';

type Sponsor = {
  name: string;
  site: string | null;
  siteLabel: string | null;
  amount: string;
  channel: string;
  date: string;
  note: string;
};

export default function TopPage() {
  const t = useT();
  const [sponsorList, setSponsorList] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);
  const [sponsorsError, setSponsorsError] = useState(false);

  // 从远程获取赞助列表
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch(SPONSOR_JSON_URL)
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then((data: Sponsor[]) => {
          setSponsorList(data);
          setSponsorsLoading(false);
        })
        .catch(() => {
          setSponsorList([]);
          setSponsorsError(true);
          setSponsorsLoading(false);
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {/* 页面标题 */}
      <section className="page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1>{t.top.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.top.subtitle}</p>
        </div>
      </section>

      {/* 感恩文案 */}
      <section style={{ background: 'var(--bg)', padding: '32px 0' }}>
        <div className="container">
          <div className="gratitude-box">
            <p>
              🎊🎉🎉 <strong>{t.top.gratitude1}</strong> 🌟✨✨
            </p>
            <p>
              ✨✨ <strong>{t.top.gratitude2}</strong> ✨✨
            </p>
            <p>
              💼💰 <strong>{t.top.gratitude3}</strong> 🤗🙏
            </p>
            <p>
              💌📝 <strong>{t.top.gratitude4}</strong> 💌❤️‍🔥
            </p>
            <p>
              ⏳📝 <strong>{t.top.gratitude5}</strong> 🙏📝
            </p>
            <p>
              🌟🌟 <strong>{t.top.gratitude6}</strong> 🌟🌟
            </p>
            <p>
              📊🔍 <strong>{t.top.gratitude7}</strong> 🔍✅
            </p>
            <p>
              🔧🚀 <strong>{t.top.gratitude8}</strong> 🚀🛠️
            </p>
            <p>
              🤗🎉 <strong>{t.top.gratitude9}</strong> 🤗🎉
            </p>
            <p>
              💌💌 <strong>{t.top.gratitude10}</strong> 💌💌<br />
              💰💸 {t.top.gratitude10} 💪💖
            </p>
            <p>
              🌈💖 {t.top.gratitude11} 🌟💖
            </p>
            <p>
              💖💖💖 <strong>{t.top.gratitude12}</strong> 💖💖💖
            </p>
            <p>
              🌟🚀 <strong>{t.top.gratitude13}</strong> 🚀🌟
            </p>
          </div>
        </div>
      </section>

      {/* 赞助列表 */}
      <section className="section">
        <div className="container">
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ borderTopLeftRadius: 'var(--radius)', paddingLeft: 20 }}><i className="bi bi-person-badge" /> {t.top.tableSponsor}</th>
                  <th><i className="bi bi-link-45deg" /> {t.top.tableSite}</th>
                  <th><i className="bi bi-cash-stack" /> {t.top.tableAmount}</th>
                  <th><i className="bi bi-credit-card" /> {t.top.tableChannel}</th>
                  <th><i className="bi bi-calendar3" /> {t.top.tableDate}</th>
                  <th style={{ borderTopRightRadius: 'var(--radius)' }}><i className="bi bi-chat-dots" /> {t.top.tableNote}</th>
                </tr>
              </thead>
              <tbody>
                {sponsorsLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      加载中...
                    </td>
                  </tr>
                ) : sponsorsError || sponsorList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      赞助列表加载失败，请检查网络后刷新重试。
                      <br />
                      <a href={SPONSOR_JSON_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', fontSize: 13 }}>
                        {SPONSOR_JSON_URL}
                      </a>
                    </td>
                  </tr>
                ) : (
                  sponsorList.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>
                        {s.site ? (
                          <a href={s.site} target="_blank" rel="noopener noreferrer">{s.siteLabel}</a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{s.amount}</td>
                      <td>{s.channel}</td>
                      <td>{s.date}</td>
                      <td>{s.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 统计信息 */}
          <div className="leaderboard-stats">
            {(() => {
              const dates = sponsorList.map((s) => s.date).sort();
              const amounts = sponsorList.map((s) => parseFloat(s.amount.replace(/[^\d.]/g, '')) || 0);
              const channels = [...new Set(sponsorList.map((s) => s.channel))];
              const range = dates.length > 0 ? `${dates[0]} 至 ${dates[dates.length - 1]}` : '-';
              const amountRange = amounts.length > 0 ? `¥${Math.min(...amounts).toFixed(2)} - ¥${Math.max(...amounts).toFixed(2)}` : '-';
              return [
                { label: t.top.statsRange, value: range },
                { label: t.top.statsChannels, value: channels.join('、') || '-' },
                { label: t.top.statsAmountRange, value: amountRange },
                { label: t.top.statsCount, value: `${sponsorList.length} ${t.top.statsCountSuffix}` },
              ];
            })().map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-label">{stat.label}</div>
                <div className="stat-card-value">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* 说明 */}
          <div className="leaderboard-notice">
            <h3>{t.top.noticeTitle}</h3>
            <ul>
              <li>{t.top.notice1}</li>
              <li>{t.top.notice2}</li>
              <li>{t.top.notice3}</li>
              <li>{t.top.notice4}</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
