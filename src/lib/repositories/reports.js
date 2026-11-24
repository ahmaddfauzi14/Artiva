import { query } from '@/lib/server/db';
import { toUploadUrl } from '@/lib/shared/format';

export async function insertReportRow({
  reporterId,
  artworkId,
  reason,
  description,
}) {
  const { rows } = await query(
    `INSERT INTO reports (reporter_id, artwork_id, reason, description, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [reporterId, artworkId, reason, description || null]
  );
  return rows[0];
}

export async function listAdminReports({
  status = 'pending',
  q = '',
  page = 1,
  limit = 12,
} = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (['pending', 'resolved', 'dismissed'].includes(status)) {
    params.push(status);
    conditions.push(`r.status = $${params.length}`);
  }

  const cleanQ = q.trim();
  if (cleanQ) {
    params.push(`%${cleanQ}%`);
    const idx = params.length;
    conditions.push(
      `(a.title ILIKE $${idx} OR ru.username ILIKE $${idx} OR cu.username ILIKE $${idx} OR r.reason ILIKE $${idx})`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause =
    status === 'pending'
      ? 'r.created_at ASC, r.report_id ASC'
      : 'r.created_at DESC, r.report_id DESC';

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const [listRes, countsRes] = await Promise.all([
    query(
      `SELECT
         r.report_id,
         r.reason,
         r.description,
         r.status,
         r.resolution_note,
         r.created_at,
         a.artwork_id,
         a.title AS artwork_title,
         a.status AS artwork_status,
         a.image_path AS artwork_image_path,
         ru.username AS reporter_username,
         rp.display_name AS reporter_display_name,
         cu.username AS creator_username,
         cp.display_name AS creator_display_name,
         COUNT(*) OVER()::int AS total_count
       FROM reports r
       JOIN artworks a ON a.artwork_id = r.artwork_id
       JOIN users ru ON ru.user_id = r.reporter_id
       LEFT JOIN profiles rp ON rp.user_id = ru.user_id
       JOIN users cu ON cu.user_id = a.user_id
       LEFT JOIN profiles cp ON cp.user_id = cu.user_id
       ${whereClause}
       ORDER BY ${orderClause}
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params
    ),
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
         COUNT(*) FILTER (WHERE status = 'dismissed')::int AS dismissed
       FROM reports`
    ),
  ]);

  const total = listRes.rows[0]?.total_count ?? 0;
  return {
    items: listRes.rows.map((row) => ({
      ...row,
      artwork_image_url: toUploadUrl(row.artwork_image_path),
    })),
    counts: countsRes.rows[0] || { pending: 0, resolved: 0, dismissed: 0 },
    meta: { page, limit, total },
  };
}

export async function findAdminReportDetail(reportId, client = null) {
  const { rows } = await query(
    `SELECT
       r.*,
       a.title AS artwork_title,
       a.description AS artwork_description,
       a.image_path AS artwork_image_path,
       a.status AS artwork_status,
       a.user_id AS creator_user_id,
       c.name AS category_name,
       cu.username AS creator_username,
       cp.display_name AS creator_display_name,
       ru.username AS reporter_username,
       rp.display_name AS reporter_display_name,
       hu.username AS handler_username,
       hp.display_name AS handler_display_name
     FROM reports r
     JOIN artworks a ON a.artwork_id = r.artwork_id
     JOIN categories c ON c.category_id = a.category_id
     JOIN users cu ON cu.user_id = a.user_id
     LEFT JOIN profiles cp ON cp.user_id = cu.user_id
     JOIN users ru ON ru.user_id = r.reporter_id
     LEFT JOIN profiles rp ON rp.user_id = ru.user_id
     LEFT JOIN users hu ON hu.user_id = r.handled_by
     LEFT JOIN profiles hp ON hp.user_id = hu.user_id
     WHERE r.report_id = $1
     LIMIT 1`,
    [reportId],
    client
  );

  const row = rows[0];
  if (!row) return null;

  const { rows: relatedRows } = await query(
    `SELECT
       r.report_id,
       r.reason,
       r.description,
       r.status,
       r.resolution_note,
       r.created_at,
       ru.username AS reporter_username,
       rp.display_name AS reporter_display_name
     FROM reports r
     JOIN users ru ON ru.user_id = r.reporter_id
     LEFT JOIN profiles rp ON rp.user_id = ru.user_id
     WHERE r.artwork_id = $1 AND r.report_id <> $2
     ORDER BY r.created_at DESC`,
    [row.artwork_id, reportId],
    client
  );

  return {
    ...row,
    artwork_image_url: toUploadUrl(row.artwork_image_path),
    other_reports: relatedRows,
  };
}

export async function lockReportRow(reportId, client) {
  const { rows } = await query(
    `SELECT report_id, artwork_id, status
     FROM reports
     WHERE report_id = $1
     FOR UPDATE`,
    [reportId],
    client
  );
  return rows[0] || null;
}

export async function updateReportDecision(
  reportId,
  { status, handledBy, resolutionNote },
  client
) {
  const { rows } = await query(
    `UPDATE reports
     SET status = $2,
         handled_by = $3,
         resolution_note = $4
     WHERE report_id = $1
     RETURNING *`,
    [reportId, status, handledBy, resolutionNote],
    client
  );
  return rows[0];
}

export async function resolveOtherPendingReports(
  artworkId,
  primaryReportId,
  handledBy,
  client
) {
  const autoNote = `Ditangani melalui laporan #${primaryReportId}`;
  await query(
    `UPDATE reports
     SET status = 'resolved',
         handled_by = $2,
         resolution_note = $3
     WHERE artwork_id = $1
       AND status = 'pending'
       AND report_id <> $4`,
    [artworkId, handledBy, autoNote, primaryReportId],
    client
  );
}

export async function moderateArtworkStatus(artworkId, nextStatus, client) {
  await query(
    `UPDATE artworks
     SET status = $2,
         updated_at = now()
     WHERE artwork_id = $1`,
    [artworkId, nextStatus],
    client
  );
}
