import { parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { serveDocumentFile } from '@/lib/server/uploads';
import { getAdminVerificationCv } from '@/lib/services/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request, { params }) => {
  await requireRole('admin');
  const { id } = await params;
  const verificationId = parsePositiveInt(id, 'verification_id');
  const { searchParams } = new URL(request.url);
  const forceDownload = searchParams.get('download') === '1';

  const record = await getAdminVerificationCv(verificationId);
  return serveDocumentFile(record.cv_path, {
    filenameBase: `cv-${record.username || `rg-${verificationId}`}`,
    forceDownload,
  });
});
