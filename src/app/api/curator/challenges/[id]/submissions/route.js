import { ok, parsePagination, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireActiveCurator } from '@/lib/auth/guards';
import { getCuratorChallengeSubmissions } from '@/lib/services/challenges';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request, { params }) => {
  const curator = await requireActiveCurator();
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 24, 50);
  const status = searchParams.get('status') || 'submitted';

  const result = await getCuratorChallengeSubmissions(
    curator.user_id,
    challengeId,
    { status, page, limit }
  );
  return ok(
    { challenge: result.challenge, submissions: result.items },
    result.meta
  );
});
