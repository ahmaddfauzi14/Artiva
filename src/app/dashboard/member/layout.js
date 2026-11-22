import DashboardShell from '@/components/layout/DashboardShell';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function MemberDashboardLayout({ children }) {
  const user = await requirePageRole('member', '/dashboard/member');

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
