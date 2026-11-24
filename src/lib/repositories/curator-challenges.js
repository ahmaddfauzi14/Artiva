import { query } from '@/lib/server/db';
import { daysRemaining, syncChallengeStatuses } from '@/lib/server/challenge-status';
import { toUploadUrl } from '@/lib/shared/format';

function mapCuratorChallengeRow(row) {
  return {
    challenge_id: row.challenge_id,
    curator_id: row.curator_id,
    category_id: row.category_id,
    title: row.title,
    description: row.description || '',
    rules: row.rules || '',
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    created_at: row.created_at,
    announced_at: row.announced_at || null,
    days_remaining: daysRemaining(row.end_date),
    submission_count: row.submission_count ?? 0,
    total_submissions: row.total_submissions ?? 0,
    cover_image_url: toUploadUrl(row.cover_image_path),
    category: row.category_id
      ? {
          category_id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
  };
}

export async function listCuratorChallenges(curatorId, { status = '', page = 1, limit = 50 } = {}) {
  await syncChallengeStatuses();

  const offset = (page - 1) * limit;
  const params = [curatorId];
  const conditions = [`ch.curator_id = $1`];

  if (['draft', 'open', 'closed', 'announced'].includes(status)) {
    params.push(status);
    conditions.push(`ch.status = $${params.length}`);
  }

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query(
    `SELECT
       ch.*,
       c.name AS category_name,
       c.slug AS category_slug,
       COALESCE(sc.active_cnt, 0)::int AS submission_count,
       COALESCE(sc.all_cnt, 0)::int AS total_submissions,
       cov.image_path AS cover_image_path,
       wn.announced_at,
       COUNT(*) OVER()::int AS total_count
     FROM challenges ch
     LEFT JOIN categories c ON c.category_id = ch.category_id
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) FILTER (WHERE s.status = 'submitted' AND a.status = 'published')::int AS active_cnt,
         COUNT(*)::int AS all_cnt
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = ch.challenge_id
     ) sc ON TRUE
     LEFT JOIN LATERAL (
       SELECT a.image_path
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = ch.challenge_id
         AND s.status = 'submitted'
         AND a.status = 'published'
       ORDER BY s.submitted_at DESC
       LIMIT 1
     ) cov ON TRUE
     LEFT JOIN LATERAL (
       SELECT MIN(w.announced_at) AS announced_at
       FROM winners w
       WHERE w.challenge_id = ch.challenge_id
     ) wn ON TRUE
     WHERE ${conditions.join(' AND ')}
     ORDER BY ch.created_at DESC, ch.challenge_id DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapCuratorChallengeRow),
    meta: { page, limit, total },
  };
}

export async function findCuratorChallengeById(
  challengeId,
  curatorId,
  client = null,
  forUpdate = false
) {
  await syncChallengeStatuses(client);

  const lockClause = forUpdate ? 'FOR UPDATE OF ch' : '';
  const { rows } = await query(
    `SELECT
       ch.*,
       c.name AS category_name,
       c.slug AS category_slug,
       COALESCE(sc.active_cnt, 0)::int AS submission_count,
       COALESCE(sc.all_cnt, 0)::int AS total_submissions,
       cov.image_path AS cover_image_path,
       wn.announced_at
     FROM challenges ch
     LEFT JOIN categories c ON c.category_id = ch.category_id
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) FILTER (WHERE s.status = 'submitted' AND a.status = 'published')::int AS active_cnt,
         COUNT(*)::int AS all_cnt
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = ch.challenge_id
     ) sc ON TRUE
     LEFT JOIN LATERAL (
       SELECT a.image_path
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = ch.challenge_id
         AND s.status = 'submitted'
         AND a.status = 'published'
       ORDER BY s.submitted_at DESC
       LIMIT 1
     ) cov ON TRUE
     LEFT JOIN LATERAL (
       SELECT MIN(w.announced_at) AS announced_at
       FROM winners w
       WHERE w.challenge_id = ch.challenge_id
     ) wn ON TRUE
     WHERE ch.challenge_id = $1 AND ch.curator_id = $2
     LIMIT 1
     ${lockClause}`,
    [challengeId, curatorId],
    client
  );

  return rows[0] ? mapCuratorChallengeRow(rows[0]) : null;
}

export async function existsCuratorChallengeTitle(
  curatorId,
  title,
  excludeChallengeId = null,
  client = null
) {
  const params = [curatorId, title];
  let excludeClause = '';
  if (excludeChallengeId !== null && excludeChallengeId !== undefined) {
    params.push(excludeChallengeId);
    excludeClause = `AND challenge_id <> $${params.length}`;
  }

  const { rowCount } = await query(
    `SELECT 1
     FROM challenges
     WHERE curator_id = $1
       AND LOWER(BTRIM(title)) = LOWER(BTRIM($2))
       ${excludeClause}
     LIMIT 1`,
    params,
    client
  );
  return rowCount > 0;
}

export async function insertChallengeRow(
  { curatorId, categoryId, title, description, rules, startDate, endDate, status },
  client = null
) {
  const { rows } = await query(
    `INSERT INTO challenges (curator_id, category_id, title, description, rules, start_date, end_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING challenge_id`,
    [
      curatorId,
      categoryId ?? null,
      title,
      description || null,
      rules || null,
      startDate,
      endDate,
      status,
    ],
    client
  );
  return findCuratorChallengeById(rows[0].challenge_id, curatorId, client);
}

export async function updateChallengeRow(
  challengeId,
  curatorId,
  { categoryId, hasCategoryUpdate, title, description, rules, startDate, endDate, status },
  client = null
) {
  await query(
    `UPDATE challenges
     SET title = COALESCE($3, title),
         description = CASE WHEN $4::text IS NULL THEN description ELSE NULLIF($4, '') END,
         rules = CASE WHEN $5::text IS NULL THEN rules ELSE NULLIF($5, '') END,
         category_id = CASE WHEN $6::boolean THEN $7::int ELSE category_id END,
         start_date = COALESCE($8::date, start_date),
         end_date = COALESCE($9::date, end_date),
         status = COALESCE($10::challenge_status, status)
     WHERE challenge_id = $1 AND curator_id = $2`,
    [
      challengeId,
      curatorId,
      title ?? null,
      description === undefined ? null : description,
      rules === undefined ? null : rules,
      Boolean(hasCategoryUpdate),
      categoryId ?? null,
      startDate ?? null,
      endDate ?? null,
      status ?? null,
    ],
    client
  );
  return findCuratorChallengeById(challengeId, curatorId, client);
}

export async function deleteChallengeRow(challengeId, curatorId, client = null) {
  const { rows } = await query(
    `DELETE FROM challenges
     WHERE challenge_id = $1 AND curator_id = $2
     RETURNING challenge_id`,
    [challengeId, curatorId],
    client
  );
  return rows[0] || null;
}

export async function listCuratorChallengeSubmissions(
  challengeId,
  { status = 'submitted', page = 1, limit = 24 } = {}
) {
  const offset = (page - 1) * limit;
  const params = [challengeId];
  const conditions = [`s.challenge_id = $1`];

  if (status === 'submitted' || status === 'withdrawn') {
    params.push(status);
    conditions.push(`s.status = $${params.length}`);
  }

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query(
    `SELECT
       s.submission_id,
       s.challenge_id,
       s.artwork_id,
       s.status,
       s.submitted_at,
       s.withdrawn_at,
       a.title AS artwork_title,
       a.image_path AS artwork_image_path,
       a.status AS artwork_status,
       c.category_id,
       c.name AS category_name,
       u.user_id AS creator_user_id,
       u.username AS creator_username,
       p.display_name AS creator_display_name,
       w.winner_id,
       w.rank AS winner_rank,
       COUNT(*) OVER()::int AS total_count
     FROM submissions s
     JOIN artworks a ON a.artwork_id = s.artwork_id
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN winners w ON w.submission_id = s.submission_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.submitted_at DESC, s.submission_id DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map((row) => ({
      submission_id: row.submission_id,
      challenge_id: row.challenge_id,
      artwork_id: row.artwork_id,
      status: row.status,
      submitted_at: row.submitted_at,
      withdrawn_at: row.withdrawn_at,
      winner_rank: row.winner_rank || null,
      is_moderated: row.artwork_status !== 'published',
      artwork: {
        artwork_id: row.artwork_id,
        title: row.artwork_title,
        image_url:
          row.artwork_status === 'published'
            ? toUploadUrl(row.artwork_image_path)
            : null,
        status: row.artwork_status,
        category: {
          category_id: row.category_id,
          name: row.category_name,
        },
      },
      creator: {
        user_id: row.creator_user_id,
        username: row.creator_username,
        display_name: row.creator_display_name || row.creator_username,
      },
    })),
    meta: { page, limit, total },
  };
}
