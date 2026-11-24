import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { deleteUploadedFile } from '@/lib/server/uploads';
import { getErrorMessage } from '@/lib/shared/error-messages';
import { MAX_CURATOR_APPEALS } from '@/lib/validators/verifications';
import { updateProfileRow } from '@/lib/repositories/users';
import {
  activateCuratorUser,
  createCuratorAppealRow,
  findAdminVerificationById,
  findLatestVerificationByUserId,
  findVerificationHistoryByUserId,
  hardDeleteRejectedCuratorRow,
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

export async function submitCuratorAppeal(userId, input) {
  return withTransaction(async (client) => {
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

    await updateProfileRow(
      userId,
      {
        displayName: input.display_name,
        bio: input.bio,
        website: input.website || null,
        avatarPath: null,
      },
      client
    );

    await createCuratorAppealRow(userId, input.appeal_note, client);

    return findLatestVerificationByUserId(userId, client);
  });
}

export async function deleteRejectedCuratorAccount(userId) {
  let avatarToDelete = null;

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

    avatarToDelete = latest.avatar_path || null;
    const deleted = await hardDeleteRejectedCuratorRow(userId, client);
    if (!deleted) {
      throw new AppError(409, 'INVALID_STATE', 'Akun tidak dapat dihapus.');
    }
    return { deleted_user_id: deleted.user_id };
  });

  if (avatarToDelete) {
    await deleteUploadedFile(avatarToDelete);
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
