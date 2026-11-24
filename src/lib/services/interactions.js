import { AppError } from '@/lib/server/http';
import { getErrorMessage } from '@/lib/shared/error-messages';
import { canInteract } from '@/lib/shared/permissions';
import {
  deleteFavoriteRow,
  deleteLikeRow,
  findPublishedArtworkCheck,
  insertCommentRow,
  listArtworkComments,
  putFavoriteRow,
  putLikeRow,
  softDeleteCommentRow,
} from '@/lib/repositories/interactions';

function assertInteractionAllowed(user) {
  if (!canInteract(user)) {
    throw new AppError(403, 'FORBIDDEN', getErrorMessage('FORBIDDEN'));
  }
}

async function assertPublishedArtwork(artworkId) {
  const artwork = await findPublishedArtworkCheck(artworkId);
  if (!artwork) {
    throw new AppError(404, 'NOT_FOUND', 'Karya tidak ditemukan.');
  }
  return artwork;
}

export async function likeArtwork(user, artworkId) {
  assertInteractionAllowed(user);
  await assertPublishedArtwork(artworkId);
  return putLikeRow(user.user_id, artworkId);
}

export async function unlikeArtwork(user, artworkId) {
  assertInteractionAllowed(user);
  await assertPublishedArtwork(artworkId);
  return deleteLikeRow(user.user_id, artworkId);
}

export async function favoriteArtwork(user, artworkId) {
  assertInteractionAllowed(user);
  await assertPublishedArtwork(artworkId);
  return putFavoriteRow(user.user_id, artworkId);
}

export async function unfavoriteArtwork(user, artworkId) {
  assertInteractionAllowed(user);
  await assertPublishedArtwork(artworkId);
  return deleteFavoriteRow(user.user_id, artworkId);
}

export async function getPublicArtworkComments(artworkId, pagination) {
  await assertPublishedArtwork(artworkId);
  return listArtworkComments(artworkId, pagination);
}

export async function addArtworkComment(user, artworkId, content) {
  assertInteractionAllowed(user);
  await assertPublishedArtwork(artworkId);
  return insertCommentRow({
    userId: user.user_id,
    artworkId,
    content,
  });
}

export async function removeOwnComment(user, commentId) {
  assertInteractionAllowed(user);
  const deleted = await softDeleteCommentRow(commentId, user.user_id);
  if (!deleted) {
    throw new AppError(404, 'NOT_FOUND', 'Komentar tidak ditemukan.');
  }
  return deleted;
}
