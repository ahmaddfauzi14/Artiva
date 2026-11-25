import { findPublicArtworkById } from '@/lib/repositories/artworks';
import { listArtworkComments } from '@/lib/repositories/interactions';

/**
 * Menghasilkan metadata halaman detail karya berdasarkan parameter ID rute.
 */
export async function getArtworkMetadataByIdParam(params, paramKey = 'id') {
  const resolved = await params;
  const artworkId = Number(resolved?.[paramKey]);
  if (!Number.isInteger(artworkId) || artworkId <= 0) {
    return { title: 'Karya Tidak Ditemukan · ARTIVA' };
  }
  const artwork = await findPublicArtworkById(artworkId);
  return {
    title: artwork ? `${artwork.title} · ARTIVA` : 'Karya Tidak Ditemukan · ARTIVA',
  };
}

/**
 * Memuat data karya publik beserta komentar awalnya untuk halaman detail.
 */
export async function loadPublicArtworkDetail(idParam, viewerUserId = null) {
  const artworkId = Number(idParam);
  if (!Number.isInteger(artworkId) || artworkId <= 0) {
    return null;
  }

  const artwork = await findPublicArtworkById(artworkId, viewerUserId);
  if (!artwork) {
    return null;
  }

  const commentsData = await listArtworkComments(artworkId, {
    page: 1,
    limit: 30,
  });

  return { artwork, commentsData };
}
