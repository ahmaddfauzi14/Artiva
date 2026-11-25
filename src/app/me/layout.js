import AccountNavPills from '@/components/layout/AccountNavPills';
import PublicShell from '@/components/layout/PublicShell';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function MemberPagesLayout({ children }) {
  const user = await requirePageRole('member', '/me/artworks');

  return (
    <PublicShell user={user} mainClassName="space-y-6 py-5 sm:py-6">
      <AccountNavPills role="member" />
      {children}
    </PublicShell>
  );
}
