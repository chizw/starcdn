import type { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: '关于 - StarCDN',
  description: '了解 StarCDN 免费开源前端公共资源加速服务',
};

export default function AboutPage() {
  return <AboutContent />;
}
