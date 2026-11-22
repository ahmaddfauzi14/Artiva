import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { listUserFavorites } from '@/lib/repositories/interactions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const user = await requireRole('member');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 12, 48);

  const result = await listUserFavorites(user.user_id, { page, limit });
  return ok({ favorites: result.items }, result.meta);
});
