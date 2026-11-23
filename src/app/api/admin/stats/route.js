import { ok, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { getAdminPlatformStats } from '@/lib/repositories/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  await requireRole('admin');
  const stats = await getAdminPlatformStats();
  return ok({ stats });
});
