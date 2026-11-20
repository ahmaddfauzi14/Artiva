import { ok, withHandler } from '@/lib/server/http';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validators/auth';
import { loginAccount } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request) => {
  const body = await request.json();
  const input = loginSchema.parse(body);

  const ip = getClientIp(request);
  const idKey = input.identifier.trim().toLowerCase();
  checkRateLimit({
    key: `login:${ip}:${idKey}`,
    limit: 5,
    windowMs: 60_000,
  });

  const { user, token } = await loginAccount(input);
  const response = ok({ user });
  setSessionCookie(response, token);
  return response;
});
