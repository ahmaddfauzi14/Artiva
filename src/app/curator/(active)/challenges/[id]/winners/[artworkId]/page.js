import { notFound } from 'next/navigation';
import ArtworkDetailView from '@/components/features/artworks/ArtworkDetailView';
import { requirePageRole } from '@/lib/auth/page-guards';
import { findCuratorChallengeById } from '@/lib/repositories/curator-challenges';
import {
  getArtworkMetadataByIdParam,
  loadPublicArtworkDetail,
} from '@/lib/server/artwork-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getArtworkMetadataByIdParam(params, 'artworkId');
}

export default async function CuratorWinnerArtworkDetailPage({ params }) {
  const { id, artworkId } = await params;
  const challengeId = Number(id);
  const user = await requirePageRole(
    'curator',
    `/curator/challenges/${id}/winners/${artworkId}`
  );

  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const [challenge, data] = await Promise.all([
    findCuratorChallengeById(challengeId, user.user_id),
    loadPublicArtworkDetail(artworkId, user.user_id),
  ]);

  if (!challenge || !data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={user}
        backHref={`/curator/challenges/${challengeId}/winners`}
        backLabel="← Kembali ke pemenang tantangan"
      />
    </div>
  );
}
