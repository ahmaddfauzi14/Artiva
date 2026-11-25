import PageHeader from '@/components/layout/PageHeader';
import AdminCurators from '@/components/features/admin/AdminCurators';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listAdminVerifications } from '@/lib/repositories/verifications';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Verifikasi Kurator · Admin ARTIVA',
};

export default async function AdminCuratorsPage() {
  const [, result] = await Promise.all([
    requirePageRole('admin', '/dashboard/admin/curators'),
    listAdminVerifications({ status: 'pending', page: 1, limit: 12 }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="VERIFIKASI PENYELENGGARA"
        title="Verifikasi kurator"
        subtitle="Tinjau pengajuan akun Kurator sebelum mereka dapat menyelenggarakan tantangan di ARTIVA."
      />
      <AdminCurators
        initialItems={result.items}
        initialCounts={result.counts}
        initialMeta={result.meta}
      />
    </div>
  );
}
