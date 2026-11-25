import PageHeader from '@/components/layout/PageHeader';
import ProfileSettings from '@/components/features/member/ProfileSettings';
import Button from '@/components/ui/Button';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Profil · Kurator ARTIVA',
};

export default async function CuratorProfileEditPage() {
  const user = await requirePageRole('curator', '/curator/profile/edit');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PENGATURAN AKUN"
        title="Edit Profil"
        subtitle="Perbarui identitas kurator, bio organisasi, serta keamanan email dan kata sandimu."
        rightSlot={
          <Button variant="secondary" size="sm" href="/curator/profile">
            ← Kembali ke profil
          </Button>
        }
      />
      <ProfileSettings user={user} />
    </div>
  );
}
