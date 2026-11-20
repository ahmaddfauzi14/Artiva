import { ok, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { updateProfileSchema } from '@/lib/validators/auth';
import { updateMyProfile } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const PATCH = withHandler(async (request) => {
  const user = await requireAuth();
  const contentType = request.headers.get('content-type') || '';

  let rawBody;
  let avatarFile = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    rawBody = {
      display_name: formData.get('display_name') ?? '',
      bio: formData.get('bio') ?? '',
      website: formData.get('website') ?? '',
    };
    const fileEntry = formData.get('avatar');
    if (fileEntry && typeof fileEntry === 'object' && fileEntry.size > 0) {
      avatarFile = fileEntry;
    }
  } else {
    rawBody = await request.json();
  }

  const input = updateProfileSchema.parse(rawBody);
  const profile = await updateMyProfile(user.user_id, input, avatarFile);
  return ok({ profile });
});
