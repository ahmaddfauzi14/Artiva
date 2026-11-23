import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { rejectVerification } from '@/lib/services/verifications';
import { rejectVerificationSchema } from '@/lib/validators/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request, { params }) => {
  const admin = await requireRole('admin');
  const { id } = await params;
  const verificationId = parsePositiveInt(id, 'verification_id');
  const body = await request.json();
  const input = rejectVerificationSchema.parse(body);

  const verification = await rejectVerification(
    verificationId,
    admin.user_id,
    input.note
  );
  return ok({ verification });
});
