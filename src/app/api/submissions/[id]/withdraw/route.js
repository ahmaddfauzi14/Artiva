import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { withdrawMemberSubmission } from '@/lib/services/submissions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (_request, { params }) => {
  const user = await requireRole('member');
  const { id } = await params;
  const submissionId = parsePositiveInt(id, 'submission_id');
  const submission = await withdrawMemberSubmission(user.user_id, submissionId);
  return ok({ submission });
});
