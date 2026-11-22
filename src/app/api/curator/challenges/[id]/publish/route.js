import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireActiveCurator } from '@/lib/auth/guards';
import { publishCuratorChallenge } from '@/lib/services/challenges';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (_request, { params }) => {
  const curator = await requireActiveCurator();
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const challenge = await publishCuratorChallenge(curator.user_id, challengeId);
  return ok({ challenge });
});
