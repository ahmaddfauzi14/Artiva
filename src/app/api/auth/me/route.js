import { ok, withHandler } from '@/lib/server/http';
import { clearSessionCookie, getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return ok({ user: null });
  }
  if (user.status === 'suspended') {
    const response = ok({ user: null });
    clearSessionCookie(response);
    return response;
  }
  return ok({ user });
});
