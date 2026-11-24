import { query, withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { syncChallengeStatuses, todayInTz } from '@/lib/server/challenge-status';
import { findPublicChallengeById } from '@/lib/repositories/challenges';
import { listEligibleArtworks } from '@/lib/repositories/submissions';

export async function getEligibleArtworksForMember(userId, challengeId) {
  const challenge = await findPublicChallengeById(challengeId);
  if (!challenge) {
    throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
  }
  const artworks = await listEligibleArtworks(userId, challenge);
  return { challenge, artworks };
}

export async function submitArtworkToChallenge(userId, challengeId, artworkId) {
  return withTransaction(async (client) => {
    const today = await syncChallengeStatuses(client);

    const chRes = await query(
      `SELECT challenge_id, category_id, start_date, end_date, status
       FROM challenges
       WHERE challenge_id = $1
       FOR SHARE`,
      [challengeId],
      client
    );
    const challenge = chRes.rows[0];
    if (!challenge || challenge.status === 'draft') {
      throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
    }

    if (
      challenge.status !== 'open' ||
      challenge.start_date > today ||
      today > challenge.end_date
    ) {
      throw new AppError(
        409,
        'CHALLENGE_NOT_OPEN',
        'Tantangan sedang tidak menerima submission saat ini.'
      );
    }

    const artRes = await query(
      `SELECT artwork_id, user_id, category_id, status
       FROM artworks
       WHERE artwork_id = $1
       LIMIT 1`,
      [artworkId],
      client
    );
    const artwork = artRes.rows[0];
    if (!artwork || artwork.user_id !== userId) {
      throw new AppError(
        403,
        'ARTWORK_NOT_ELIGIBLE',
        'Kamu hanya dapat mengirimkan karya milikmu sendiri.'
      );
    }
    if (artwork.status !== 'published') {
      throw new AppError(
        422,
        'ARTWORK_NOT_ELIGIBLE',
        'Hanya karya berstatus Dipublikasikan yang dapat dikirimkan.'
      );
    }
    if (challenge.category_id && artwork.category_id !== challenge.category_id) {
      throw new AppError(
        422,
        'ARTWORK_NOT_ELIGIBLE',
        'Kategori karya tidak sesuai dengan kategori yang disyaratkan tantangan.'
      );
    }

    const existingRes = await query(
      `SELECT submission_id, status
       FROM submissions
       WHERE challenge_id = $1 AND artwork_id = $2
       FOR UPDATE`,
      [challengeId, artworkId],
      client
    );
    const existing = existingRes.rows[0];

    if (existing) {
      if (existing.status === 'submitted') {
        throw new AppError(
          409,
          'ALREADY_SUBMITTED',
          'Karya ini sudah terdaftar pada tantangan ini.'
        );
      }

      // D-05: kirim ulang baris withdrawn yang sama
      const { rows: updated } = await query(
        `UPDATE submissions
         SET status = 'submitted',
             withdrawn_at = NULL,
             submitted_at = now()
         WHERE submission_id = $1 AND status = 'withdrawn'
         RETURNING *`,
        [existing.submission_id],
        client
      );
      if (!updated[0]) {
        throw new AppError(
          409,
          'ALREADY_SUBMITTED',
          'Karya ini sudah terdaftar pada tantangan ini.'
        );
      }
      return updated[0];
    }

    const { rows: inserted } = await query(
      `INSERT INTO submissions (challenge_id, artwork_id, status)
       VALUES ($1, $2, 'submitted')
       RETURNING *`,
      [challengeId, artworkId],
      client
    );
    return inserted[0];
  });
}

export async function withdrawMemberSubmission(userId, submissionId) {
  return withTransaction(async (client) => {
    const today = await syncChallengeStatuses(client);

    const { rows } = await query(
      `SELECT
         s.submission_id,
         s.status,
         s.challenge_id,
         a.user_id AS owner_id,
         ch.status AS challenge_status,
         ch.end_date
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       JOIN challenges ch ON ch.challenge_id = s.challenge_id
       WHERE s.submission_id = $1
       FOR UPDATE OF s`,
      [submissionId],
      client
    );

    const row = rows[0];
    if (!row || row.owner_id !== userId) {
      throw new AppError(404, 'NOT_FOUND', 'Submission tidak ditemukan.');
    }

    if (
      row.status !== 'submitted' ||
      row.challenge_status !== 'open' ||
      row.end_date < today
    ) {
      throw new AppError(
        409,
        'WITHDRAW_NOT_ALLOWED',
        'Submission tidak dapat ditarik karena sudah berstatus ditarik atau tantangan telah ditutup.'
      );
    }

    const { rows: updated } = await query(
      `UPDATE submissions
       SET status = 'withdrawn',
           withdrawn_at = now()
       WHERE submission_id = $1
       RETURNING *`,
      [submissionId],
      client
    );

    return updated[0];
  });
}
