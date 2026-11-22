import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { listPublicChallenges } from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 12, 48);
  const status = searchParams.get('status') || '';
  const q = searchParams.get('q') || '';

  const result = await listPublicChallenges({ status, q, page, limit });
  return ok({ challenges: result.items }, result.meta);
});
