import { query } from '@/lib/server/db';
import { toUploadUrl } from '@/lib/shared/format';

const SORT_WHITELIST = {
  newest: 'a.created_at DESC, a.artwork_id DESC',
  popular: 'like_count DESC, a.created_at DESC, a.artwork_id DESC',
};

export function mapArtworkRow(row) {
  return {
    artwork_id: row.artwork_id,
    title: row.title,
    description: row.description || '',
    image_path: row.image_path,
    image_url: toUploadUrl(row.image_path),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    like_count: row.like_count ?? 0,
    comment_count: row.comment_count ?? 0,
    favorite_count: row.favorite_count ?? 0,
    category: {
      category_id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
    },
    creator: {
      user_id: row.user_id,
      username: row.creator_username,
      display_name: row.creator_display_name || row.creator_username,
      avatar_url: toUploadUrl(row.creator_avatar_path),
    },
  };
}

export async function listPublicArtworks({
  q = '',
  category = '',
  sort = 'newest',
  page = 1,
  limit = 12,
} = {}) {
  const orderBy = SORT_WHITELIST[sort] || SORT_WHITELIST.newest;
  const offset = (page - 1) * limit;

  const params = [];
  const conditions = [`a.status = 'published'`];

  if (category && category !== 'all') {
    params.push(category);
    conditions.push(`c.slug = $${params.length}`);
  }

  const cleanQ = q.trim();
  if (cleanQ) {
    params.push(`%${cleanQ}%`);
    const idx = params.length;
    conditions.push(
      `(a.title ILIKE $${idx} OR COALESCE(a.description, '') ILIKE $${idx} OR p.display_name ILIKE $${idx} OR u.username ILIKE $${idx})`
    );
  }

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

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
     FROM artworks a
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM likes l WHERE l.artwork_id = a.artwork_id
     ) lk ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM comments cm2 WHERE cm2.artwork_id = a.artwork_id AND cm2.status = 'visible'
     ) cm ON TRUE
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapArtworkRow),
    meta: { page, limit, total },
  };
}

export async function findPublicArtworkById(artworkId, viewerUserId = null) {
  const params = [artworkId];
  let viewerSelect = `FALSE AS viewer_liked, FALSE AS viewer_favorited`;
  if (viewerUserId) {
    params.push(viewerUserId);
    viewerSelect = `
      EXISTS(SELECT 1 FROM likes l WHERE l.artwork_id = a.artwork_id AND l.user_id = $2) AS viewer_liked,
      EXISTS(SELECT 1 FROM favorites f WHERE f.artwork_id = a.artwork_id AND f.user_id = $2) AS viewer_favorited
    `;
  }

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
       p.bio AS creator_bio,
       p.avatar_path AS creator_avatar_path,
       COALESCE(lk.cnt, 0)::int AS like_count,
       COALESCE(fv.cnt, 0)::int AS favorite_count,
       COALESCE(cm.cnt, 0)::int AS comment_count,
       ${viewerSelect}
     FROM artworks a
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM likes l WHERE l.artwork_id = a.artwork_id
     ) lk ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM favorites f WHERE f.artwork_id = a.artwork_id
     ) fv ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM comments cm2 WHERE cm2.artwork_id = a.artwork_id AND cm2.status = 'visible'
     ) cm ON TRUE
     WHERE a.artwork_id = $1 AND a.status = 'published'
     LIMIT 1`,
    params
  );

  const row = rows[0];
  if (!row) return null;

  return {
    ...mapArtworkRow(row),
    creator: {
      user_id: row.user_id,
      username: row.creator_username,
      display_name: row.creator_display_name || row.creator_username,
      bio: row.creator_bio || '',
      avatar_url: toUploadUrl(row.creator_avatar_path),
    },
    viewer: {
      liked: Boolean(row.viewer_liked),
      favorited: Boolean(row.viewer_favorited),
    },
  };
}

export async function findPublicCreatorByUsername(
  username,
  { page = 1, limit = 12 } = {}
) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const { rows: userRows } = await query(
    `SELECT
       u.user_id,
       u.username,
       u.role,
       u.status,
       u.created_at,
       p.display_name,
       p.bio,
       p.avatar_path,
       p.website
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE LOWER(u.username) = $1 AND u.status = 'active' AND u.role IN ('member', 'curator')
     LIMIT 1`,
    [cleanUsername]
  );

  const user = userRows[0];
  if (!user) return null;

  const offset = (page - 1) * limit;
  const { rows: artRows } = await query(
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
     FROM artworks a
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM likes l WHERE l.artwork_id = a.artwork_id
     ) lk ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM comments cm2 WHERE cm2.artwork_id = a.artwork_id AND cm2.status = 'visible'
     ) cm ON TRUE
     WHERE a.user_id = $1 AND a.status = 'published'
     ORDER BY a.created_at DESC, a.artwork_id DESC
     LIMIT $2 OFFSET $3`,
    [user.user_id, limit, offset]
  );

  const total = artRows[0]?.total_count ?? 0;

  return {
    creator: {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      display_name: user.display_name || user.username,
      bio: user.bio || '',
      avatar_url: toUploadUrl(user.avatar_path),
      website: user.website || '',
      created_at: user.created_at,
    },
    artworks: artRows.map(mapArtworkRow),
    meta: { page, limit, total },
  };
}

export async function listMemberArtworks(
  userId,
  { status = '', page = 1, limit = 12 } = {}
) {
  const offset = (page - 1) * limit;
  const params = [userId];
  const conditions = [`a.user_id = $1`, `a.status <> 'removed'`];

  if (status === 'published' || status === 'hidden') {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

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
     FROM artworks a
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM likes l WHERE l.artwork_id = a.artwork_id
     ) lk ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS cnt FROM comments cm2 WHERE cm2.artwork_id = a.artwork_id AND cm2.status = 'visible'
     ) cm ON TRUE
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.updated_at DESC, a.artwork_id DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    items: rows.map(mapArtworkRow),
    meta: { page, limit, total },
  };
}

export async function findMemberArtworkById(artworkId, userId, client = null) {
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
       p.avatar_path AS creator_avatar_path
     FROM artworks a
     JOIN categories c ON c.category_id = a.category_id
     JOIN users u ON u.user_id = a.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE a.artwork_id = $1 AND a.user_id = $2 AND a.status <> 'removed'
     LIMIT 1`,
    [artworkId, userId],
    client
  );

  return rows[0] ? mapArtworkRow(rows[0]) : null;
}

export async function insertArtwork(
  { userId, categoryId, title, description, imagePath, status },
  client
) {
  const { rows } = await query(
    `INSERT INTO artworks (user_id, category_id, title, description, image_path, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING artwork_id`,
    [userId, categoryId, title, description || null, imagePath, status],
    client
  );
  return findMemberArtworkById(rows[0].artwork_id, userId, client);
}

export async function updateArtworkRow(
  artworkId,
  userId,
  { categoryId, title, description, imagePath, status },
  client
) {
  const { rows } = await query(
    `UPDATE artworks
     SET category_id = COALESCE($3, category_id),
         title = COALESCE($4, title),
         description = CASE WHEN $5::text IS NULL THEN description ELSE NULLIF($5, '') END,
         image_path = COALESCE($6, image_path),
         status = COALESCE($7, status),
         updated_at = now()
     WHERE artwork_id = $1 AND user_id = $2 AND status <> 'removed'
     RETURNING artwork_id`,
    [
      artworkId,
      userId,
      categoryId ?? null,
      title ?? null,
      description === undefined ? null : description,
      imagePath ?? null,
      status ?? null,
    ],
    client
  );
  if (!rows[0]) return null;
  return findMemberArtworkById(artworkId, userId, client);
}

export async function softDeleteArtworkRow(artworkId, userId, client) {
  const { rows } = await query(
    `UPDATE artworks
     SET status = 'removed',
         updated_at = now()
     WHERE artwork_id = $1 AND user_id = $2 AND status <> 'removed'
     RETURNING artwork_id, image_path`,
    [artworkId, userId],
    client
  );
  return rows[0] || null;
}

// Aturan D-04 + BR-12: tarik submission aktif pada challenge non-announced saat karya disembunyikan/dihapus
export async function withdrawSubmissionsForArtwork(artworkId, client) {
  const { rows } = await query(
    `UPDATE submissions s
     SET status = 'withdrawn',
         withdrawn_at = now()
     FROM challenges ch
     WHERE s.challenge_id = ch.challenge_id
       AND s.artwork_id = $1
       AND s.status = 'submitted'
       AND ch.status <> 'announced'
       AND NOT EXISTS (
         SELECT 1 FROM winners w WHERE w.submission_id = s.submission_id
       )
     RETURNING s.submission_id`,
    [artworkId],
    client
  );
  return rows.length;
}

export async function listBackgroundArtworkItems(limit = 24) {
  const { rows } = await query(
    `SELECT artwork_id, title, image_path
     FROM artworks
     WHERE status = 'published' AND image_path IS NOT NULL
     ORDER BY created_at DESC, artwork_id DESC
     LIMIT $1`,
    [limit]
  );

  return rows
    .map((row) => ({
      src: toUploadUrl(row.image_path),
      alt: row.title || '',
    }))
    .filter((item) => Boolean(item.src));
}
