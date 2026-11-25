import { notFound } from 'next/navigation';
import ChallengeDetailView from '@/components/features/challenges/ChallengeDetailView';
import { requirePageRole } from '@/lib/auth/page-guards';
import {
  getChallengeMetadataByIdParam,
  loadPublicChallengeDetail,
} from '@/lib/server/challenge-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getChallengeMetadataByIdParam(params);
}

export default async function MemberSubmissionChallengeDetailPage({
  params,
  searchParams,
}) {
  const { id } = await params;
  const sp = await searchParams;
  const fromList = sp?.from === 'list';
  const fromQuery = fromList ? '?from=list' : '';

  const user = await requirePageRole(
    'member',
    `/me/submissions/challenges/${id}${fromQuery}`
  );
  const data = await loadPublicChallengeDetail(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <ChallengeDetailView
        challenge={data.challenge}
        submissionsData={data.submissionsData}
        winners={data.winners}
        viewer={user}
        backHref={
          fromList ? '/me/submissions/challenges' : '/me/submissions'
        }
        backLabel={
          fromList
            ? '← Kembali ke daftar tantangan'
            : '← Kembali ke submission'
        }
        artworkHrefPrefix={`/me/submissions/challenges/${data.challengeId}/artworks`}
        artworkHrefSuffix={fromQuery}
        submitHref={`/me/submissions/challenges/${data.challengeId}/submit${fromQuery}`}
      />
    </div>
  );
}
