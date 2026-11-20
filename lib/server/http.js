import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/shared/error-messages';

export class AppError extends Error {
  constructor(status, code, message, fields = undefined) {
    super(message || getErrorMessage(code));
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function ok(data, meta = undefined, status = 200) {
  const body = meta !== undefined ? { data, meta } : { data };
  return NextResponse.json(body, { status });
}

export function fail(code, message, status = 400, fields = undefined) {
  const error = {
    code,
    message: message || getErrorMessage(code),
  };
  if (fields && Object.keys(fields).length > 0) {
    error.fields = fields;
  }
  return NextResponse.json({ error }, { status });
}

export function parsePositiveInt(rawValue, fieldName = 'id') {
  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} tidak valid.`, {
      [fieldName]: 'Harus berupa angka bulat positif.',
    });
  }
  return parsed;
}

export function parsePagination(searchParams, defaultLimit = 12, maxLimit = 48) {
  const rawPage = Number(searchParams.get('page') || '1');
  const rawLimit = Number(searchParams.get('limit') || String(defaultLimit));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, maxLimit)
      : defaultLimit;
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function assertSameOrigin(request) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return;
  }

  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) return;

  for (const headerName of ['origin', 'referer']) {
    const rawValue = request.headers.get(headerName);
    if (!rawValue) continue;

    let parsedHost = null;
    try {
      parsedHost = new URL(rawValue).host;
    } catch {
      parsedHost = null;
    }
    if (parsedHost !== host) {
      throw new AppError(
        403,
        'FORBIDDEN',
        'Permintaan lintas origin tidak diizinkan.'
      );
    }
    return;
  }
}

function mapZodError(err) {
  const fields = {};
  for (const issue of err.issues || []) {
    const key = issue.path?.length ? issue.path.join('.') : '_form';
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fail(
    'VALIDATION_ERROR',
    'Periksa kembali data yang kamu masukkan.',
    400,
    fields
  );
}

function mapPgError(err) {
  if (err.code === '23505') {
    const constraint = err.constraint || '';
    if (constraint.includes('username')) {
      return fail('USERNAME_TAKEN', getErrorMessage('USERNAME_TAKEN'), 409, {
        username: getErrorMessage('USERNAME_TAKEN'),
      });
    }
    if (constraint.includes('email')) {
      return fail('EMAIL_TAKEN', getErrorMessage('EMAIL_TAKEN'), 409, {
        email: getErrorMessage('EMAIL_TAKEN'),
      });
    }
    if (constraint === 'uq_submission') {
      return fail('ALREADY_SUBMITTED', getErrorMessage('ALREADY_SUBMITTED'), 409);
    }
    if (constraint === 'uq_report') {
      return fail('ALREADY_REPORTED', getErrorMessage('ALREADY_REPORTED'), 409);
    }
    if (constraint.includes('categories')) {
      return fail('INVALID_STATE', 'Nama atau slug kategori sudah digunakan.', 409);
    }
    return fail('INVALID_STATE', 'Data sudah ada atau terjadi konflik status.', 409);
  }

  if (err.code === '23503') {
    return fail('INVALID_STATE', 'Referensi data tidak ditemukan atau masih digunakan.', 409);
  }

  if (err.code === '23514' || err.code === '22P02') {
    return fail('VALIDATION_ERROR', 'Format atau batas nilai input tidak sesuai.', 400);
  }

  return null;
}

export function withHandler(handler) {
  return async function wrappedHandler(request, context) {
    try {
      assertSameOrigin(request);
      return await handler(request, context);
    } catch (err) {
      if (err instanceof AppError) {
        return fail(err.code, err.message, err.status, err.fields);
      }

      if (err?.name === 'ZodError' || Array.isArray(err?.issues)) {
        return mapZodError(err);
      }

      if (err?.code) {
        const pgResponse = mapPgError(err);
        if (pgResponse) return pgResponse;
      }

      console.error('[ARTIVA API ERROR]', err?.message || err);
      return fail('INTERNAL_ERROR', getErrorMessage('INTERNAL_ERROR'), 500);
    }
  };
}
