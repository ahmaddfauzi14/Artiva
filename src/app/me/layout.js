import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import MemberNavBar from '@/components/features/member/MemberNavBar';
import { requirePageRole } from '@/lib/auth/page-guards';

export const dynamic = 'force-dynamic';

export default async function MemberPagesLayout({ children }) {
  const user = await requirePageRole('member', '/me/artworks');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-5 py-8 md:px-8 lg:py-10">
        <MemberNavBar />
        {children}
      </main>
      <Footer />
    </div>
  );
}
