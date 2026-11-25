import PageHeader from '@/components/layout/PageHeader';
import ProfileOverview from '@/components/features/member/ProfileOverview';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profil · Kurator ARTIVA',
};

export default async function CuratorProfilePage() {
  const user = await requirePageRole('curator', '/curator/profile');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PROFIL KURATOR"
        title="Profil"
        subtitle="Tinjau kartu profil dan informasi data dirimu sebagai kurator ARTIVA."
      />
      <ProfileOverview user={user} editHref="/curator/profile/edit" />
    </div>
  );
}
