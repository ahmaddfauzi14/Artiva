import { AppError, ok, parsePagination, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import {
  findPublicChallengeById,
  listPublicChallengeSubmissions,
} from '@/lib/repositories/challenges';
import { submitArtworkToChallenge } from '@/lib/services/submissions';
import { createSubmissionSchema } from '@/lib/validators/submissions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request, { params }) => {
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const challenge = await findPublicChallengeById(challengeId);

  if (!challenge) {
    throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
  }

  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 24, 48);
  const result = await listPublicChallengeSubmissions(challengeId, { page, limit });

  return ok({ submissions: result.items }, result.meta);
});

export const POST = withHandler(async (request, { params }) => {
  const user = await requireRole('member');
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const body = await request.json();
  const input = createSubmissionSchema.parse(body);

  const submission = await submitArtworkToChallenge(
    user.user_id,
    challengeId,
    input.artwork_id
  );
  return ok({ submission }, undefined, 201);
});
