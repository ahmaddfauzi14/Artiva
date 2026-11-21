import { AppError, ok, parsePagination, withHandler } from '@/lib/server/http';
import { findPublicCreatorByUsername } from '@/lib/repositories/artworks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request, { params }) => {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 12, 48);

  const data = await findPublicCreatorByUsername(username, { page, limit });
  if (!data) {
    throw new AppError(404, 'NOT_FOUND', 'Kreator tidak ditemukan.');
  }

  return ok({ creator: data.creator, artworks: data.artworks }, data.meta);
});
