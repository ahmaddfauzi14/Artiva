import { query } from '@/lib/server/db';

export async function findUserForLogin(identifier, client = null) {
  const clean = identifier.trim().toLowerCase();
  const { rows } = await query(
    `SELECT
       u.user_id,
       u.username,
       u.email,
       u.password_hash,
       u.role,
       u.status,
       u.created_at,
       p.display_name,
       p.bio,
       p.avatar_path,
       p.website,
       cv.verification_id,
       cv.status AS verification_status,
       cv.note AS verification_note,
       cv.appeal_note AS verification_appeal_note,
       cv.cv_path AS verification_cv_path,
       cv.submitted_at AS verification_submitted_at,
       cv.reviewed_at AS verification_reviewed_at
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.user_id
     LEFT JOIN LATERAL (
       SELECT verification_id, status, note, appeal_note, cv_path, submitted_at, reviewed_at
       FROM curator_verifications
       WHERE user_id = u.user_id
       ORDER BY submitted_at DESC, verification_id DESC
       LIMIT 1
     ) cv ON u.role = 'curator'
     WHERE LOWER(u.email) = $1 OR LOWER(u.username) = $1
     LIMIT 1`,
    [clean],
    client
  );
  return rows[0] || null;
}

export async function findUserCredentialsById(userId, client = null) {
  const { rows } = await query(
    `SELECT user_id, username, email, password_hash, role, status
     FROM users
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
    client
  );
  return rows[0] || null;
}

export async function findProfileByUserId(userId, client = null) {
  const { rows } = await query(
    `SELECT profile_id, user_id, display_name, bio, avatar_path, website
     FROM profiles
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
    client
  );
  return rows[0] || null;
}

export async function createUserWithProfile(
  {
    username,
    email,
    passwordHash,
    role,
    status,
    displayName,
    bio,
    website,
    cvPath = null,
  },
  client
) {
  const userRes = await query(
    `INSERT INTO users (username, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, username, email, role, status, created_at`,
    [username, email, passwordHash, role, status],
    client
  );
  const user = userRes.rows[0];

  const profileRes = await query(
    `INSERT INTO profiles (user_id, display_name, bio, website)
     VALUES ($1, $2, $3, $4)
     RETURNING profile_id, display_name, bio, avatar_path, website`,
    [user.user_id, displayName, bio || null, website || null],
    client
  );

  let verification = null;
  if (role === 'curator') {
    const verRes = await query(
      `INSERT INTO curator_verifications (user_id, status, cv_path)
       VALUES ($1, 'pending', $2)
       RETURNING verification_id, status, note, appeal_note, cv_path, submitted_at, reviewed_at`,
      [user.user_id, cvPath || null],
      client
    );
    verification = verRes.rows[0];
  }

  return {
    ...user,
    ...profileRes.rows[0],
    verification,
  };
}

export async function updateProfileRow(
  userId,
  { displayName, bio, website, avatarPath },
  client = null
) {
  const { rows } = await query(
    `UPDATE profiles
     SET display_name = $2,
         bio = $3,
         website = $4,
         avatar_path = COALESCE($5, avatar_path)
     WHERE user_id = $1
     RETURNING profile_id, user_id, display_name, bio, avatar_path, website`,
    [userId, displayName, bio || null, website || null, avatarPath || null],
    client
  );
  return rows[0] || null;
}

export async function updateUserCredentials(
  userId,
  { email, passwordHash },
  client = null
) {
  const { rows } = await query(
    `UPDATE users
     SET email = COALESCE($2, email),
         password_hash = COALESCE($3, password_hash)
     WHERE user_id = $1
     RETURNING user_id, username, email, role, status, created_at`,
    [userId, email || null, passwordHash || null],
    client
  );
  return rows[0] || null;
}
