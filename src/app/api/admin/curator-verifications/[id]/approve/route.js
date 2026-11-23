import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { approveVerification } from '@/lib/services/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (_request, { params }) => {
  const admin = await requireRole('admin');
  const { id } = await params;
  const verificationId = parsePositiveInt(id, 'verification_id');
  const verification = await approveVerification(verificationId, admin.user_id);
  return ok({ verification });
});
