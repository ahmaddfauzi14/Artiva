import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ error: 'Nama kategori wajib diisi.' })
    .trim()
    .min(2, 'Nama kategori minimal 2 karakter.')
    .max(60, 'Nama kategori maksimal 60 karakter.'),
  description: z
    .string()
    .trim()
    .max(500, 'Deskripsi kategori maksimal 500 karakter.')
    .optional()
    .default(''),
});

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nama kategori minimal 2 karakter.')
      .max(60, 'Nama kategori maksimal 60 karakter.')
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, 'Deskripsi kategori maksimal 500 karakter.')
      .optional(),
    is_active: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.name !== undefined ||
      d.description !== undefined ||
      d.is_active !== undefined,
    { message: 'Tidak ada data kategori yang diubah.', path: ['_form'] }
  );

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended'], {
    error: 'Status pengguna harus Aktif atau Ditangguhkan.',
  }),
});
