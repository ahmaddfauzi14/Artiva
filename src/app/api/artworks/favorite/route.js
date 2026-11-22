import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { favoriteArtwork, unfavoriteArtwork } from '@/lib/services/interactions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const PUT = withHandler(async (_request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const result = await favoriteArtwork(user, artworkId);
  return ok(result);
});

export const DELETE = withHandler(async (_request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const result = await unfavoriteArtwork(user, artworkId);
  return ok(result);
});
