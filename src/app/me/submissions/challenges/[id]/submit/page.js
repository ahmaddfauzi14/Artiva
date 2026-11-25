import { notFound } from 'next/navigation';
import ChallengeSubmitForm from '@/components/features/challenges/ChallengeSubmitForm';
import { requirePageRole } from '@/lib/auth/page-guards';
import { loadChallengeSubmitData } from '@/lib/server/challenge-detail';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ikuti Tantangan · Submission ARTIVA',
};

export default async function MemberSubmissionChallengeSubmitPage({
  params,
  searchParams,
}) {
  const { id } = await params;
  const sp = await searchParams;
  const fromQuery = sp?.from === 'list' ? '?from=list' : '';

  const user = await requirePageRole(
    'member',
    `/me/submissions/challenges/${id}/submit${fromQuery}`
  );
  const data = await loadChallengeSubmitData(user.user_id, id);

  if (!data) {
    notFound();
  }

  return (
    <ChallengeSubmitForm
      challenge={data.challenge}
      artworks={data.artworks}
      isOpenWindow={data.isOpenWindow}
      backHref={`/me/submissions/challenges/${data.challengeId}${fromQuery}`}
    />
  );
}
