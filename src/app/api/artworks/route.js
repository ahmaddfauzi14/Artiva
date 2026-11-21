import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { listPublicArtworks } from '@/lib/repositories/artworks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 12, 48);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  const result = await listPublicArtworks({ q, category, sort, page, limit });
  return ok({ artworks: result.items }, result.meta);
});
