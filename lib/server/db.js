import pg from 'pg';

const { Pool } = pg;

// Pastikan kolom DATE (OID 1082) dibaca sebagai string 'YYYY-MM-DD' tanpa pergeseran zona waktu
pg.types.setTypeParser(1082, (value) => value);

export function getPool() {
  if (!globalThis.__pgPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL belum diatur di environment.');
    }
    globalThis.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return globalThis.__pgPool;
}

export async function query(text, params = [], client = null) {
  const executor = client || getPool();
  return executor.query(text, params);
}

export async function withTransaction(callback) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
