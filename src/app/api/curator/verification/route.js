import { ok, withHandler } from '@/lib/server/http';
import { checkRateLimit } from '@/lib/server/rate-limit';
import { requireRole } from '@/lib/auth/guards';
import {
  getCuratorVerificationDetail,
  submitCuratorAppeal,
} from '@/lib/services/verifications';
import { submitCuratorAppealSchema } from '@/lib/validators/verifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  const user = await requireRole('curator');
  const verification = await getCuratorVerificationDetail(user.user_id);
  return ok({ verification });
});

export const POST = withHandler(async (request) => {
  const user = await requireRole('curator');
  checkRateLimit({
    key: `curator-appeal:${user.user_id}`,
    limit: 10,
    windowMs: 60_000,
  });

  const contentType = request.headers.get('content-type') || '';
  let raw;
  let cvFile = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    raw = {
      display_name: formData.get('display_name') ?? '',
      bio: formData.get('bio') ?? '',
      website: formData.get('website') ?? '',
      appeal_note: formData.get('appeal_note') ?? '',
    };
    const fileEntry = formData.get('cv');
    if (fileEntry && typeof fileEntry === 'object' && fileEntry.size > 0) {
      cvFile = fileEntry;
    }
  } else {
    raw = await request.json();
  }

  const input = submitCuratorAppealSchema.parse(raw);
  const verification = await submitCuratorAppeal(user.user_id, input, cvFile);

  return ok({ verification }, undefined, 201);
});
