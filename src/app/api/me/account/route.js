import { ok, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { updateAccountSchema } from '@/lib/validators/auth';
import { updateMyAccount } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const PATCH = withHandler(async (request) => {
  const user = await requireAuth();
  const body = await request.json();
  const input = updateAccountSchema.parse(body);
  const updated = await updateMyAccount(user.user_id, input);
  return ok({ account: updated });
});
