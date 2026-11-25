import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import ChallengeSubmitForm from '@/components/features/challenges/ChallengeSubmitForm';
import { requirePageRole } from '@/lib/auth/page-guards';
import { todayInTz } from '@/lib/server/challenge-status';
import { getEligibleArtworksForMember } from '@/lib/services/submissions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ikuti Tantangan · ARTIVA',
};

export default async function SubmitChallengePage({ params }) {
  const { id } = await params;
  const challengeId = Number(id);
  const user = await requirePageRole('member', `/challenges/${id}/submit`);

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  let data;
  try {
    data = await getEligibleArtworksForMember(user.user_id, challengeId);
  } catch {
    notFound();
  }

  const today = todayInTz();
  const isOpenWindow =
    data.challenge.status === 'open' &&
    data.challenge.start_date <= today &&
    today <= data.challenge.end_date;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-10 sm:px-6 md:px-8">
        <ChallengeSubmitForm
          challenge={data.challenge}
          artworks={data.artworks}
          isOpenWindow={isOpenWindow}
        />
      </main>
      <Footer />
    </div>
  );
}
