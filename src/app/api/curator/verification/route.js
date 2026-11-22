import { ok, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { getCuratorVerificationDetail } from '@/lib/services/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  const user = await requireRole('curator');
  const verification = await getCuratorVerificationDetail(user.user_id);
  return ok({ verification });
});
