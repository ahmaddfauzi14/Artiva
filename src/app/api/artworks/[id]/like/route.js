import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { likeArtwork, unlikeArtwork } from '@/lib/services/interactions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const PUT = withHandler(async (_request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const result = await likeArtwork(user, artworkId);
  return ok(result);
});

export const DELETE = withHandler(async (_request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const result = await unlikeArtwork(user, artworkId);
  return ok(result);
});
