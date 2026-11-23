import DashboardShell from '@/components/layout/DashboardShell';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({ children }) {
  const user = await requirePageRole('admin', '/dashboard/admin');

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
