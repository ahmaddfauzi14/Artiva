import { parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { serveDocumentFile } from '@/lib/server/uploads';
import { getCuratorVerificationCv } from '@/lib/services/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const user = await requireRole('curator');
  const { searchParams } = new URL(request.url);
  const rawVerificationId = searchParams.get('verification_id');
  const verificationId = rawVerificationId
    ? parsePositiveInt(rawVerificationId, 'verification_id')
    : null;
  const forceDownload = searchParams.get('download') === '1';

  const record = await getCuratorVerificationCv(user.user_id, verificationId);
  return serveDocumentFile(record.cv_path, {
    filenameBase: `cv-${record.username || 'kurator'}`,
    forceDownload,
  });
});
