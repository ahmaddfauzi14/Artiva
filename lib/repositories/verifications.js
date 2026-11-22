import { query } from '@/lib/server/db';
import { toUploadUrl } from '@/lib/shared/format';

export async function findLatestVerificationByUserId(userId, client = null) {
  const { rows } = await query(
    `SELECT
       cv.verification_id,
       cv.user_id,
       cv.reviewed_by,
       cv.status,
       cv.note,
       cv.submitted_at,
       cv.reviewed_at,
       u.username,
       u.email,
       u.status AS user_status,
       p.display_name,
       p.bio,
       p.website,
       p.avatar_path
     FROM curator_verifications cv
     JOIN users u ON u.user_id = cv.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE cv.user_id = $1
     ORDER BY cv.submitted_at DESC, cv.verification_id DESC
     LIMIT 1`,
    [userId],
    client
  );
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    avatar_url: toUploadUrl(row.avatar_path),
  };
}

export async function listAdminVerifications({
  status = 'pending',
  q = '',
  page = 1,
  limit = 12,
} = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (['pending', 'approved', 'rejected'].includes(status)) {
    params.push(status);
    conditions.push(`cv.status = $${params.length}`);
  }

  const cleanQ = q.trim();
  if (cleanQ) {
    params.push(`%${cleanQ}%`);
    const idx = params.length;
    conditions.push(
      `(u.username ILIKE $${idx} OR u.email ILIKE $${idx} OR COALESCE(p.display_name, '') ILIKE $${idx})`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const [listRes, countsRes] = await Promise.all([
    query(
      `SELECT
         cv.verification_id,
         cv.user_id,
         cv.status,
         cv.note,
         cv.submitted_at,
         cv.reviewed_at,
         u.username,
         u.email,
         u.status AS user_status,
         p.display_name,
         p.website,
         COUNT(*) OVER()::int AS total_count
       FROM curator_verifications cv
       JOIN users u ON u.user_id = cv.user_id
       LEFT JOIN profiles p ON p.user_id = u.user_id
       ${whereClause}
       ORDER BY
         CASE WHEN cv.status = 'pending' THEN 0 ELSE 1 END,
         cv.submitted_at ASC,
         cv.verification_id ASC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
       FROM curator_verifications`
    ),
  ]);

  const total = listRes.rows[0]?.total_count ?? 0;
  return {
    items: listRes.rows,
    counts: countsRes.rows[0] || { pending: 0, approved: 0, rejected: 0 },
    meta: { page, limit, total },
  };
}

export async function findAdminVerificationById(verificationId, client = null) {
  const { rows } = await query(
    `SELECT
       cv.verification_id,
       cv.user_id,
       cv.reviewed_by,
       cv.status,
       cv.note,
       cv.submitted_at,
       cv.reviewed_at,
       u.username,
       u.email,
       u.status AS user_status,
       u.created_at AS user_created_at,
       p.display_name,
       p.bio,
       p.website,
       p.avatar_path,
       ru.username AS reviewer_username,
       rp.display_name AS reviewer_display_name
     FROM curator_verifications cv
     JOIN users u ON u.user_id = cv.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN users ru ON ru.user_id = cv.reviewed_by
     LEFT JOIN profiles rp ON rp.user_id = ru.user_id
     WHERE cv.verification_id = $1
     LIMIT 1`,
    [verificationId],
    client
  );

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    avatar_url: toUploadUrl(row.avatar_path),
  };
}

export async function lockVerificationRow(verificationId, client) {
  const { rows } = await query(
    `SELECT verification_id, user_id, status
     FROM curator_verifications
     WHERE verification_id = $1
     FOR UPDATE`,
    [verificationId],
    client
  );
  return rows[0] || null;
}

export async function markVerificationApproved(verificationId, adminId, client) {
  const { rows } = await query(
    `UPDATE curator_verifications
     SET status = 'approved',
         reviewed_by = $2,
         reviewed_at = now()
     WHERE verification_id = $1
     RETURNING *`,
    [verificationId, adminId],
    client
  );
  return rows[0];
}

export async function activateCuratorUser(userId, client) {
  await query(
    `UPDATE users
     SET status = 'active'
     WHERE user_id = $1 AND role = 'curator'`,
    [userId],
    client
  );
}

export async function markVerificationRejected(
  verificationId,
  adminId,
  note,
  client
) {
  const { rows } = await query(
    `UPDATE curator_verifications
     SET status = 'rejected',
         note = $3,
         reviewed_by = $2,
         reviewed_at = now()
     WHERE verification_id = $1
     RETURNING *`,
    [verificationId, adminId, note],
    client
  );
  return rows[0];
}

export async function hardDeleteRejectedCuratorRow(userId, client) {
  const { rows } = await query(
    `DELETE FROM users
     WHERE user_id = $1 AND role = 'curator' AND status = 'pending'
     RETURNING user_id`,
    [userId],
    client
  );
  return rows[0] || null;
}
