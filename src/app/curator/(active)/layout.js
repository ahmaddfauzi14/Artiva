import { redirect } from 'next/navigation';
import AccountNavPills from '@/components/layout/AccountNavPills';
import PublicShell from '@/components/layout/PublicShell';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function ActiveCuratorPagesLayout({ children }) {
  const user = await requirePageRole('curator', '/curator/challenges');
  if (user.status !== 'active') {
    redirect('/curator/verification');
  }

  return (
    <PublicShell user={user} mainClassName="space-y-6 py-5 sm:py-6">
      <AccountNavPills role="curator" />
      {children}
    </PublicShell>
  );
}
