import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { query } from '@/lib/server/db';
import { toUploadUrl } from '@/lib/shared/format';

export const SESSION_COOKIE_NAME = 'artiva_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET harus diatur minimal 32 karakter.');
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken({ userId, role }) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return { userId, role: payload.role };
  } catch {
    return null;
  }
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const { rows } = await query(
    `SELECT
       u.user_id,
       u.username,
       u.email,
       u.role,
       u.status,
       u.created_at,
       p.display_name,
       p.bio,
       p.avatar_path,
       p.website,
       cv.verification_id,
       cv.status AS verification_status,
       cv.note AS verification_note,
       cv.appeal_note AS verification_appeal_note,
       cv.submitted_at AS verification_submitted_at,
       cv.reviewed_at AS verification_reviewed_at
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT verification_id, status, note, appeal_note, submitted_at, reviewed_at
       FROM curator_verifications
       WHERE user_id = u.user_id
       ORDER BY submitted_at DESC, verification_id DESC
       LIMIT 1
     ) cv ON u.role = 'curator'
     WHERE u.user_id = $1
     LIMIT 1`,
    [claims.userId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    display_name: row.display_name || row.username,
    bio: row.bio || '',
    avatar_path: row.avatar_path || null,
    avatar_url: toUploadUrl(row.avatar_path),
    website: row.website || '',
    verification:
      row.role === 'curator' && row.verification_id
        ? {
            verification_id: row.verification_id,
            status: row.verification_status,
            note: row.verification_note || null,
            appeal_note: row.verification_appeal_note || null,
            submitted_at: row.verification_submitted_at,
            reviewed_at: row.verification_reviewed_at,
          }
        : null,
  };
}
