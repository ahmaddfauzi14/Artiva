import { notFound } from 'next/navigation';
import ChallengeSubmitForm from '@/components/features/challenges/ChallengeSubmitForm';
import PublicShell from '@/components/layout/PublicShell';
import { requirePageRole } from '@/lib/auth/page-guards';
import { loadChallengeSubmitData } from '@/lib/server/challenge-detail';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ikuti Tantangan · ARTIVA',
};

export default async function SubmitChallengePage({ params }) {
  const { id } = await params;
  const user = await requirePageRole('member', `/challenges/${id}/submit`);
  const data = await loadChallengeSubmitData(user.user_id, id);

  if (!data) {
    notFound();
  }

  return (
    <PublicShell user={user} mainClassName="py-6 sm:py-8">
      <ChallengeSubmitForm
        challenge={data.challenge}
        artworks={data.artworks}
        isOpenWindow={data.isOpenWindow}
      />
    </PublicShell>
  );
}
