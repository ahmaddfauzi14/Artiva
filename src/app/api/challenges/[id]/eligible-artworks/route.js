import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { getEligibleArtworksForMember } from '@/lib/services/submissions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  const user = await requireRole('member');
  const { id } = await params;
  const challengeId = parsePositiveInt(id, 'challenge_id');
  const result = await getEligibleArtworksForMember(user.user_id, challengeId);
  return ok(result);
});
