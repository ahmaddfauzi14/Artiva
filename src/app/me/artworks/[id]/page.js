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

export default async function MemberArtworkDetailPage({ params }) {
  const { id } = await params;
  const user = await requirePageRole('member', `/me/artworks/${id}`);
  const data = await loadPublicArtworkDetail(id, user.user_id);

  if (!data || data.artwork.creator?.user_id !== user.user_id) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <ArtworkDetailView
        artwork={data.artwork}
        commentsData={data.commentsData}
        viewer={user}
        backHref="/me/artworks"
        backLabel="← Kembali ke karya saya"
      />
    </div>
  );
}
