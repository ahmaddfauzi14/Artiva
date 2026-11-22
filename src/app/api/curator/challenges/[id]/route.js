import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireActiveCurator } from '@/lib/auth/guards';
import {
  deleteCuratorChallenge,
  getCuratorChallenge,
  updateCuratorChallenge,
} from '@/lib/services/challenges';
import { updateChallengeSchema } from '@/lib/validators/challenges';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  const curator = await requireActiveCurator();
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const challenge = await getCuratorChallenge(curator.user_id, challengeId);
  return ok({ challenge });
});

export const PATCH = withHandler(async (request, { params }) => {
  const curator = await requireActiveCurator();
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const body = await request.json();
  const input = updateChallengeSchema.parse(body);

  const challenge = await updateCuratorChallenge(
    curator.user_id,
    challengeId,
    input
  );
  return ok({ challenge });
});

export const DELETE = withHandler(async (_request, { params }) => {
  const curator = await requireActiveCurator();
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const result = await deleteCuratorChallenge(curator.user_id, challengeId);
  return ok(result);
});
