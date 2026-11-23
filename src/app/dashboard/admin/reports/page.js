import PageHeader from '@/components/layout/PageHeader';
import AdminReports from '@/components/features/admin/AdminReports';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listAdminReports } from '@/lib/repositories/reports';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Moderasi Laporan · Admin ARTIVA',
};

export default async function AdminReportsPage() {
  const [, result] = await Promise.all([
    requirePageRole('admin', '/dashboard/admin/reports'),
    listAdminReports({ status: 'pending', page: 1, limit: 12 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="MODERASI KONTEN"
        title="Antrean moderasi laporan"
        subtitle="Tinjau laporan karya dari komunitas dan ambil keputusan dengan catatan akuntabilitas."
      />
      <AdminReports
        initialReports={result.items}
        initialCounts={result.counts}
        initialMeta={result.meta}
      />
    </div>
  );
}
