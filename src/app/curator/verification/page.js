import CuratorVerification from '@/components/features/curator/CuratorVerification';
import PublicShell from '@/components/layout/PublicShell';
import { requirePageRole } from '@/lib/auth/page-guards';
import { findLatestVerificationByUserId } from '@/lib/repositories/verifications';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Status Verifikasi Kurator · ARTIVA',
};

export default async function CuratorVerificationPage() {
  const user = await requirePageRole('curator', '/curator/verification');
  const verification = await findLatestVerificationByUserId(user.user_id);

  return (
    <PublicShell user={user} mainClassName="flex items-center py-6 sm:py-8">
      <CuratorVerification verification={verification} />
    </PublicShell>
  );
}
