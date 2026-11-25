import { query } from '@/lib/server/db';

export async function listActiveCategories(client = null) {
  const { rows } = await query(
    `SELECT category_id, name, slug, description, is_active
     FROM categories
     WHERE is_active = TRUE
     ORDER BY
       CASE WHEN LOWER(slug) = 'lainnya' OR LOWER(name) = 'lainnya' THEN 1 ELSE 0 END ASC,
       category_id ASC`,
    [],
    client
  );
  return rows;
}

export async function findActiveCategoryById(categoryId, client = null) {
  const { rows } = await query(
    `SELECT category_id, name, slug, description, is_active
     FROM categories
     WHERE category_id = $1 AND is_active = TRUE
     LIMIT 1`,
    [categoryId],
    client
  );
  return rows[0] || null;
}

export async function findCategoryById(categoryId, client = null) {
  const { rows } = await query(
    `SELECT category_id, name, slug, description, is_active
     FROM categories
     WHERE category_id = $1
     LIMIT 1`,
    [categoryId],
    client
  );
  return rows[0] || null;
}
