import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireActiveCurator } from '@/lib/auth/guards';
import { declareChallengeWinners } from '@/lib/services/winners';
import { declareWinnersSchema } from '@/lib/validators/winners';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request, { params }) => {
  const curator = await requireActiveCurator();
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const body = await request.json();
  const input = declareWinnersSchema.parse(body);

  const winners = await declareChallengeWinners(
    curator.user_id,
    challengeId,
    input.winners
  );
  return ok({ winners }, undefined, 201);
});
