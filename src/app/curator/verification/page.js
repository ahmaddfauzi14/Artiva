import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import CuratorVerification from '@/components/features/curator/CuratorVerification';
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
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 md:px-8 lg:py-14">
        <CuratorVerification verification={verification} />
      </main>
      <Footer />
    </div>
  );
}
