import type { Metadata } from 'next';
import '../../styles/admin.css';

export const metadata: Metadata = {
  title: 'StarCDN Admin - 登录',
  description: 'StarCDN 管理后台登录',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
