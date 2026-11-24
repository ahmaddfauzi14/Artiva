import { query } from '@/lib/server/db';
import {
  daysRemaining,
  syncChallengeStatuses,
} from '@/lib/server/challenge-status';
import { toUploadUrl } from '@/lib/shared/format';

export async function listEligibleArtworks(userId, challenge) {
  const params = [userId, challenge.challenge_id];
  let categoryCondition = '';
  if (challenge.category_id) {
    params.push(challenge.category_id);
    categoryCondition = `AND a.category_id = $3`;
  }

  const { rows } = await query(
    `SELECT
       a.artwork_id,
       a.title,
       a.image_path,
       a.created_at,
       c.category_id,
       c.name AS category_name,
       s.submission_id,
       s.status AS submission_status
     FROM artworks a
     JOIN categories c ON c.category_id = a.category_id
     LEFT JOIN submissions s
       ON s.artwork_id = a.artwork_id AND s.challenge_id = $2
     WHERE a.user_id = $1
       AND a.status = 'published'
       ${categoryCondition}
     ORDER BY
       CASE WHEN s.status = 'submitted' THEN 1 ELSE 0 END ASC,
       a.created_at DESC,
       a.artwork_id DESC`,
    params
  );

  return rows.map((row) => ({
    artwork_id: row.artwork_id,
    title: row.title,
    image_url: toUploadUrl(row.image_path),
    created_at: row.created_at,
    category: {
      category_id: row.category_id,
      name: row.category_name,
    },
    already_submitted: row.submission_status === 'submitted',
    previously_withdrawn: row.submission_status === 'withdrawn',
  }));
}

export async function listMemberSubmissions(
  userId,
  { page = 1, limit = 24 } = {}
) {
  await syncChallengeStatuses();

  const offset = (page - 1) * limit;
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
       ch.title AS challenge_title,
       ch.status AS challenge_status,
       ch.start_date AS challenge_start_date,
       ch.end_date AS challenge_end_date,
       w.rank AS winner_rank,
       COUNT(*) OVER()::int AS total_count
     FROM submissions s
     JOIN artworks a ON a.artwork_id = s.artwork_id
     JOIN challenges ch ON ch.challenge_id = s.challenge_id
     LEFT JOIN winners w ON w.submission_id = s.submission_id
     WHERE a.user_id = $1
     ORDER BY s.submitted_at DESC, s.submission_id DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map((row) => ({
      submission_id: row.submission_id,
      status: row.status,
      submitted_at: row.submitted_at,
      withdrawn_at: row.withdrawn_at,
      winner_rank: row.winner_rank || null,
      artwork: {
        artwork_id: row.artwork_id,
        title: row.artwork_title,
        image_url:
          row.artwork_status !== 'removed'
            ? toUploadUrl(row.artwork_image_path)
            : null,
        status: row.artwork_status,
      },
      challenge: {
        challenge_id: row.challenge_id,
        title: row.challenge_title,
        status: row.challenge_status,
        start_date: row.challenge_start_date,
        end_date: row.challenge_end_date,
      },
    })),
    meta: { page, limit, total },
  };
}

export async function listMemberJoinedChallenges(
  userId,
  { page = 1, limit = 50 } = {}
) {
  await syncChallengeStatuses();

  const offset = (page - 1) * limit;
  const { rows } = await query(
    `WITH my_ch AS (
       SELECT
         s.challenge_id,
         COUNT(*) FILTER (WHERE s.status = 'submitted')::int AS my_active_submissions,
         COUNT(*) FILTER (WHERE s.status = 'withdrawn')::int AS my_withdrawn_submissions,
         COUNT(*)::int AS my_total_submissions,
         MAX(s.submitted_at) AS last_submitted_at,
         MIN(w.rank) FILTER (WHERE s.status = 'submitted') AS best_winner_rank
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       LEFT JOIN winners w ON w.submission_id = s.submission_id
       WHERE a.user_id = $1
       GROUP BY s.challenge_id
     )
     SELECT
       ch.challenge_id,
       ch.curator_id,
       ch.category_id,
       ch.title,
       ch.description,
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
       mc.my_active_submissions,
       mc.my_withdrawn_submissions,
       mc.my_total_submissions,
       mc.last_submitted_at,
       mc.best_winner_rank,
       COUNT(*) OVER()::int AS total_count
     FROM my_ch mc
     JOIN challenges ch ON ch.challenge_id = mc.challenge_id
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
     ORDER BY
       CASE ch.status
         WHEN 'open' THEN 1
         WHEN 'closed' THEN 2
         WHEN 'announced' THEN 3
         ELSE 4
       END ASC,
       mc.last_submitted_at DESC,
       ch.challenge_id DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map((row) => ({
      challenge_id: row.challenge_id,
      curator_id: row.curator_id,
      category_id: row.category_id,
      title: row.title,
      description: row.description || '',
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      created_at: row.created_at,
      days_remaining: daysRemaining(row.end_date),
      submission_count: row.submission_count ?? 0,
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
      participation: {
        active_count: row.my_active_submissions ?? 0,
        withdrawn_count: row.my_withdrawn_submissions ?? 0,
        total_count: row.my_total_submissions ?? 0,
        last_submitted_at: row.last_submitted_at,
        best_winner_rank: row.best_winner_rank || null,
      },
    })),
    meta: { page, limit, total },
  };
}
