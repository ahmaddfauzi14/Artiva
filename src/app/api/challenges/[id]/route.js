import { AppError, ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import {
  findPublicChallengeById,
  listChallengeWinners,
} from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const challenge = await findPublicChallengeById(challengeId);

  if (!challenge) {
    throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
  }

  const winners =
    challenge.status === 'announced'
      ? await listChallengeWinners(challengeId)
      : [];

  return ok({ challenge, winners });
});
