import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { listAdminVerifications } from '@/lib/repositories/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  await requireRole('admin');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 12, 50);
  const status = searchParams.get('status') || 'pending';
  const q = searchParams.get('q') || '';

  const result = await listAdminVerifications({ status, q, page, limit });
  return ok(
    { verifications: result.items, counts: result.counts },
    result.meta
  );
});
