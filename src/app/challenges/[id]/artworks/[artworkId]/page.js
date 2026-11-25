import { notFound } from 'next/navigation';
import ArtworkDetailView from '@/components/features/artworks/ArtworkDetailView';
import PublicShell from '@/components/layout/PublicShell';
import { getPublicViewer } from '@/lib/auth/page-guards';
import { findPublicChallengeById } from '@/lib/repositories/challenges';
import {
  getArtworkMetadataByIdParam,
  loadPublicArtworkDetail,
} from '@/lib/server/artwork-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getArtworkMetadataByIdParam(params, 'artworkId');
}

export default async function ChallengeArtworkDetailPage({ params }) {
  const viewer = await getPublicViewer();
  const { id, artworkId } = await params;
  const challengeId = Number(id);
  if (!Number.isInteger(challengeId) || challengeId <= 0) {
    notFound();
  }

  const [challenge, data] = await Promise.all([
    findPublicChallengeById(challengeId),
    loadPublicArtworkDetail(
      artworkId,
      viewer?.status === 'active' ? viewer.user_id : null
    ),
  ]);

  if (!challenge || !data) {
    notFound();
  }

  return (
    <PublicShell user={viewer} mainClassName="space-y-5 py-6 sm:py-8">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={viewer}
        backHref={`/challenges/${challengeId}`}
        backLabel="← Kembali ke detail tantangan"
      />
    </PublicShell>
  );
}
