import { query } from '@/lib/server/db';
import { daysRemaining, syncChallengeStatuses } from '@/lib/server/challenge-status';
import { toUploadUrl } from '@/lib/shared/format';

function mapChallengeRow(row) {
  return {
    challenge_id: row.challenge_id,
    curator_id: row.curator_id,
    category_id: row.category_id,
    title: row.title,
    description: row.description || '',
    rules: row.rules || '',
    prize: row.prize || '',
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    created_at: row.created_at,
    announced_at: row.announced_at || null,
    days_remaining: daysRemaining(row.end_date),
    submission_count: row.submission_count ?? 0,
    banner_url: toUploadUrl(row.banner_path),
    cover_image_url: toUploadUrl(row.cover_image_path),
    category: row.category_id
      ? {
          category_id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        }
      : null,
    curator: {
      user_id: row.curator_id,
      username: row.curator_username,
      display_name: row.curator_display_name || row.curator_username,
      avatar_url: toUploadUrl(row.curator_avatar_path),
    },
  };
}

export async function listPublicChallenges({
  status = '',
  q = '',
  page = 1,
  limit = 12,
} = {}) {
  await syncChallengeStatuses();

  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [`ch.status <> 'draft'`];

  if (['open', 'closed', 'announced'].includes(status)) {
    params.push(status);
    conditions.push(`ch.status = $${params.length}`);
  } else if (status === 'ended') {
    conditions.push(`ch.status IN ('closed', 'announced')`);
  }

  const cleanQ = q.trim();
  if (cleanQ) {
    params.push(`%${cleanQ}%`);
    const idx = params.length;
    conditions.push(
      `(ch.title ILIKE $${idx} OR COALESCE(ch.description, '') ILIKE $${idx})`
    );
  }

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query(
    `SELECT
       ch.challenge_id,
       ch.curator_id,
       ch.category_id,
       ch.title,
       ch.description,
       ch.rules,
       ch.prize,
       ch.banner_path,
       ch.start_date,
       ch.end_date,
       ch.status,
       ch.created_at,
       c.name AS category_name,
       c.slug AS category_slug,
       u.username AS curator_username,
       p.display_name AS curator_display_name,
       p.avatar_path AS curator_avatar_path,
       COALESCE(sc.cnt, 0)::int AS submission_count,
       cov.image_path AS cover_image_path,
       wn.announced_at,
       COUNT(*) OVER()::int AS total_count
     FROM challenges ch
     JOIN users u ON u.user_id = ch.curator_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN categories c ON c.category_id = ch.category_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = ch.challenge_id
         AND s.status = 'submitted'
         AND a.status = 'published'
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
     ORDER BY
       CASE ch.status
         WHEN 'open' THEN 1
         WHEN 'announced' THEN 2
         ELSE 3
       END,
       ch.end_date ASC,
       ch.created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapChallengeRow),
    meta: { page, limit, total },
  };
}

export async function findPublicChallengeById(challengeId) {
  await syncChallengeStatuses();

  const { rows } = await query(
    `SELECT
       ch.challenge_id,
       ch.curator_id,
       ch.category_id,
       ch.title,
       ch.description,
       ch.rules,
       ch.prize,
       ch.banner_path,
       ch.start_date,
       ch.end_date,
       ch.status,
       ch.created_at,
       c.name AS category_name,
       c.slug AS category_slug,
       u.username AS curator_username,
       p.display_name AS curator_display_name,
       p.avatar_path AS curator_avatar_path,
       COALESCE(sc.cnt, 0)::int AS submission_count,
       cov.image_path AS cover_image_path,
       wn.announced_at
     FROM challenges ch
     JOIN users u ON u.user_id = ch.curator_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN categories c ON c.category_id = ch.category_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = ch.challenge_id
         AND s.status = 'submitted'
         AND a.status = 'published'
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
     WHERE ch.challenge_id = $1 AND ch.status <> 'draft'
     LIMIT 1`,
    [challengeId]
  );

  return rows[0] ? mapChallengeRow(rows[0]) : null;
}

export async function listPublicChallengeSubmissions(
  challengeId,
  { page = 1, limit = 24 } = {}
) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT
       s.submission_id,
       s.challenge_id,
       s.artwork_id,
       s.submitted_at,
       a.title,
       a.image_path,
       a.status AS artwork_status,
       c.category_id,
       c.name AS category_name,
       c.slug AS category_slug,
       u.user_id AS creator_user_id,
       u.username AS creator_username,
       p.display_name AS creator_display_name,
       p.avatar_path AS creator_avatar_path,
       COALESCE(lk.cnt, 0)::int AS like_count,
       COALESCE(cm.cnt, 0)::int AS comment_count,
       COUNT(*) OVER()::int AS total_count
     FROM submissions s
     JOIN artworks a ON a.artwork_id = s.artwork_id
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM likes l WHERE l.artwork_id = a.artwork_id
     ) lk ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM comments cm2 WHERE cm2.artwork_id = a.artwork_id AND cm2.status = 'visible'
     ) cm ON TRUE
     WHERE s.challenge_id = $1
       AND s.status = 'submitted'
       AND a.status = 'published'
     ORDER BY s.submitted_at DESC, s.submission_id DESC
     LIMIT $2 OFFSET $3`,
    [challengeId, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map((row) => ({
      submission_id: row.submission_id,
      challenge_id: row.challenge_id,
      artwork_id: row.artwork_id,
      submitted_at: row.submitted_at,
      artwork: {
        artwork_id: row.artwork_id,
        title: row.title,
        image_url: toUploadUrl(row.image_path),
        status: row.artwork_status,
        like_count: row.like_count ?? 0,
        comment_count: row.comment_count ?? 0,
        category: {
          category_id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        },
        creator: {
          user_id: row.creator_user_id,
          username: row.creator_username,
          display_name: row.creator_display_name || row.creator_username,
          avatar_url: toUploadUrl(row.creator_avatar_path),
        },
      },
    })),
    meta: { page, limit, total },
  };
}

function mapWinnerRow(row) {
  const isModerated = row.artwork_status !== 'published';
  return {
    winner_id: row.winner_id,
    challenge_id: row.challenge_id,
    challenge_title: row.challenge_title,
    submission_id: row.submission_id,
    rank: row.rank,
    announced_at: row.announced_at,
    is_moderated: isModerated,
    artwork: {
      artwork_id: row.artwork_id,
      title: isModerated ? 'Karya telah dihapus oleh moderasi' : row.artwork_title,
      image_url: isModerated ? null : toUploadUrl(row.artwork_image_path),
      status: row.artwork_status,
    },
    creator: {
      user_id: row.creator_user_id,
      username: row.creator_username,
      display_name: row.creator_display_name || row.creator_username,
    },
  };
}

export async function listChallengeWinners(challengeId) {
  const { rows } = await query(
    `SELECT
       w.winner_id,
       w.challenge_id,
       ch.title AS challenge_title,
       w.submission_id,
       w.rank,
       w.announced_at,
       a.artwork_id,
       a.title AS artwork_title,
       a.image_path AS artwork_image_path,
       a.status AS artwork_status,
       u.user_id AS creator_user_id,
       u.username AS creator_username,
       p.display_name AS creator_display_name
     FROM winners w
     JOIN challenges ch ON ch.challenge_id = w.challenge_id
     JOIN submissions s ON s.submission_id = w.submission_id
     JOIN artworks a ON a.artwork_id = s.artwork_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE w.challenge_id = $1
     ORDER BY w.rank ASC`,
    [challengeId]
  );

  return rows.map(mapWinnerRow);
}

export async function listLatestAnnouncedWinners() {
  const { rows: latestChallenge } = await query(
    `SELECT ch.challenge_id, ch.title
     FROM challenges ch
     WHERE ch.status = 'announced'
     ORDER BY (SELECT MIN(w.announced_at) FROM winners w WHERE w.challenge_id = ch.challenge_id) DESC NULLS LAST,
              ch.challenge_id DESC
     LIMIT 1`
  );

  if (!latestChallenge[0]) {
    return { challenge: null, winners: [] };
  }

  const winners = await listChallengeWinners(latestChallenge[0].challenge_id);
  return {
    challenge: latestChallenge[0],
    winners,
  };
}
