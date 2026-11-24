import { withTransaction } from '@/lib/server/db';
import { AppError } from '@/lib/server/http';
import { slugify } from '@/lib/shared/format';
import { deleteUploadedFile } from '@/lib/server/uploads';
import {
  deleteCategoryRow,
  deleteUserRow,
  findAdminUserDetail,
  insertCategoryRow,
  isCategoryInUse,
  updateCategoryRow,
  updateUserStatusRow,
} from '@/lib/repositories/admin';
import { findCategoryById } from '@/lib/repositories/categories';

export async function createAdminCategory(input) {
  const slug = slugify(input.name);
  if (!slug) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Nama kategori harus mengandung huruf atau angka.',
      { name: 'Nama kategori harus mengandung huruf atau angka.' }
    );
  }
  return insertCategoryRow({
    name: input.name,
    slug,
    description: input.description,
  });
}

export async function updateAdminCategory(categoryId, input) {
  const existing = await findCategoryById(categoryId);
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Kategori tidak ditemukan.');
  }

  let nextSlug = null;
  if (input.name !== undefined) {
    nextSlug = slugify(input.name);
    if (!nextSlug) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Nama kategori harus mengandung huruf atau angka.',
        { name: 'Nama kategori harus mengandung huruf atau angka.' }
      );
    }
  }

  return updateCategoryRow(categoryId, {
    name: input.name,
    slug: nextSlug,
    description: input.description,
    isActive: input.is_active,
  });
}

export async function deleteAdminCategory(categoryId) {
  const existing = await findCategoryById(categoryId);
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Kategori tidak ditemukan.');
  }

  const used = await isCategoryInUse(categoryId);
  if (used) {
    throw new AppError(
      409,
      'CATEGORY_IN_USE',
      'Kategori masih digunakan oleh karya atau tantangan. Nonaktifkan kategori sebagai gantinya.'
    );
  }

  await deleteCategoryRow(categoryId);
  return { category_id: categoryId, deleted: true };
}

export async function changeUserStatusByAdmin(adminId, targetUserId, nextStatus) {
  if (adminId === targetUserId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Kamu tidak dapat mengubah status akunmu sendiri.'
    );
  }

  const target = await findAdminUserDetail(targetUserId);
  if (!target) {
    throw new AppError(404, 'NOT_FOUND', 'Pengguna tidak ditemukan.');
  }
  if (target.role === 'admin') {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Status akun Administrator lain tidak dapat diubah.'
    );
  }

  if (target.role === 'curator' && target.status === 'pending' && nextStatus === 'active') {
    throw new AppError(
      409,
      'INVALID_STATE',
      'Kurator berstatus Menunggu harus disetujui melalui antrean Verifikasi Kurator.'
    );
  }

  await updateUserStatusRow(targetUserId, nextStatus);
  return findAdminUserDetail(targetUserId);
}

export async function deleteUserHardByAdmin(adminId, targetUserId) {
  if (adminId === targetUserId) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Kamu tidak dapat menghapus akunmu sendiri.'
    );
  }

  let avatarToDelete = null;

  const result = await withTransaction(async (client) => {
    const target = await findAdminUserDetail(targetUserId, client);
    if (!target) {
      throw new AppError(404, 'NOT_FOUND', 'Pengguna tidak ditemukan.');
    }
    if (target.role === 'admin') {
      throw new AppError(
        403,
        'FORBIDDEN',
        'Akun Administrator lain tidak dapat dihapus.'
      );
    }
    if (target.has_relations) {
      throw new AppError(
        409,
        'HAS_RELATIONS',
        'Pengguna memiliki riwayat aktivitas sehingga tidak dapat dihapus permanen. Nonaktifkan akun sebagai gantinya.'
      );
    }

    avatarToDelete = target.avatar_path || null;
    await deleteUserRow(targetUserId, client);
    return { user_id: targetUserId, deleted: true };
  });

  if (avatarToDelete) {
    await deleteUploadedFile(avatarToDelete);
  }

  return result;
}
