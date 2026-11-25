import { redirect } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import CuratorNavBar from '@/components/features/curator/CuratorNavBar';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function ActiveCuratorPagesLayout({ children }) {
  const user = await requirePageRole('curator', '/curator/challenges');
  if (user.status !== 'active') {
    redirect('/curator/verification');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-[90rem] flex-1 space-y-8 px-4 py-8 sm:px-6 md:px-8 lg:py-10">
        <CuratorNavBar />
        {children}
      </main>
      <Footer />
    </div>
  );
}
