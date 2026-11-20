import { ok, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { clearSessionCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async () => {
  await requireAuth();
  const response = ok({ logged_out: true });
  clearSessionCookie(response);
  return response;
});
