import AuthShell from '@/components/layout/AuthShell';
import LoginForm from '@/components/features/auth/LoginForm';
import { getHomeForUser } from '@/lib/auth/page-guards';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Masuk · ARTIVA',
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user && user.status !== 'suspended') {
    redirect(getHomeForUser(user));
  }

  return (
    <AuthShell
      eyebrow="RUANG UNTUK KEMBALI BERKARYA"
      title="Senang melihatmu berkarya lagi."
      subtitle="Masuk untuk mengelola portofolio, berinteraksi dengan komunitas, atau mengikuti tantangan terbaru."
    >
      <LoginForm
        nextParam={params?.next || ''}
        errorParam={params?.error || ''}
      />
    </AuthShell>
  );
}
