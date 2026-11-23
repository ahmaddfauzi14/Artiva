import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { createArtworkReport } from '@/lib/services/reports';
import { createReportSchema } from '@/lib/validators/reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request, { params }) => {
  const user = await requireAuth();
  const ip = getClientIp(request);
  checkRateLimit({
    key: `report:${user.user_id}:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });

  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const body = await request.json();
  const input = createReportSchema.parse(body);

  const report = await createArtworkReport(user, artworkId, input);
  return ok({ report }, undefined, 201);
});
