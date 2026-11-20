import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), name);
    if (fs.existsSync(filePath) && typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(filePath);
    }
  }
}

const INITIAL_CATEGORIES = [
  {
    name: 'Fotografi',
    slug: 'fotografi',
    description: 'Karya fotografi dokumenter, potret, alam, maupun eksperimental.',
  },
  {
    name: 'Ilustrasi',
    slug: 'ilustrasi',
    description: 'Ilustrasi digital, karakter, konsep visual, dan komik.',
  },
  {
    name: 'UI/UX',
    slug: 'ui-ux',
    description: 'Desain antarmuka, pengalaman pengguna, dan prototipe produk digital.',
  },
  {
    name: 'Desain Grafis',
    slug: 'desain-grafis',
    description: 'Poster, identitas visual, tipografi, dan tata letak kreatif.',
  },
  {
    name: '3D Art',
    slug: '3d-art',
    description: 'Pemodelan tiga dimensi, rendering, lingkungan virtual, dan patung digital.',
  },
  {
    name: 'Lainnya',
    slug: 'lainnya',
    description: 'Karya lintas disiplin dan eksplorasi visual lainnya.',
  },
];

async function runSeed() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diatur di environment atau .env.local');
  }

  const adminUsername = (process.env.SEED_ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@artiva.local').trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminArtiva2026!';

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const cat of INITIAL_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (name, slug, description, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT DO NOTHING`,
        [cat.name, cat.slug, cat.description]
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const insertAdmin = await client.query(
      `INSERT INTO users (username, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'admin', 'active')
       ON CONFLICT DO NOTHING
       RETURNING user_id`,
      [adminUsername, adminEmail, passwordHash]
    );

    let adminId = insertAdmin.rows[0]?.user_id;
    if (!adminId) {
      const existing = await client.query(
        `SELECT user_id FROM users WHERE username = $1 OR email = $2 LIMIT 1`,
        [adminUsername, adminEmail]
      );
      adminId = existing.rows[0]?.user_id;
    }

    if (adminId) {
      await client.query(
        `INSERT INTO profiles (user_id, display_name, bio)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [adminId, 'Administrator ARTIVA', 'Pengelola platform dan moderasi ARTIVA.']
      );
    }

    await client.query('COMMIT');
    console.log('Seed awal (kategori + admin) selesai secara idempoten.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error('Gagal menjalankan seed:', err);
  process.exit(1);
});
