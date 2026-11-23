import CuratorDashboard from '@/components/features/curator/CuratorDashboard';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listCuratorChallenges } from '@/lib/repositories/curator-challenges';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard Kurator · ARTIVA',
};

export default async function CuratorDashboardPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requirePageRole('curator', '/dashboard/curator');
  const result = await listCuratorChallenges(user.user_id, {
    page: 1,
    limit: 50,
  });

  const view = sp?.view || 'dashboard';

  return (
    <CuratorDashboard
      key={view}
      user={user}
      initialView={view}
      initialChallenges={result.items}
    />
  );
}
