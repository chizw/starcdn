import Script from 'next/script';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="orb-container">
              
              <div className="orb orb-large orb-light" style={{ top: "10%", left: "10%", animation: "orb-move-1 25s infinite ease-in-out" }}></div>
              <div className="orb orb-large orb-dark" style={{ top: "60%", left: "70%", animation: "orb-move-2 30s infinite ease-in-out" }}></div>
              
              
              <div className="orb orb-medium orb-light" style={{ top: "30%", left: "50%", animation: "orb-move-3 20s infinite ease-in-out" }}></div>
              <div className="orb orb-medium orb-dark" style={{ top: "70%", left: "20%", animation: "orb-move-4 25s infinite ease-in-out" }}></div>
              
              
              <div className="orb orb-small orb-light" style={{ top: "20%", left: "80%", animation: "orb-move-5 15s infinite ease-in-out" }}></div>
              <div className="orb orb-small orb-dark" style={{ top: "80%", left: "40%", animation: "orb-move-6 18s infinite ease-in-out" }}></div>
          </div>
          
          <div className="frosted-overlay"></div>
          
          <div className="content-container">
              <div className="corner-top-right"></div>
              <div className="corner-bottom-left"></div>
              <h1><span>404</span></h1>
              <div className="poem" id="poem">正在寻找诗意的远方...</div>
              <div className="message">
                  此路不通，即将引您重返人间<br />
                  <span className="countdown" id="countdown">10</span>秒后自动跳转
              </div>
              <div className="admin-message">该页面被管理员刻意的禁止访问</div>
          </div>
      <Script src="/scripts/not-found.js" strategy="afterInteractive" />
    </main>
  );
}
