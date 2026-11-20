import { AppError } from '@/lib/server/http';

function getStore() {
  if (!globalThis.__artivaRateLimit) {
    globalThis.__artivaRateLimit = new Map();
  }
  return globalThis.__artivaRateLimit;
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export function checkRateLimit({ key, limit, windowMs }) {
  const store = getStore();
  const now = Date.now();

  if (store.size > 5000) {
    for (const [entryKey, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(entryKey);
      }
    }
  }

  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { remaining: limit - 1, resetAt: next.resetAt };
  }

  if (current.count >= limit) {
    throw new AppError(
      429,
      'RATE_LIMITED',
      'Terlalu banyak percobaan. Silakan tunggu sekitar satu menit lalu coba lagi.'
    );
  }

  current.count += 1;
  store.set(key, current);
  return { remaining: limit - current.count, resetAt: current.resetAt };
}
