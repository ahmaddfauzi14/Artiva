import PageHeader from '@/components/layout/PageHeader';
import ProfileSettings from '@/components/features/member/ProfileSettings';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profil · ARTIVA',
};

export default async function MemberProfilePage() {
  const user = await requirePageRole('member', '/me/profile');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PENGATURAN AKUN"
        title="Profil"
        subtitle="Perbarui tampilan profil kreator serta keamanan email dan kata sandimu."
      />
      <ProfileSettings user={user} />
    </div>
  );
}
