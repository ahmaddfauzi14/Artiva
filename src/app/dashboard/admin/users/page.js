import PageHeader from '@/components/layout/PageHeader';
import AdminUsers from '@/components/features/admin/AdminUsers';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listAdminUsers } from '@/lib/repositories/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Manajemen Pengguna · Admin ARTIVA',
};

export default async function AdminUsersPage() {
  const [, result] = await Promise.all([
    requirePageRole('admin', '/dashboard/admin/users'),
    listAdminUsers({ page: 1, limit: 15 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="MANAJEMEN AKUN"
        title="Daftar pengguna"
        subtitle="Kelola status akun Member dan Kurator yang terdaftar di ARTIVA."
      />
      <AdminUsers
        initialUsers={result.items}
        initialCounts={result.counts}
        initialMeta={result.meta}
      />
    </div>
  );
}
