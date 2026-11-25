import { notFound } from 'next/navigation';
import ArtworkDetailView from '@/components/features/artworks/ArtworkDetailView';
import { requirePageRole } from '@/lib/auth/page-guards';
import { getArtworkMetadataByIdParam } from '@/lib/server/artwork-detail';
import { loadChallengeArtworkDetail } from '@/lib/server/challenge-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getArtworkMetadataByIdParam(params, 'artworkId');
}

export default async function MemberSubmissionChallengeArtworkDetailPage({
  params,
  searchParams,
}) {
  const { id, artworkId } = await params;
  const sp = await searchParams;
  const fromQuery = sp?.from === 'list' ? '?from=list' : '';

  const user = await requirePageRole(
    'member',
    `/me/submissions/challenges/${id}/artworks/${artworkId}${fromQuery}`
  );
  const data = await loadChallengeArtworkDetail(id, artworkId, user.user_id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={user}
        backHref={`/me/submissions/challenges/${data.challengeId}${fromQuery}`}
        backLabel="← Kembali ke detail tantangan"
      />
    </div>
  );
}
