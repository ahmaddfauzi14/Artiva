import { notFound } from 'next/navigation';
import ArtworkDetailView from '@/components/features/artworks/ArtworkDetailView';
import PublicShell from '@/components/layout/PublicShell';
import { getPublicViewer } from '@/lib/auth/page-guards';
import {
  getArtworkMetadataByIdParam,
  loadPublicArtworkDetail,
} from '@/lib/server/artwork-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getArtworkMetadataByIdParam(params, 'artworkId');
}

export default async function ChallengesWinnerArtworkDetailPage({ params }) {
  const viewer = await getPublicViewer();
  const { artworkId } = await params;
  const data = await loadPublicArtworkDetail(
    artworkId,
    viewer?.status === 'active' ? viewer.user_id : null
  );

  if (!data) {
    notFound();
  }

  return (
    <PublicShell user={viewer} mainClassName="space-y-5 py-6 sm:py-8">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={viewer}
        backHref="/challenges"
        backLabel="← Kembali ke daftar tantangan"
      />
    </PublicShell>
  );
}
