import { z } from 'zod';

export const createArtworkSchema = z.object({
  title: z
    .string({ error: 'Judul karya wajib diisi.' })
    .trim()
    .min(1, 'Judul karya wajib diisi.')
    .max(120, 'Judul karya maksimal 120 karakter.'),
  description: z
    .string()
    .trim()
    .max(3000, 'Deskripsi maksimal 3000 karakter.')
    .optional()
    .default(''),
  category_id: z.coerce
    .number({ error: 'Kategori wajib dipilih.' })
    .int('Kategori tidak valid.')
    .positive('Kategori wajib dipilih.'),
  status: z
    .enum(['published', 'hidden'], {
      error: 'Status karya hanya boleh Dipublikasikan atau Disembunyikan.',
    })
    .optional()
    .default('published'),
});

export const updateArtworkSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Judul karya tidak boleh kosong.')
      .max(120, 'Judul karya maksimal 120 karakter.')
      .optional(),
    description: z
      .string()
      .trim()
      .max(3000, 'Deskripsi maksimal 3000 karakter.')
      .optional(),
    category_id: z.coerce
      .number()
      .int('Kategori tidak valid.')
      .positive('Kategori tidak valid.')
      .optional(),
    status: z
      .enum(['published', 'hidden'], {
        error: 'Status karya hanya boleh Dipublikasikan atau Disembunyikan.',
      })
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.category_id !== undefined ||
      data.status !== undefined,
    {
      message: 'Tidak ada data yang diperbarui.',
      path: ['_form'],
    }
  );
