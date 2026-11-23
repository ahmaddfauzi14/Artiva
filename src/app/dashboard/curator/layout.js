import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function CuratorDashboardLayout({ children }) {
  await requirePageRole('curator', '/dashboard/curator');
  return children;
}
