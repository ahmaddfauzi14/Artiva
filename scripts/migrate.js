import fs from 'node:fs';
import path from 'node:path';
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

async function runMigrations() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diatur di environment atau .env.local');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const migrationsDir = path.resolve(process.cwd(), 'src/db/migrations');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows: appliedRows } = await pool.query(
      'SELECT filename FROM schema_migrations'
    );
    const applied = new Set(appliedRows.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[skip] ${file} sudah diterapkan`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[ok]   ${file} berhasil diterapkan`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    console.log('Migrasi database selesai.');
  } finally {
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Gagal menjalankan migrasi:', err);
  process.exit(1);
});
