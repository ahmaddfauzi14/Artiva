import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { resolveReport } from '@/lib/services/reports';
import { resolveReportSchema } from '@/lib/validators/reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request, { params }) => {
  const admin = await requireRole('admin');
  const { id } = await params;
  const reportId = parsePositiveInt(id, 'report_id');
  const body = await request.json();
  const input = resolveReportSchema.parse(body);

  const report = await resolveReport(admin.user_id, reportId, input);
  return ok({ report });
});
