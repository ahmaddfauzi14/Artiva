import { getErrorMessage } from '@/lib/shared/error-messages';

export async function apiFetch(url, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  const finalHeaders = { ...headers };
  let finalBody = body;

  if (body && !isFormData && typeof body === 'object') {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const errObj = payload?.error || {};
    const code = errObj.code || 'INTERNAL_ERROR';
    const message = errObj.message || getErrorMessage(code);
    const error = new Error(message);
    error.code = code;
    error.status = res.status;
    error.fields = errObj.fields || {};
    throw error;
  }

  return payload;
}
