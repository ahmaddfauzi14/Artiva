import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { deleteUploadedFile } from '@/lib/server/uploads';
import {
  activateCuratorUser,
  findAdminVerificationById,
  findLatestVerificationByUserId,
  hardDeleteRejectedCuratorRow,
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

export async function deleteRejectedCuratorAccount(userId) {
  let avatarToDelete = null;

  const result = await withTransaction(async (client) => {
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
