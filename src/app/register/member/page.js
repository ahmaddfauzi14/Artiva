import AuthShell from '@/components/layout/AuthShell';
import RegisterMemberForm from '@/components/features/auth/RegisterMemberForm';
import { getHomeForUser } from '@/lib/auth/page-guards';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Daftar Member · ARTIVA',
};

export default async function RegisterMemberPage() {
  const user = await getCurrentUser();
  if (user && user.status !== 'suspended') {
    redirect(getHomeForUser(user));
  }

  return (
    <AuthShell
      eyebrow="AWAL CERITA KREATIFMU"
      title="Satu akun. Banyak kemungkinan."
      subtitle="Bangun portofolio digitalmu, temukan inspirasi baru, dan kirim karya ke tantangan pilihanmu."
    >
      <RegisterMemberForm />
    </AuthShell>
  );
}
