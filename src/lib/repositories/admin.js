import { query } from '@/lib/server/db';
import { syncChallengeStatuses } from '@/lib/server/challenge-status';
import { toUploadUrl } from '@/lib/shared/format';

export async function getAdminPlatformStats() {
  await syncChallengeStatuses();

  const [
    usersRes,
    artworksRes,
    challengesRes,
    submissionsRes,
    categoriesRes,
    verificationsRes,
    reportsRes,
    pendingQueueRes,
    userStatusByRoleRes,
    recentActivitiesRes,
  ] = await Promise.all([
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE role = 'member')::int AS member,
         COUNT(*) FILTER (WHERE role = 'curator')::int AS curator,
         COUNT(*) FILTER (WHERE role = 'admin')::int AS admin,
         COUNT(*) FILTER (WHERE status = 'active')::int AS active,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'suspended')::int AS suspended
       FROM users`
    ),
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'published')::int AS published,
         COUNT(*) FILTER (WHERE status = 'hidden')::int AS hidden,
         COUNT(*) FILTER (WHERE status = 'removed')::int AS removed
       FROM artworks`
    ),
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
         COUNT(*) FILTER (WHERE status = 'open')::int AS open,
         COUNT(*) FILTER (WHERE status = 'closed')::int AS closed,
         COUNT(*) FILTER (WHERE status = 'announced')::int AS announced
       FROM challenges`
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'submitted')::int AS active_submissions,
         COUNT(*)::int AS total_submissions
       FROM submissions`
    ),
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE is_active)::int AS active
       FROM categories`
    ),
    query(
      `SELECT COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_verifications
       FROM curator_verifications`
    ),
    query(
      `SELECT COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_reports
       FROM reports`
    ),
    query(
      `(
         SELECT
           'verification' AS type,
           cv.verification_id AS item_id,
           COALESCE(p.display_name, u.username) AS title,
           CASE
             WHEN cv.appeal_note IS NOT NULL THEN 'Banding Kurator'
             ELSE 'Pengajuan Kurator'
           END AS category_label,
           cv.submitted_at AS created_at
         FROM curator_verifications cv
         JOIN users u ON u.user_id = cv.user_id
         LEFT JOIN profiles p ON p.user_id = u.user_id
         WHERE cv.status = 'pending'
       )
       UNION ALL
       (
         SELECT
           'report' AS type,
           r.report_id AS item_id,
           a.title AS title,
           'Laporan Karya (' || r.reason || ')' AS category_label,
           r.created_at AS created_at
         FROM reports r
         JOIN artworks a ON a.artwork_id = r.artwork_id
         WHERE r.status = 'pending'
       )
       ORDER BY created_at ASC
       LIMIT 10`
    ),
    query(
      `SELECT
         role::text AS role,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'active')::int AS active,
         COUNT(*) FILTER (WHERE status = 'suspended')::int AS suspended,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
       FROM users
       GROUP BY role`
    ),
    query(
      `(
         SELECT
           'verification' AS type,
           cv.verification_id AS item_id,
           COALESCE(p.display_name, u.username) AS title,
           u.username AS actor_handle,
           CASE
             WHEN cv.appeal_note IS NOT NULL THEN 'Banding Kurator'
             ELSE 'Pengajuan Kurator'
           END AS category_label,
           cv.status::text AS status,
           cv.submitted_at AS created_at
         FROM curator_verifications cv
         JOIN users u ON u.user_id = cv.user_id
         LEFT JOIN profiles p ON p.user_id = u.user_id
       )
       UNION ALL
       (
         SELECT
           'report' AS type,
           r.report_id AS item_id,
           a.title AS title,
           COALESCE(rep_p.display_name, rep.username) AS actor_handle,
           'Laporan Karya (' || r.reason || ')' AS category_label,
           r.status::text AS status,
           r.created_at AS created_at
         FROM reports r
         JOIN artworks a ON a.artwork_id = r.artwork_id
         JOIN users rep ON rep.user_id = r.reporter_id
         LEFT JOIN profiles rep_p ON rep_p.user_id = rep.user_id
       )
       ORDER BY created_at DESC
       LIMIT 20`
    ),
  ]);

  const roleBreakdown = {
    member: { total: 0, active: 0, suspended: 0, pending: 0 },
    curator: { total: 0, active: 0, suspended: 0, pending: 0 },
    admin: { total: 0, active: 0, suspended: 0, pending: 0 },
  };
  for (const row of userStatusByRoleRes.rows) {
    if (roleBreakdown[row.role]) {
      roleBreakdown[row.role] = {
        total: row.total ?? 0,
        active: row.active ?? 0,
        suspended: row.suspended ?? 0,
        pending: row.pending ?? 0,
      };
    }
  }

  const usersRow = usersRes.rows[0] || {
    total: 0,
    member: 0,
    curator: 0,
    admin: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  };

  return {
    users: usersRow,
    user_status_by_role: {
      all: {
        total: usersRow.total ?? 0,
        active: usersRow.active ?? 0,
        suspended: usersRow.suspended ?? 0,
        pending: usersRow.pending ?? 0,
      },
      ...roleBreakdown,
    },
    artworks: artworksRes.rows[0],
    challenges: challengesRes.rows[0],
    submissions: submissionsRes.rows[0],
    categories: categoriesRes.rows[0],
    pending_verifications: verificationsRes.rows[0]?.pending_verifications ?? 0,
    pending_reports: reportsRes.rows[0]?.pending_reports ?? 0,
    activity_queue: pendingQueueRes.rows,
    recent_activities: recentActivitiesRes.rows,
  };
}

export async function listAllAdminCategories() {
  const { rows } = await query(
    `SELECT
       c.*,
       (SELECT COUNT(*)::int FROM artworks a WHERE a.category_id = c.category_id) AS artwork_count,
       (SELECT COUNT(*)::int FROM challenges ch WHERE ch.category_id = c.category_id) AS challenge_count
     FROM categories c
     ORDER BY
       c.is_active DESC,
       CASE WHEN LOWER(c.slug) = 'lainnya' OR LOWER(c.name) = 'lainnya' THEN 1 ELSE 0 END ASC,
       c.category_id ASC`
  );
  return rows;
}

export async function insertCategoryRow({ name, slug, description }) {
  const { rows } = await query(
    `INSERT INTO categories (name, slug, description, is_active)
     VALUES ($1, $2, $3, TRUE)
     RETURNING *`,
    [name, slug, description || null]
  );
  return rows[0];
}

export async function updateCategoryRow(
  categoryId,
  { name, slug, description, isActive }
) {
  const { rows } = await query(
    `UPDATE categories
     SET name = COALESCE($2, name),
         slug = COALESCE($3, slug),
         description = CASE WHEN $4::text IS NULL THEN description ELSE NULLIF($4, '') END,
         is_active = COALESCE($5, is_active)
     WHERE category_id = $1
     RETURNING *`,
    [
      categoryId,
      name ?? null,
      slug ?? null,
      description === undefined ? null : description,
      isActive === undefined ? null : isActive,
    ]
  );
  return rows[0] || null;
}

export async function isCategoryInUse(categoryId) {
  const { rows } = await query(
    `SELECT
       (
         EXISTS(SELECT 1 FROM artworks WHERE category_id = $1)
         OR EXISTS(SELECT 1 FROM challenges WHERE category_id = $1)
       ) AS in_use`,
    [categoryId]
  );
  return Boolean(rows[0]?.in_use);
}

export async function deleteCategoryRow(categoryId) {
  const { rows } = await query(
    `DELETE FROM categories WHERE category_id = $1 RETURNING category_id`,
    [categoryId]
  );
  return rows[0] || null;
}

export async function listAdminUsers({
  role = '',
  status = '',
  q = '',
  page = 1,
  limit = 15,
} = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (['member', 'curator', 'admin'].includes(role)) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }
  if (['active', 'pending', 'suspended'].includes(status)) {
    params.push(status);
    conditions.push(`u.status = $${params.length}`);
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
         u.user_id,
         u.username,
         u.email,
         u.role,
         u.status,
         u.created_at,
         p.display_name,
         p.avatar_path,
         COUNT(*) OVER()::int AS total_count
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.user_id
       ${whereClause}
       ORDER BY u.created_at DESC, u.user_id DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params
    ),
    query(
      `SELECT
         COUNT(*)::int AS all,
         COUNT(*) FILTER (WHERE role = 'member')::int AS member,
         COUNT(*) FILTER (WHERE role = 'curator')::int AS curator,
         COUNT(*) FILTER (WHERE role = 'admin')::int AS admin
       FROM users`
    ),
  ]);

  const total = listRes.rows[0]?.total_count ?? 0;
  return {
    items: listRes.rows.map((r) => ({
      ...r,
      display_name: r.display_name || r.username,
      avatar_url: toUploadUrl(r.avatar_path),
    })),
    counts: countsRes.rows[0] || { all: 0, member: 0, curator: 0, admin: 0 },
    meta: { page, limit, total },
  };
}

export async function findAdminUserDetail(userId, client = null) {
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
       p.website,
       p.avatar_path,
       (
         (SELECT COUNT(*)::int FROM artworks WHERE user_id = u.user_id) +
         (SELECT COUNT(*)::int FROM challenges WHERE curator_id = u.user_id) +
         (SELECT COUNT(*)::int FROM comments WHERE user_id = u.user_id) +
         (SELECT COUNT(*)::int FROM likes WHERE user_id = u.user_id) +
         (SELECT COUNT(*)::int FROM favorites WHERE user_id = u.user_id) +
         (SELECT COUNT(*)::int FROM reports WHERE reporter_id = u.user_id OR handled_by = u.user_id) +
         (SELECT COUNT(*)::int FROM curator_verifications WHERE reviewed_by = u.user_id)
       )::int AS relation_count
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE u.user_id = $1
     LIMIT 1`,
    [userId],
    client
  );

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    display_name: row.display_name || row.username,
    avatar_url: toUploadUrl(row.avatar_path),
    has_relations: row.relation_count > 0,
  };
}

export async function updateUserStatusRow(userId, nextStatus, client = null) {
  const { rows } = await query(
    `UPDATE users
     SET status = $2
     WHERE user_id = $1
     RETURNING user_id, username, email, role, status, created_at`,
    [userId, nextStatus],
    client
  );
  return rows[0] || null;
}

export async function deleteUserRow(userId, client = null) {
  const { rows } = await query(
    `DELETE FROM users WHERE user_id = $1 RETURNING user_id`,
    [userId],
    client
  );
  return rows[0] || null;
}
