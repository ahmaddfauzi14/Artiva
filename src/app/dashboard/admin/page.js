import AdminActivityQueue from '@/components/features/admin/AdminActivityQueue';
import AdminDashboardBento from '@/components/features/admin/AdminDashboardBento';
import Button from '@/components/ui/Button';
import GlassPanel from '@/components/ui/GlassPanel';
import StatusBadge from '@/components/ui/StatusBadge';
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

  const pendingTotal =
    (stats.pending_verifications || 0) + (stats.pending_reports || 0);

  return (
    <div className="space-y-10">
      <GlassPanel
        eyebrow="RUANG ADMIN"
        title={
          pendingTotal > 0
            ? 'Ada yang perlu kamu tinjau.'
            : 'Semua antrean dalam kondisi terkendali.'
        }
        subtitle={
          <>
            Saat ini terdapat{' '}
            <strong className="tabular-nums text-ink">
              {stats.pending_verifications} pengajuan Kurator
            </strong>{' '}
            dan{' '}
            <strong className="tabular-nums text-ink">
              {stats.pending_reports} laporan karya
            </strong>{' '}
            yang menunggu keputusan.
          </>
        }
        actions={
          <>
            <Button variant="primary" href="/dashboard/admin/reports">
              Buka antrean moderasi →
            </Button>
            <Button variant="secondary" href="/dashboard/admin/curators">
              Verifikasi kurator →
            </Button>
          </>
        }
      />

      {/* Ringkasan Ekosistem & Pintasan MagicBento */}
      <section aria-label="Ringkasan platform admin">
        <AdminDashboardBento stats={stats} />
      </section>

      {/* Antrean Aktivitas */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-ink">Antrean aktivitas</h2>
          {pendingTotal > 0 ? (
            <StatusBadge label="Perlu ditinjau" tone="warning" />
          ) : null}
        </div>
        <AdminActivityQueue rows={stats.activity_queue} />
      </section>
    </div>
  );
}
