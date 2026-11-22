import { ok, parsePagination, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import {
  addArtworkComment,
  getPublicArtworkComments,
} from '@/lib/services/interactions';
import { createCommentSchema } from '@/lib/validators/interactions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 20, 50);

  const result = await getPublicArtworkComments(artworkId, { page, limit });
  return ok({ comments: result.items }, result.meta);
});

export const POST = withHandler(async (request, { params }) => {
  const user = await requireAuth();
  const ip = getClientIp(request);
  checkRateLimit({
    key: `comment:${user.user_id}:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });

  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const body = await request.json();
  const input = createCommentSchema.parse(body);

  const comment = await addArtworkComment(user, artworkId, input.content);
  return ok({ comment }, undefined, 201);
});
