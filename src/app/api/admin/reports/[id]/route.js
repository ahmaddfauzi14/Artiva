import { AppError, ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { findAdminReportDetail } from '@/lib/repositories/reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  await requireRole('admin');
  const { id } = await params;
  const reportId = parsePositiveInt(id, 'report_id');
  const report = await findAdminReportDetail(reportId);

  if (!report) {
    throw new AppError(404, 'NOT_FOUND', 'Laporan tidak ditemukan.');
  }

  return ok({ report });
});
