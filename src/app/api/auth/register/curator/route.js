import { AppError, ok, withHandler } from '@/lib/server/http';
import { checkRateLimit, getClientIp } from '@/lib/server/rate-limit';
import { setSessionCookie } from '@/lib/auth/session';
import { registerCuratorSchema } from '@/lib/validators/auth';
import { registerCurator } from '@/lib/services/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = withHandler(async (request) => {
  const ip = getClientIp(request);
  checkRateLimit({
    key: `register:${ip}`,
    limit: 15,
    windowMs: 60_000,
  });

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Pengajuan Kurator wajib mengirimkan data formulir beserta file CV.',
      { cv: 'File CV (PDF atau Word) wajib diunggah.' }
    );
  }

  const formData = await request.formData();
  const raw = {
    username: formData.get('username') ?? '',
    email: formData.get('email') ?? '',
    password: formData.get('password') ?? '',
    display_name: formData.get('display_name') ?? '',
    bio: formData.get('bio') ?? '',
    website: formData.get('website') ?? '',
  };
  const cvFile = formData.get('cv');

  const parsed = registerCuratorSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = {};
    for (const issue of parsed.error.issues || []) {
      const key = issue.path?.length ? issue.path.join('.') : '_form';
      if (!fields[key]) fields[key] = issue.message;
    }
    if (!cvFile || typeof cvFile.arrayBuffer !== 'function' || cvFile.size === 0) {
      fields.cv = 'File CV (PDF atau Word) wajib diunggah.';
    }
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Periksa kembali data yang kamu masukkan.',
      fields
    );
  }

  const { user, token } = await registerCurator(parsed.data, cvFile);

  const response = ok({ user }, undefined, 201);
  setSessionCookie(response, token);
  return response;
});
