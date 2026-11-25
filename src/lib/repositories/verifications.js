import { query } from '@/lib/server/db';
import { toUploadUrl } from '@/lib/shared/format';
import { MAX_CURATOR_APPEALS } from '@/lib/validators/verifications';

function mapCvMeta(cvPath, url) {
  if (!cvPath) {
    return { has_cv: false, cv_ext: null, cv_url: null };
  }
  const dotIdx = cvPath.lastIndexOf('.');
  const cvExt = dotIdx >= 0 ? cvPath.slice(dotIdx + 1).toLowerCase() : null;
  return {
    has_cv: true,
    cv_ext: cvExt,
    cv_url: url,
  };
}

export async function findVerificationHistoryByUserId(
  userId,
  client = null,
  { isAdmin = false } = {}
) {
  const { rows } = await query(
    `SELECT
       cv.verification_id,
       cv.user_id,
       cv.reviewed_by,
       cv.status,
       cv.note,
       cv.appeal_note,
       cv.cv_path,
       cv.submitted_at,
       cv.reviewed_at,
       ru.username AS reviewer_username,
       rp.display_name AS reviewer_display_name
     FROM curator_verifications cv
     LEFT JOIN users ru ON ru.user_id = cv.reviewed_by
     LEFT JOIN profiles rp ON rp.user_id = ru.user_id
     WHERE cv.user_id = $1
     ORDER BY cv.submitted_at ASC, cv.verification_id ASC`,
    [userId],
    client
  );

  return rows.map(({ cv_path: cvPath, ...row }, idx) => ({
    ...row,
    ...mapCvMeta(
      cvPath,
      isAdmin
        ? `/api/admin/curator-verifications/${row.verification_id}/cv`
        : `/api/curator/verification/cv?verification_id=${row.verification_id}`
    ),
    attempt_number: idx + 1,
    appeal_number: idx,
    is_appeal: idx > 0,
  }));
}

export async function findLatestVerificationByUserId(userId, client = null) {
  const { rows } = await query(
    `SELECT
       cv.verification_id,
       cv.user_id,
       cv.reviewed_by,
       cv.status,
       cv.note,
       cv.appeal_note,
       cv.cv_path,
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
  const rawRow = rows[0];
  if (!rawRow) return null;

  const { cv_path: cvPath, ...row } = rawRow;
  const historyAsc = await findVerificationHistoryByUserId(userId, client);
  const totalAttempts = historyAsc.length;
  const appealCount = Math.max(0, totalAttempts - 1);
  const remainingAppeals = Math.max(0, MAX_CURATOR_APPEALS - appealCount);
  const currentAttempt =
    historyAsc.find((item) => item.verification_id === row.verification_id)
      ?.attempt_number ?? totalAttempts;

  return {
    ...row,
    ...mapCvMeta(cvPath, '/api/curator/verification/cv'),
    avatar_url: toUploadUrl(row.avatar_path),
    attempt_number: currentAttempt,
    appeal_number: Math.max(0, currentAttempt - 1),
    total_attempts: totalAttempts,
    appeal_count: appealCount,
    max_appeals: MAX_CURATOR_APPEALS,
    remaining_appeals: remainingAppeals,
    can_appeal:
      row.status === 'rejected' &&
      row.user_status === 'pending' &&
      remainingAppeals > 0,
    history: [...historyAsc].reverse(),
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
         cv.appeal_note,
         cv.cv_path,
         cv.submitted_at,
         cv.reviewed_at,
         u.username,
         u.email,
         u.status AS user_status,
         p.display_name,
         p.website,
         (
           SELECT COUNT(*)::int
           FROM curator_verifications cv2
           WHERE cv2.user_id = cv.user_id
             AND (
               cv2.submitted_at < cv.submitted_at
               OR (cv2.submitted_at = cv.submitted_at AND cv2.verification_id <= cv.verification_id)
             )
         ) AS attempt_number,
         COUNT(*) OVER()::int AS total_count
       FROM curator_verifications cv
       JOIN users u ON u.user_id = cv.user_id
       LEFT JOIN profiles p ON p.user_id = u.user_id
       ${whereClause}
       ORDER BY
         CASE WHEN cv.status = 'pending' THEN 0 ELSE 1 END,
         CASE WHEN cv.status = 'pending' THEN cv.submitted_at END ASC,
         CASE WHEN cv.status = 'pending' THEN cv.verification_id END ASC,
         cv.submitted_at DESC,
         cv.verification_id DESC
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
    items: listRes.rows.map(({ cv_path: cvPath, ...row }) => ({
      ...row,
      ...mapCvMeta(
        cvPath,
        `/api/admin/curator-verifications/${row.verification_id}/cv`
      ),
      appeal_number: Math.max(0, (row.attempt_number ?? 1) - 1),
    })),
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
       cv.appeal_note,
       cv.cv_path,
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

  const rawRow = rows[0];
  if (!rawRow) return null;

  const { cv_path: cvPath, ...row } = rawRow;
  const historyAsc = await findVerificationHistoryByUserId(row.user_id, client, {
    isAdmin: true,
  });
  const totalAttempts = historyAsc.length;
  const appealCount = Math.max(0, totalAttempts - 1);
  const attemptNumber =
    historyAsc.find((item) => item.verification_id === row.verification_id)
      ?.attempt_number ?? totalAttempts;

  return {
    ...row,
    ...mapCvMeta(
      cvPath,
      `/api/admin/curator-verifications/${row.verification_id}/cv`
    ),
    avatar_url: toUploadUrl(row.avatar_path),
    attempt_number: attemptNumber,
    appeal_number: Math.max(0, attemptNumber - 1),
    total_attempts: totalAttempts,
    appeal_count: appealCount,
    max_appeals: MAX_CURATOR_APPEALS,
    remaining_appeals: Math.max(0, MAX_CURATOR_APPEALS - appealCount),
    history: [...historyAsc].reverse(),
  };
}

export async function findCuratorCvRecord(
  userId,
  verificationId = null,
  client = null
) {
  const params = [userId];
  let whereExtra = '';
  if (verificationId) {
    params.push(verificationId);
    whereExtra = 'AND cv.verification_id = $2';
  }

  const { rows } = await query(
    `SELECT cv.verification_id, cv.cv_path, u.username
     FROM curator_verifications cv
     JOIN users u ON u.user_id = cv.user_id
     WHERE cv.user_id = $1 ${whereExtra}
     ORDER BY cv.submitted_at DESC, cv.verification_id DESC
     LIMIT 1`,
    params,
    client
  );
  return rows[0] || null;
}

export async function findAdminCvRecord(verificationId, client = null) {
  const { rows } = await query(
    `SELECT cv.verification_id, cv.cv_path, u.username
     FROM curator_verifications cv
     JOIN users u ON u.user_id = cv.user_id
     WHERE cv.verification_id = $1
     LIMIT 1`,
    [verificationId],
    client
  );
  return rows[0] || null;
}

export async function listCuratorCvPathsByUserId(userId, client = null) {
  const { rows } = await query(
    `SELECT DISTINCT cv_path
     FROM curator_verifications
     WHERE user_id = $1 AND cv_path IS NOT NULL`,
    [userId],
    client
  );
  return rows.map((r) => r.cv_path).filter(Boolean);
}

export async function lockCuratorUserRow(userId, client) {
  const { rows } = await query(
    `SELECT user_id, role, status
     FROM users
     WHERE user_id = $1
     FOR UPDATE`,
    [userId],
    client
  );
  return rows[0] || null;
}

export async function createCuratorAppealRow(
  userId,
  appealNote,
  cvPath = null,
  client
) {
  const { rows } = await query(
    `INSERT INTO curator_verifications (user_id, status, appeal_note, cv_path)
     VALUES ($1, 'pending', $2, $3)
     RETURNING verification_id, user_id, reviewed_by, status, note, appeal_note, cv_path, submitted_at, reviewed_at`,
    [userId, appealNote, cvPath || null],
    client
  );
  return rows[0];
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
     WHERE user_id = $1 AND role = 'curator' AND status = 'pending'`,
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
