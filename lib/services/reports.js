import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { getErrorMessage } from '@/lib/shared/error-messages';
import { canReport } from '@/lib/shared/permissions';
import { withdrawSubmissionsForArtwork } from '@/lib/repositories/artworks';
import { findPublishedArtworkCheck } from '@/lib/repositories/interactions';
import {
  findAdminReportDetail,
  insertReportRow,
  lockReportRow,
  moderateArtworkStatus,
  resolveOtherPendingReports,
  updateReportDecision,
} from '@/lib/repositories/reports';

export async function createArtworkReport(user, artworkId, input) {
  if (!canReport(user)) {
    throw new AppError(403, 'FORBIDDEN', getErrorMessage('FORBIDDEN'));
  }

  const artwork = await findPublishedArtworkCheck(artworkId);
  if (!artwork) {
    throw new AppError(
      404,
      'NOT_FOUND',
      'Karya tidak ditemukan atau sedang tidak dipublikasikan.'
    );
  }

  if (artwork.user_id === user.user_id) {
    throw new AppError(
      422,
      'INVALID_STATE',
      'Kamu tidak dapat melaporkan karyamu sendiri.'
    );
  }

  return insertReportRow({
    reporterId: user.user_id,
    artworkId,
    reason: input.reason,
    description: input.description,
  });
}

export async function dismissReport(adminId, reportId, resolutionNote) {
  return withTransaction(async (client) => {
    const locked = await lockReportRow(reportId, client);
    if (!locked) {
      throw new AppError(404, 'NOT_FOUND', 'Laporan tidak ditemukan.');
    }
    if (locked.status !== 'pending') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Laporan ini sudah ditangani sebelumnya.'
      );
    }

    await updateReportDecision(
      reportId,
      {
        status: 'dismissed',
        handledBy: adminId,
        resolutionNote,
      },
      client
    );

    return findAdminReportDetail(reportId, client);
  });
}

export async function resolveReport(
  adminId,
  reportId,
  { action, resolution_note }
) {
  const nextArtworkStatus = action === 'remove' ? 'removed' : 'hidden';

  return withTransaction(async (client) => {
    const locked = await lockReportRow(reportId, client);
    if (!locked) {
      throw new AppError(404, 'NOT_FOUND', 'Laporan tidak ditemukan.');
    }
    if (locked.status !== 'pending') {
      throw new AppError(
        409,
        'INVALID_STATE',
        'Laporan ini sudah ditangani sebelumnya.'
      );
    }

    await moderateArtworkStatus(locked.artwork_id, nextArtworkStatus, client);
    await withdrawSubmissionsForArtwork(locked.artwork_id, client);

    await updateReportDecision(
      reportId,
      {
        status: 'resolved',
        handledBy: adminId,
        resolutionNote: resolution_note,
      },
      client
    );

    await resolveOtherPendingReports(
      locked.artwork_id,
      reportId,
      adminId,
      client
    );

    return findAdminReportDetail(reportId, client);
  });
}
