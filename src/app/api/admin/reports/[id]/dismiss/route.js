import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { dismissReport } from '@/lib/services/reports';
import { dismissReportSchema } from '@/lib/validators/reports';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request, { params }) => {
  const admin = await requireRole('admin');
  const { id } = await params;
  const reportId = parsePositiveInt(id, 'report_id');
  const body = await request.json();
  const input = dismissReportSchema.parse(body);

  const report = await dismissReport(
    admin.user_id,
    reportId,
    input.resolution_note
  );
  return ok({ report });
});
