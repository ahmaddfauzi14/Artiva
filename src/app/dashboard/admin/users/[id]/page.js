import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import AdminUserDetail from '@/components/features/admin/AdminUserDetail';
import { requirePageRole } from '@/lib/auth/page-guards';
import { findAdminUserDetail } from '@/lib/repositories/admin';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Detail Pengguna · Admin ARTIVA',
};

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;
  const userId = Number(id);
  const admin = await requirePageRole('admin', `/dashboard/admin/users/${id}`);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  const targetUser = await findAdminUserDetail(userId);
  if (!targetUser) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="KELOLA PENGGUNA"
        title={targetUser.display_name}
        subtitle={`Pengaturan status dan akun untuk @${targetUser.username}.`}
      />
      <AdminUserDetail
        initialUser={targetUser}
        currentAdminId={admin.user_id}
      />
    </div>
  );
}
