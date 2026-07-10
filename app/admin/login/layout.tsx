import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StarCDN Admin - 登录',
  description: 'StarCDN 管理后台登录',
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
