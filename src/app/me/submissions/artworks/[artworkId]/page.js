import { notFound } from 'next/navigation';
import ArtworkDetailView from '@/components/features/artworks/ArtworkDetailView';
import { requirePageRole } from '@/lib/auth/page-guards';
import {
  getArtworkMetadataByIdParam,
  loadPublicArtworkDetail,
} from '@/lib/server/artwork-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getArtworkMetadataByIdParam(params, 'artworkId');
}

export default async function MemberSubmissionArtworkDetailPage({ params }) {
  const { artworkId } = await params;
  const user = await requirePageRole(
    'member',
    `/me/submissions/artworks/${artworkId}`
  );
  const data = await loadPublicArtworkDetail(artworkId, user.user_id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={user}
        backHref="/me/submissions"
        backLabel="← Kembali ke submission"
      />
    </div>
  );
}
