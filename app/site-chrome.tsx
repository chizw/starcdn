'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TopBanner from '@/components/TopBanner';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import TitleManager from '@/components/TitleManager';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage = pathname.startsWith('/admin') || pathname.startsWith('/waf');

  if (isStandalonePage) {
    return <>{children}</>;
  }

  return (
    <>
      <TitleManager />
      <Navbar />
      <TopBanner />
      {children}
      <Footer />
      <BackToTop />
    </>
  );
}
