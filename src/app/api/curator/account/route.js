import { ok, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { clearSessionCookie } from '@/lib/auth/session';
import { deleteRejectedCuratorAccount } from '@/lib/services/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const DELETE = withHandler(async () => {
  const user = await requireRole('curator');
  const result = await deleteRejectedCuratorAccount(user.user_id);

  const response = ok(result);
  clearSessionCookie(response);
  return response;
});
