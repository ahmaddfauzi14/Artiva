import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { listMemberSubmissions } from '@/lib/repositories/submissions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const user = await requireRole('member');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 24, 50);

  const result = await listMemberSubmissions(user.user_id, { page, limit });
  return ok({ submissions: result.items }, result.meta);
});
