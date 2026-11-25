import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import {
  deleteUploadedFile,
  saveValidatedDocument,
  validateUploadedDocument,
} from '@/lib/server/uploads';
import { getErrorMessage } from '@/lib/shared/error-messages';
import { MAX_CURATOR_APPEALS } from '@/lib/validators/verifications';
import { updateProfileRow } from '@/lib/repositories/users';
import {
  activateCuratorUser,
  createCuratorAppealRow,
  findAdminCvRecord,
  findAdminVerificationById,
  findCuratorCvRecord,
  findLatestVerificationByUserId,
  findVerificationHistoryByUserId,
  hardDeleteRejectedCuratorRow,
  listCuratorCvPathsByUserId,
  lockCuratorUserRow,
  lockVerificationRow,
  markVerificationApproved,
  markVerificationRejected,
} from '@/lib/repositories/verifications';

export async function getCuratorVerificationDetail(userId) {
  const verification = await findLatestVerificationByUserId(userId);
  if (!verification) {
    throw new AppError(404, 'NOT_FOUND', 'Data verifikasi tidak ditemukan.');
  }
  return verification;
}

export async function getCuratorVerificationCv(userId, verificationId = null) {
  const record = await findCuratorCvRecord(userId, verificationId);
  if (!record || !record.cv_path) {
    throw new AppError(404, 'NOT_FOUND', 'File CV tidak ditemukan.');
  }
  return record;
}

export async function getAdminVerificationCv(verificationId) {
  const record = await findAdminCvRecord(verificationId);
  if (!record || !record.cv_path) {
    throw new AppError(404, 'NOT_FOUND', 'File CV tidak ditemukan.');
  }
  return record;
}

export async function submitCuratorAppeal(userId, input, cvFile = null) {
  const hasNewCv = Boolean(
    cvFile && typeof cvFile.arrayBuffer === 'function' && cvFile.size > 0
  );
  const validatedCv = hasNewCv
    ? await validateUploadedDocument(cvFile, 'cv')
    : null;
  let savedCvPath = null;

  try {
    return await withTransaction(async (client) => {
      const userRow = await lockCuratorUserRow(userId, client);
      if (!userRow || userRow.role !== 'curator') {
        throw new AppError(404, 'NOT_FOUND', 'Akun Kurator tidak ditemukan.');
      }
      if (userRow.status !== 'pending') {
        throw new AppError(
          409,
          'INVALID_STATE',
          'Aju banding hanya dapat dilakukan oleh akun Kurator yang belum aktif.'
        );
      }

      const history = await findVerificationHistoryByUserId(userId, client);
      if (history.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'Data verifikasi tidak ditemukan.');
      }

      const latest = history[history.length - 1];
      if (latest.status === 'pending') {
        throw new AppError(
          409,
          'INVALID_STATE',
          'Pengajuan verifikasi atau banding kamu masih dalam antrean peninjauan Admin.'
        );
      }
      if (latest.status !== 'rejected') {
        throw new AppError(
          409,
          'INVALID_STATE',
          'Aju banding hanya dapat dilakukan apabila pengajuan terakhir berstatus Ditolak.'
        );
      }

      const appealsUsed = Math.max(0, history.length - 1);
      if (appealsUsed >= MAX_CURATOR_APPEALS) {
        throw new AppError(
          409,
          'APPEAL_LIMIT_REACHED',
          getErrorMessage('APPEAL_LIMIT_REACHED')
        );
      }

      let nextCvPath = null;
      if (validatedCv) {
        savedCvPath = await saveValidatedDocument(validatedCv, 'cvs');
        nextCvPath = savedCvPath;
      } else {
        const prevCv = await findCuratorCvRecord(
          userId,
          latest.verification_id,
          client
        );
        nextCvPath = prevCv?.cv_path || null;
      }

      if (!nextCvPath) {
        throw new AppError(
          400,
          'INVALID_FILE',
          'File CV (PDF atau Word) wajib diunggah untuk mengajukan banding.',
          { cv: 'File CV (PDF atau Word) wajib diunggah.' }
        );
      }

      await updateProfileRow(
        userId,
        {
          displayName: input.display_name,
          bio: input.bio,
          website: input.website,
          avatarPath: null,
        },
        client
      );

      await createCuratorAppealRow(userId, input.appeal_note, nextCvPath, client);

      return findLatestVerificationByUserId(userId, client);
    });
  } catch (err) {
    if (savedCvPath) {
      await deleteUploadedFile(savedCvPath);
    }
    throw err;
  }
}

export async function deleteRejectedCuratorAccount(userId) {
  let filesToDelete = [];

  const result = await withTransaction(async (client) => {
    await lockCuratorUserRow(userId, client);
    const latest = await findLatestVerificationByUserId(userId, client);
    if (!latest) {
      throw new AppError(404, 'NOT_FOUND', 'Data verifikasi tidak ditemukan.');
    }
    if (latest.status !== 'rejected' || latest.user_status !== 'pending') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Akun Kurator hanya dapat dihapus sendiri apabila pengajuan berstatus Ditolak.'
      );
    }

    const cvPaths = await listCuratorCvPathsByUserId(userId, client);
    filesToDelete = [latest.avatar_path, ...cvPaths].filter(Boolean);

    const deleted = await hardDeleteRejectedCuratorRow(userId, client);
    if (!deleted) {
      throw new AppError(409, 'INVALID_STATE', 'Akun tidak dapat dihapus.');
    }
    return { deleted_user_id: deleted.user_id };
  });

  for (const filePath of new Set(filesToDelete)) {
    await deleteUploadedFile(filePath);
  }

  return result;
}

export async function approveVerification(verificationId, adminId) {
  return withTransaction(async (client) => {
    const locked = await lockVerificationRow(verificationId, client);
    if (!locked) {
      throw new AppError(404, 'NOT_FOUND', 'Pengajuan verifikasi tidak ditemukan.');
    }
    if (locked.status !== 'pending') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Pengajuan verifikasi ini sudah diputuskan sebelumnya.'
      );
    }

    const userRow = await lockCuratorUserRow(locked.user_id, client);
    if (!userRow || userRow.status === 'suspended') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Akun Kurator sedang ditangguhkan sehingga tidak dapat diaktifkan melalui verifikasi.'
      );
    }

    await markVerificationApproved(verificationId, adminId, client);
    await activateCuratorUser(locked.user_id, client);

    return findAdminVerificationById(verificationId, client);
  });
}

export async function rejectVerification(verificationId, adminId, note) {
  return withTransaction(async (client) => {
    const locked = await lockVerificationRow(verificationId, client);
    if (!locked) {
      throw new AppError(404, 'NOT_FOUND', 'Pengajuan verifikasi tidak ditemukan.');
    }
    if (locked.status !== 'pending') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Pengajuan verifikasi ini sudah diputuskan sebelumnya.'
      );
    }

    await markVerificationRejected(verificationId, adminId, note, client);
    return findAdminVerificationById(verificationId, client);
  });
}
