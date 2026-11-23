import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import AdminReportDetail from '@/components/features/admin/AdminReportDetail';
import { requirePageRole } from '@/lib/auth/page-guards';
import { findAdminReportDetail } from '@/lib/repositories/reports';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tinjau Laporan · Admin ARTIVA',
};

export default async function AdminReportDetailPage({ params }) {
  const { id } = await params;
  const reportId = Number(id);
  await requirePageRole('admin', `/dashboard/admin/reports/${id}`);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    notFound();
  }

  const report = await findAdminReportDetail(reportId);
  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="TINJAUAN LAPORAN"
        title={`Laporan #${report.report_id}: ${report.artwork_title}`}
        subtitle="Periksa karya terlapor, riwayat laporan, dan tetapkan keputusan moderasi."
      />
      <AdminReportDetail initialReport={report} />
    </div>
  );
}
