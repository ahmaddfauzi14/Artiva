import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { listAdminUsers } from '@/lib/repositories/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  await requireRole('admin');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 15, 50);
  const role = searchParams.get('role') || '';
  const status = searchParams.get('status') || '';
  const q = searchParams.get('q') || '';

  const result = await listAdminUsers({ role, status, q, page, limit });
  return ok({ users: result.items, counts: result.counts }, result.meta);
});
