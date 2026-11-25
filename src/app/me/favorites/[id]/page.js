import { notFound } from 'next/navigation';
import ArtworkDetailView from '@/components/features/artworks/ArtworkDetailView';
import { requirePageRole } from '@/lib/auth/page-guards';
import {
  getArtworkMetadataByIdParam,
  loadPublicArtworkDetail,
} from '@/lib/server/artwork-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  return getArtworkMetadataByIdParam(params);
}

export default async function MemberFavoriteDetailPage({ params }) {
  const { id } = await params;
  const user = await requirePageRole('member', `/me/favorites/${id}`);
  const data = await loadPublicArtworkDetail(id, user.user_id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={user}
        backHref="/me/favorites"
        backLabel="← Kembali ke favorit"
      />
    </div>
  );
}
