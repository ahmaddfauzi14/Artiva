import { ok, withHandler } from '@/lib/server/http';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { requireRole } from '@/lib/auth/guards';
import {
  getCuratorVerificationDetail,
  submitCuratorAppeal,
} from '@/lib/services/verifications';
import { submitCuratorAppealSchema } from '@/lib/validators/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  const user = await requireRole('curator');
  const verification = await getCuratorVerificationDetail(user.user_id);
  return ok({ verification });
});

export const POST = withHandler(async (request) => {
  const user = await requireRole('curator');
  checkRateLimit({
    key: `curator-appeal:${user.user_id}`,
    limit: 10,
    windowMs: 60_000,
  });

  const body = await request.json();
  const input = submitCuratorAppealSchema.parse(body);
  const verification = await submitCuratorAppeal(user.user_id, input);

  return ok({ verification }, undefined, 201);
});
