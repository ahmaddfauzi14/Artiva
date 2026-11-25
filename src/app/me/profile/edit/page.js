import PageHeader from '@/components/layout/PageHeader';
import ProfileSettings from '@/components/features/member/ProfileSettings';
import Button from '@/components/ui/Button';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Profil · ARTIVA',
};

export default async function MemberProfileEditPage() {
  const user = await requirePageRole('member', '/me/profile/edit');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PENGATURAN AKUN"
        title="Edit Profil"
        subtitle="Perbarui tampilan profil kreator serta keamanan email dan kata sandimu."
        rightSlot={
          <Button variant="secondary" size="sm" href="/me/profile">
            Kembali ke profil
          </Button>
        }
      />
      <ProfileSettings user={user} />
    </div>
  );
}
