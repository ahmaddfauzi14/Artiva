import { query } from '@/lib/server/db';
import { mapArtworkRow } from '@/lib/repositories/artworks';
import { toUploadUrl } from '@/lib/shared/format';

export async function findPublishedArtworkCheck(artworkId, client = null) {
  const { rows } = await query(
    `SELECT artwork_id, user_id, status
     FROM artworks
     WHERE artwork_id = $1
     LIMIT 1`,
    [artworkId],
    client
  );
  const row = rows[0];
  if (!row || row.status !== 'published') return null;
  return row;
}

export async function putLikeRow(userId, artworkId) {
  await query(
    `INSERT INTO likes (user_id, artwork_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, artwork_id) DO NOTHING`,
    [userId, artworkId]
  );
  const { rows } = await query(
    `SELECT COUNT(*)::int AS like_count FROM likes WHERE artwork_id = $1`,
    [artworkId]
  );
  return { liked: true, like_count: rows[0]?.like_count ?? 0 };
}

export async function deleteLikeRow(userId, artworkId) {
  await query(
    `DELETE FROM likes WHERE user_id = $1 AND artwork_id = $2`,
    [userId, artworkId]
  );
  const { rows } = await query(
    `SELECT COUNT(*)::int AS like_count FROM likes WHERE artwork_id = $1`,
    [artworkId]
  );
  return { liked: false, like_count: rows[0]?.like_count ?? 0 };
}

export async function putFavoriteRow(userId, artworkId) {
  await query(
    `INSERT INTO favorites (user_id, artwork_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, artwork_id) DO NOTHING`,
    [userId, artworkId]
  );
  const { rows } = await query(
    `SELECT COUNT(*)::int AS favorite_count FROM favorites WHERE artwork_id = $1`,
    [artworkId]
  );
  return { favorited: true, favorite_count: rows[0]?.favorite_count ?? 0 };
}

export async function deleteFavoriteRow(userId, artworkId) {
  await query(
    `DELETE FROM favorites WHERE user_id = $1 AND artwork_id = $2`,
    [userId, artworkId]
  );
  const { rows } = await query(
    `SELECT COUNT(*)::int AS favorite_count FROM favorites WHERE artwork_id = $1`,
    [artworkId]
  );
  return { favorited: false, favorite_count: rows[0]?.favorite_count ?? 0 };
}

function mapCommentRow(row) {
  return {
    comment_id: row.comment_id,
    artwork_id: row.artwork_id,
    content: row.content,
    created_at: row.created_at,
    author: {
      user_id: row.user_id,
      username: row.username,
      display_name: row.display_name || row.username,
      avatar_url: toUploadUrl(row.avatar_path),
    },
  };
}

export async function listArtworkComments(
  artworkId,
  { page = 1, limit = 20 } = {}
) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT
       cm.comment_id,
       cm.artwork_id,
       cm.user_id,
       cm.content,
       cm.created_at,
       u.username,
       p.display_name,
       p.avatar_path,
       COUNT(*) OVER()::int AS total_count
     FROM comments cm
     JOIN artworks a ON a.artwork_id = cm.artwork_id
     JOIN users u ON u.user_id = cm.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE cm.artwork_id = $1
       AND a.status = 'published'
       AND cm.status = 'visible'
     ORDER BY cm.created_at DESC, cm.comment_id DESC
     LIMIT $2 OFFSET $3`,
    [artworkId, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapCommentRow),
    meta: { page, limit, total },
  };
}

export async function insertCommentRow({ userId, artworkId, content }) {
  const { rows: inserted } = await query(
    `INSERT INTO comments (artwork_id, user_id, content, status)
     VALUES ($1, $2, $3, 'visible')
     RETURNING comment_id`,
    [artworkId, userId, content]
  );

  const { rows } = await query(
    `SELECT
       cm.comment_id,
       cm.artwork_id,
       cm.user_id,
       cm.content,
       cm.created_at,
       u.username,
       p.display_name,
       p.avatar_path
     FROM comments cm
     JOIN users u ON u.user_id = cm.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE cm.comment_id = $1
     LIMIT 1`,
    [inserted[0].comment_id]
  );

  return mapCommentRow(rows[0]);
}

export async function softDeleteCommentRow(commentId, userId) {
  const { rows } = await query(
    `UPDATE comments
     SET status = 'deleted'
     WHERE comment_id = $1 AND user_id = $2 AND status = 'visible'
     RETURNING comment_id`,
    [commentId, userId]
  );
  return rows[0] || null;
}

export async function listUserFavorites(
  userId,
  { page = 1, limit = 12 } = {}
) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT
       a.artwork_id,
       a.user_id,
       a.category_id,
       a.title,
       a.description,
       a.image_path,
       a.status,
       a.created_at,
       a.updated_at,
       c.name AS category_name,
       c.slug AS category_slug,
       u.username AS creator_username,
       p.display_name AS creator_display_name,
       p.avatar_path AS creator_avatar_path,
       COALESCE(lk.cnt, 0)::int AS like_count,
       COALESCE(cm.cnt, 0)::int AS comment_count,
       COUNT(*) OVER()::int AS total_count
     FROM favorites f
     JOIN artworks a ON a.artwork_id = f.artwork_id
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM likes l WHERE l.artwork_id = a.artwork_id
     ) lk ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM comments cm2 WHERE cm2.artwork_id = a.artwork_id AND cm2.status = 'visible'
     ) cm ON TRUE
     WHERE f.user_id = $1 AND a.status = 'published'
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapArtworkRow),
    meta: { page, limit, total },
  };
}
