import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { getErrorMessage } from '@/lib/shared/error-messages';
import { todayInTz } from '@/lib/server/challenge-status';
import { findActiveCategoryById } from '@/lib/repositories/categories';
import {
  deleteChallengeRow,
  existsCuratorChallengeTitle,
  findCuratorChallengeById,
  insertChallengeRow,
  listCuratorChallengeSubmissions,
  updateChallengeRow,
} from '@/lib/repositories/curator-challenges';

export async function createCuratorChallenge(curatorId, input) {
  const today = todayInTz();
  if (input.start_date < today) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Tanggal mulai tidak boleh di masa lalu.',
      { start_date: 'Pilih hari ini atau tanggal mendatang.' }
    );
  }

  if (input.category_id) {
    const cat = await findActiveCategoryById(input.category_id);
    if (!cat) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Kategori tidak ditemukan atau sedang nonaktif.',
        { category_id: 'Pilih kategori yang aktif.' }
      );
    }
  }

  const titleTaken = await existsCuratorChallengeTitle(curatorId, input.title);
  if (titleTaken) {
    const message = getErrorMessage('CHALLENGE_TITLE_TAKEN');
    throw new AppError(409, 'CHALLENGE_TITLE_TAKEN', message, {
      title: message,
    });
  }

  return insertChallengeRow({
    curatorId,
    categoryId: input.category_id ?? null,
    title: input.title,
    description: input.description,
    rules: input.rules,
    startDate: input.start_date,
    endDate: input.end_date,
    status: input.publish ? 'open' : 'draft',
  });
}

export async function getCuratorChallenge(curatorId, challengeId) {
  const challenge = await findCuratorChallengeById(challengeId, curatorId);
  if (!challenge) {
    throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
  }
  return challenge;
}

export async function updateCuratorChallenge(curatorId, challengeId, input) {
  return withTransaction(async (client) => {
    const existing = await findCuratorChallengeById(
      challengeId,
      curatorId,
      client,
      true
    );
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
    }

    if (existing.status === 'closed' || existing.status === 'announced') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Tantangan yang sudah ditutup atau diumumkan tidak dapat diubah.'
      );
    }

    if (existing.status === 'open') {
      // D-09: saat open hanya boleh ubah description, rules, end_date (diperpanjang)
      const changingLocked =
        (input.title !== undefined && input.title !== existing.title) ||
        (input.start_date !== undefined &&
          input.start_date !== existing.start_date) ||
        (input.category_id !== undefined &&
          (input.category_id ?? null) !== (existing.category_id ?? null));

      if (changingLocked) {
        throw new AppError(
          409,
          'INVALID_STATE',
          'Saat tantangan Terbuka, hanya deskripsi, aturan, dan perpanjangan tanggal berakhir yang dapat diubah.'
        );
      }

      const nextEnd = input.end_date ?? existing.end_date;
      if (nextEnd < existing.end_date) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Tanggal berakhir tantangan yang sedang terbuka hanya boleh diperpanjang.',
          { end_date: 'Tanggal berakhir tidak boleh dimajukan.' }
        );
      }
      if (nextEnd <= existing.start_date) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Tanggal berakhir harus lebih akhir dari tanggal mulai.',
          { end_date: 'Tanggal berakhir harus lebih akhir dari tanggal mulai.' }
        );
      }

      return updateChallengeRow(
        challengeId,
        curatorId,
        {
          description: input.description,
          rules: input.rules,
          endDate: input.end_date,
        },
        client
      );
    }

    // Status 'draft' -> boleh ubah semua kolom
    const nextStart = input.start_date ?? existing.start_date;
    const nextEnd = input.end_date ?? existing.end_date;
    if (nextEnd <= nextStart) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Tanggal berakhir harus lebih akhir dari tanggal mulai.',
        { end_date: 'Tanggal berakhir harus lebih akhir dari tanggal mulai.' }
      );
    }

    const hasCategoryUpdate = input.category_id !== undefined;
    if (hasCategoryUpdate && input.category_id !== null) {
      const cat = await findActiveCategoryById(input.category_id, client);
      if (!cat) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Kategori tidak ditemukan atau sedang nonaktif.',
          { category_id: 'Pilih kategori yang aktif.' }
        );
      }
    }

    if (input.title !== undefined) {
      const titleTaken = await existsCuratorChallengeTitle(
        curatorId,
        input.title,
        challengeId,
        client
      );
      if (titleTaken) {
        const message = getErrorMessage('CHALLENGE_TITLE_TAKEN');
        throw new AppError(409, 'CHALLENGE_TITLE_TAKEN', message, {
          title: message,
        });
      }
    }

    return updateChallengeRow(
      challengeId,
      curatorId,
      {
        title: input.title,
        description: input.description,
        rules: input.rules,
        hasCategoryUpdate,
        categoryId: input.category_id,
        startDate: input.start_date,
        endDate: input.end_date,
      },
      client
    );
  });
}

export async function publishCuratorChallenge(curatorId, challengeId) {
  return withTransaction(async (client) => {
    const existing = await findCuratorChallengeById(
      challengeId,
      curatorId,
      client,
      true
    );
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
    }
    if (existing.status !== 'draft') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Hanya tantangan berstatus Draft yang dapat dipublikasikan.'
      );
    }

    const today = todayInTz();
    if (existing.end_date < today) {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Tanggal berakhir tantangan sudah lewat. Perbarui tanggal terlebih dahulu sebelum mempublikasikan.'
      );
    }

    return updateChallengeRow(
      challengeId,
      curatorId,
      { status: 'open' },
      client
    );
  });
}

export async function deleteCuratorChallenge(curatorId, challengeId) {
  return withTransaction(async (client) => {
    const existing = await findCuratorChallengeById(
      challengeId,
      curatorId,
      client,
      true
    );
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
    }

    if (existing.status !== 'draft' && existing.total_submissions > 0) {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Tantangan yang sudah memiliki submission tidak dapat dihapus.'
      );
    }

    await deleteChallengeRow(challengeId, curatorId, client);
    return { challenge_id: challengeId, deleted: true };
  });
}

export async function getCuratorChallengeSubmissions(
  curatorId,
  challengeId,
  options
) {
  const challenge = await findCuratorChallengeById(challengeId, curatorId);
  if (!challenge) {
    throw new AppError(404, 'NOT_FOUND', 'Tantangan tidak ditemukan.');
  }
  const result = await listCuratorChallengeSubmissions(challengeId, options);
  return { challenge, ...result };
}
