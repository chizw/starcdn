import type { Metadata } from 'next';
import { AdminShell } from './admin-shell';

export const metadata: Metadata = {
  title: '管理后台',
  description: 'StarCDN 管理后台',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
