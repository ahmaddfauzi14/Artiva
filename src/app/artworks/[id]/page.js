import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArtworkDetail from '@/components/features/artworks/ArtworkDetail';
import PublicShell from '@/components/layout/PublicShell';
import { getPublicViewer } from '@/lib/auth/page-guards';
import { canInteract, canReport } from '@/lib/shared/permissions';
import { findPublicArtworkById } from '@/lib/repositories/artworks';
import { listArtworkComments } from '@/lib/repositories/interactions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return { title: 'Karya Tidak Ditemukan · ARTIVA' };
  }
  const artwork = await findPublicArtworkById(numId);
  return {
    title: artwork ? `${artwork.title} · ARTIVA` : 'Karya Tidak Ditemukan · ARTIVA',
  };
}

export default async function ArtworkDetailPage({ params }) {
  const viewer = await getPublicViewer();

  const { id } = await params;
  const artworkId = Number(id);
  if (!Number.isInteger(artworkId) || artworkId <= 0) {
    notFound();
  }

  const artwork = await findPublicArtworkById(
    artworkId,
    viewer?.status === 'active' ? viewer.user_id : null
  );

  if (!artwork) {
    notFound();
  }

  const commentsData = await listArtworkComments(artworkId, {
    page: 1,
    limit: 30,
  });

  return (
    <PublicShell user={viewer} mainClassName="space-y-5 py-6 sm:py-8">
      <div>
        <Link
          href="/artworks"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke galeri karya
        </Link>
      </div>

      <ArtworkDetail
        artwork={artwork}
        initialComments={commentsData.items}
        initialCommentsMeta={commentsData.meta}
        viewer={viewer}
        canInteract={canInteract(viewer)}
        canReport={canReport(viewer)}
      />
    </PublicShell>
  );
}
