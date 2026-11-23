import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import AdminCuratorDetail from '@/components/features/admin/AdminCuratorDetail';
import { requirePageRole } from '@/lib/auth/page-guards';
import { findAdminVerificationById } from '@/lib/repositories/verifications';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Detail Pengajuan Kurator · Admin ARTIVA',
};

export default async function AdminCuratorDetailPage({ params }) {
  const { id } = await params;
  const verificationId = Number(id);
  await requirePageRole('admin', `/dashboard/admin/curators/${id}`);

  if (!Number.isInteger(verificationId) || verificationId <= 0) {
    notFound();
  }

  const verification = await findAdminVerificationById(verificationId);
  if (!verification) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PENINJAUAN KURATOR"
        title={verification.display_name || verification.username}
        subtitle="Periksa kelayakan profil dan putuskan persetujuan pengajuan Kurator."
      />
      <AdminCuratorDetail initialVerification={verification} />
    </div>
  );
}
