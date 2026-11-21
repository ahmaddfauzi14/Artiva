import { AppError, ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/auth/session';
import { findPublicArtworkById } from '@/lib/repositories/artworks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const viewer = await getCurrentUser();
  const artwork = await findPublicArtworkById(
    artworkId,
    viewer?.status === 'active' ? viewer.user_id : null
  );

  if (!artwork) {
    throw new AppError(404, 'NOT_FOUND', 'Karya tidak ditemukan.');
  }

  return ok({ artwork });
});
