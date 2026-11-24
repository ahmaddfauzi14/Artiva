import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { findActiveCategoryById } from '@/lib/repositories/categories';
import {
  findMemberArtworkById,
  insertArtwork,
  softDeleteArtworkRow,
  updateArtworkRow,
  withdrawSubmissionsForArtwork,
} from '@/lib/repositories/artworks';
import { deleteUploadedFile, saveUploadedImage } from '@/lib/server/uploads';

export async function createMemberArtwork(userId, input, imageFile) {
  const category = await findActiveCategoryById(input.category_id);
  if (!category) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Kategori tidak ditemukan atau sedang nonaktif.',
      { category_id: 'Pilih kategori yang aktif.' }
    );
  }

  const imagePath = await saveUploadedImage(imageFile, 'artworks');

  try {
    return await withTransaction(async (client) => {
      return insertArtwork(
        {
          userId,
          categoryId: input.category_id,
          title: input.title,
          description: input.description,
          imagePath,
          status: input.status || 'published',
        },
        client
      );
    });
  } catch (err) {
    await deleteUploadedFile(imagePath);
    throw err;
  }
}

export async function getMemberArtwork(userId, artworkId) {
  const artwork = await findMemberArtworkById(artworkId, userId);
  if (!artwork) {
    throw new AppError(404, 'NOT_FOUND', 'Karya tidak ditemukan.');
  }
  return artwork;
}

export async function updateMemberArtwork(
  userId,
  artworkId,
  input,
  imageFile = null
) {
  if (input.category_id !== undefined) {
    const category = await findActiveCategoryById(input.category_id);
    if (!category) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Kategori tidak ditemukan atau sedang nonaktif.',
        { category_id: 'Pilih kategori yang aktif.' }
      );
    }
  }

  let newImagePath = null;
  if (imageFile && typeof imageFile.arrayBuffer === 'function' && imageFile.size > 0) {
    newImagePath = await saveUploadedImage(imageFile, 'artworks');
  }

  let oldImagePath = null;
  try {
    const updated = await withTransaction(async (client) => {
      const existing = await findMemberArtworkById(artworkId, userId, client);
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', 'Karya tidak ditemukan.');
      }

      oldImagePath = existing.image_path;

      const row = await updateArtworkRow(
        artworkId,
        userId,
        {
          categoryId: input.category_id,
          title: input.title,
          description: input.description,
          imagePath: newImagePath,
          status: input.status,
        },
        client
      );

      if (input.status === 'hidden' && existing.status !== 'hidden') {
        await withdrawSubmissionsForArtwork(artworkId, client);
      }

      return row;
    });

    if (newImagePath && oldImagePath && oldImagePath !== newImagePath) {
      await deleteUploadedFile(oldImagePath);
    }

    return updated;
  } catch (err) {
    if (newImagePath) {
      await deleteUploadedFile(newImagePath);
    }
    throw err;
  }
}

export async function deleteMemberArtwork(userId, artworkId) {
  return withTransaction(async (client) => {
    const deleted = await softDeleteArtworkRow(artworkId, userId, client);
    if (!deleted) {
      throw new AppError(404, 'NOT_FOUND', 'Karya tidak ditemukan.');
    }
    const withdrawnCount = await withdrawSubmissionsForArtwork(artworkId, client);
    return { artwork_id: deleted.artwork_id, withdrawn_submissions: withdrawnCount };
  });
}
