import PageHeader from '@/components/layout/PageHeader';
import ProfileSettings from '@/components/features/member/ProfileSettings';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profil · Kurator ARTIVA',
};

export default async function CuratorProfilePage() {
  const user = await requirePageRole('curator', '/curator/profile');

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PENGATURAN AKUN"
        title="Profil"
        subtitle="Perbarui identitas kurator, bio organisasi, serta keamanan email dan kata sandimu."
      />
      <ProfileSettings user={user} />
    </div>
  );
}
