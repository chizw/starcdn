import Script from 'next/script';

export const metadata = {
  title: '访问被阻止',
  robots: { index: false, follow: false },
};

export default function WafPage() {
  return (
    <main className="waf-page">
      <div className="background-grid"></div>
          <div className="particles"></div>
          <div className="floating-text text-left-right" style={{ top: "15%" }}>来来来，给你倒杯咖啡，冷静一下</div>
          <div className="floating-text text-right-left" style={{ top: "35%" }}>要不要来块小饼干？边吃边想想</div>
          <div className="floating-text text-top-bottom" style={{ left: "25%" }}>我这里有把小板凳，坐下来聊聊人生</div>
          <div className="floating-text text-diagonal" style={{ top: "60%", left: "10%" }}>深呼吸，放轻松，黑客也是需要休息的</div>
          <div className="floating-text text-left-right" style={{ bottom: "20%" }}>这里有一杯茶，喝了静静心，再来挑战</div>
          <div className="waf-container">
              <div className="glitch-effect"></div>
              <div id="random-content"></div>
          </div>
          
      <Script src="/scripts/waf.js" strategy="afterInteractive" />
    </main>
  );
}
