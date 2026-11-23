import { AppError, ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { findAdminVerificationById } from '@/lib/repositories/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  await requireRole('admin');
  const { id } = await params;
  const verificationId = parsePositiveInt(id, 'verification_id');
  const verification = await findAdminVerificationById(verificationId);

  if (!verification) {
    throw new AppError(404, 'NOT_FOUND', 'Pengajuan verifikasi tidak ditemukan.');
  }

  return ok({ verification });
});
