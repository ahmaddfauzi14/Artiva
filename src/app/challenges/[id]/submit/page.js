import { notFound } from 'next/navigation';
import ChallengeSubmitForm from '@/components/features/challenges/ChallengeSubmitForm';
import PublicShell from '@/components/layout/PublicShell';
import { requirePageRole } from '@/lib/auth/page-guards';
import { todayInTz } from '@/lib/server/challenge-status';
import { getEligibleArtworksForMember } from '@/lib/services/submissions';

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
    <PublicShell user={user} mainClassName="py-6 sm:py-8">
      <ChallengeSubmitForm
        challenge={data.challenge}
        artworks={data.artworks}
        isOpenWindow={isOpenWindow}
      />
    </PublicShell>
  );
}
