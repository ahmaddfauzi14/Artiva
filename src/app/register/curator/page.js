import AuthShell from '@/components/layout/AuthShell';
import RegisterCuratorForm from '@/components/features/auth/RegisterCuratorForm';
import { getHomeForUser } from '@/lib/auth/page-guards';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ajukan Akun Kurator · ARTIVA',
};

export default async function RegisterCuratorPage() {
  const user = await getCurrentUser();
  if (user && user.status !== 'suspended') {
    redirect(getHomeForUser(user));
  }

  return (
    <AuthShell
      eyebrow="AWAL CERITA KREATIFMU"
      title="Satu akun. Banyak kemungkinan."
      subtitle="Buka ruang kompetisi kreatif untuk komunitas kampus dan kreator muda dengan kurasi yang terstruktur."
    >
      <RegisterCuratorForm />
    </AuthShell>
  );
}
