import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { requireActiveCurator } from '@/lib/auth/guards';
import { listCuratorChallenges } from '@/lib/repositories/curator-challenges';
import { createCuratorChallenge } from '@/lib/services/challenges';
import { parseChallengeRequest } from '@/lib/validators/challenges';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const curator = await requireActiveCurator();
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 20, 50);
  const status = searchParams.get('status') || '';

  const result = await listCuratorChallenges(curator.user_id, {
    status,
    page,
    limit,
  });
  return ok({ challenges: result.items }, result.meta);
});

export const POST = withHandler(async (request) => {
  const curator = await requireActiveCurator();
  const { input, bannerFile } = await parseChallengeRequest(request);
  const challenge = await createCuratorChallenge(
    curator.user_id,
    input,
    bannerFile
  );
  return ok({ challenge }, undefined, 201);
});
