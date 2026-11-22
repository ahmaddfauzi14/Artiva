import { query, withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { syncChallengeStatuses } from '@/lib/server/challenge-status';
import { listChallengeWinners } from '@/lib/repositories/challenges';

export async function declareChallengeWinners(
  curatorId,
  challengeId,
  winnersInput
) {
  await withTransaction(async (client) => {
    const chRes = await query(
      `SELECT challenge_id, curator_id, status, end_date
       FROM challenges
       WHERE challenge_id = $1 AND curator_id = $2
       FOR UPDATE`,
      [challengeId, curatorId],
      client
    );
    const challenge = chRes.rows[0];
    if (!challenge) {
      throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
    }

    await syncChallengeStatuses(client);
    const refreshedRes = await query(
      `SELECT status FROM challenges WHERE challenge_id = $1`,
      [challengeId],
      client
    );
    const effectiveStatus = refreshedRes.rows[0].status;

    if (effectiveStatus === 'open') {
      throw new AppError(
        409,
        'CHALLENGE_STILL_OPEN',
        'Tantangan masih berlangsung. Penetapan pemenang dilakukan setelah periode berakhir.'
      );
    }
    if (effectiveStatus === 'announced') {
      throw new AppError(
        409,
        'ALREADY_ANNOUNCED',
        'Pemenang tantangan ini sudah diumumkan dan tidak dapat diubah.'
      );
    }
    if (effectiveStatus !== 'closed') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Pemenang hanya dapat ditetapkan pada tantangan yang sudah ditutup.'
      );
    }

    // Pastikan minimal 1 submission aktif tersedia
    const activeCountRes = await query(
      `SELECT COUNT(*)::int AS cnt
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = $1
         AND s.status = 'submitted'
         AND a.status = 'published'`,
      [challengeId],
      client
    );
    if ((activeCountRes.rows[0]?.cnt ?? 0) === 0) {
      throw new AppError(
        409,
        'NO_SUBMISSIONS',
        'Belum ada karya peserta aktif yang memenuhi syarat untuk ditetapkan sebagai pemenang.'
      );
    }

    if (
      !Array.isArray(winnersInput) ||
      winnersInput.length < 1 ||
      winnersInput.length > 3
    ) {
      throw new AppError(
        422,
        'INVALID_WINNERS',
        'Pemenang harus berjumlah 1 hingga 3 karya.'
      );
    }

    const subIds = winnersInput.map((w) => w.submission_id);
    const ranks = winnersInput.map((w) => w.rank);

    if (new Set(subIds).size !== subIds.length) {
      throw new AppError(
        422,
        'INVALID_WINNERS',
        'Setiap pemenang harus berasal dari karya submission yang berbeda.'
      );
    }
    if (new Set(ranks).size !== ranks.length) {
      throw new AppError(
        422,
        'INVALID_WINNERS',
        'Peringkat pemenang tidak boleh ganda.'
      );
    }

    // D-08: peringkat harus tepat {1..n} tanpa lompatan
    const sortedRanks = [...ranks].sort((a, b) => a - b);
    for (let i = 0; i < sortedRanks.length; i += 1) {
      if (sortedRanks[i] !== i + 1) {
        throw new AppError(
          422,
          'INVALID_WINNERS',
          `Peringkat untuk ${sortedRanks.length} pemenang harus berurutan tepat 1 sampai ${sortedRanks.length}.`
        );
      }
    }

    const subCheck = await query(
      `SELECT s.submission_id, s.status, a.status AS artwork_status
       FROM submissions s
       JOIN artworks a ON a.artwork_id = s.artwork_id
       WHERE s.challenge_id = $1 AND s.submission_id = ANY($2::int[])`,
      [challengeId, subIds],
      client
    );

    if (subCheck.rows.length !== subIds.length) {
      throw new AppError(
        422,
        'INVALID_WINNERS',
        'Salah satu submission tidak termasuk dalam tantangan ini.'
      );
    }

    for (const row of subCheck.rows) {
      if (row.status !== 'submitted' || row.artwork_status !== 'published') {
        throw new AppError(
          422,
          'INVALID_WINNERS',
          'Semua karya pemenang harus berstatus submission Terkirim dan karya Dipublikasikan.'
        );
      }
    }

    for (const item of winnersInput) {
      await query(
        `INSERT INTO winners (challenge_id, submission_id, rank)
         VALUES ($1, $2, $3)`,
        [challengeId, item.submission_id, item.rank],
        client
      );
    }

    await query(
      `UPDATE challenges SET status = 'announced' WHERE challenge_id = $1`,
      [challengeId],
      client
    );
  });

  return listChallengeWinners(challengeId);
}
