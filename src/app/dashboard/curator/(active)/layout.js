import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function ActiveCuratorLayout({ children }) {
  const user = await requirePageRole('curator', '/dashboard/curator');
  if (user.status !== 'active') {
    redirect('/dashboard/curator/verification');
  }
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
