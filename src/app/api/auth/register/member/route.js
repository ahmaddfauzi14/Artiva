import { ok, withHandler } from '@/lib/server/http';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { setSessionCookie } from '@/lib/auth/session';
import { registerMemberSchema } from '@/lib/validators/auth';
import { registerMember } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request) => {
  const ip = getClientIp(request);
  checkRateLimit({
    key: `register:${ip}`,
    limit: 15,
    windowMs: 60_000,
  });

  const body = await request.json();
  const input = registerMemberSchema.parse(body);
  const { user, token } = await registerMember(input);

  const response = ok({ user }, undefined, 201);
  setSessionCookie(response, token);
  return response;
});
