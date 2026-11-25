import PageHeader from '@/components/layout/PageHeader';
import ProfileOverview from '@/components/features/member/ProfileOverview';
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
        eyebrow="PROFIL AKUN"
        title="Profil"
        subtitle="Tinjau kartu profil dan ringkasan data dirimu di ARTIVA."
      />
      <ProfileOverview user={user} editHref="/me/profile/edit" />
    </div>
  );
}
