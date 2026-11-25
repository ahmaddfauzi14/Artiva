import AdminActivityQueue from '@/components/features/admin/AdminActivityQueue';
import AdminDashboardBento from '@/components/features/admin/AdminDashboardBento';
import { requirePageRole } from '@/lib/auth/page-guards';
import { getAdminPlatformStats } from '@/lib/repositories/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard Admin · ARTIVA',
};

export default async function AdminDashboardPage() {
  const [, stats] = await Promise.all([
    requirePageRole('admin', '/dashboard/admin'),
    getAdminPlatformStats(),
  ]);

  const activityRows =
    stats.recent_activities && stats.recent_activities.length > 0
      ? stats.recent_activities
      : stats.activity_queue;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Dashboard Admin ARTIVA</h1>

      {/* Overview & Analitik Platform */}
      <AdminDashboardBento stats={stats} />

      {/* Antrean & Riwayat Aktivitas */}
      <AdminActivityQueue rows={activityRows} />
    </div>
  );
}
