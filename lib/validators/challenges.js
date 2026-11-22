import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const optionalCategoryId = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z.number().int().positive().nullable().optional()
);

export const createChallengeSchema = z
  .object({
    title: z
      .string({ error: 'Judul tantangan wajib diisi.' })
      .trim()
      .min(3, 'Judul tantangan minimal 3 karakter.')
      .max(150, 'Judul tantangan maksimal 150 karakter.'),
    description: z
      .string()
      .trim()
      .max(3000, 'Deskripsi maksimal 3000 karakter.')
      .optional()
      .default(''),
    rules: z
      .string()
      .trim()
      .max(3000, 'Aturan maksimal 3000 karakter.')
      .optional()
      .default(''),
    category_id: optionalCategoryId,
    start_date: z
      .string({ error: 'Tanggal mulai wajib diisi.' })
      .regex(DATE_REGEX, 'Format tanggal mulai harus YYYY-MM-DD.'),
    end_date: z
      .string({ error: 'Tanggal berakhir wajib diisi.' })
      .regex(DATE_REGEX, 'Format tanggal berakhir harus YYYY-MM-DD.'),
    publish: z.boolean().optional().default(false),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: 'Tanggal berakhir harus lebih akhir dari tanggal mulai.',
    path: ['end_date'],
  });

export const updateChallengeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Judul tantangan minimal 3 karakter.')
    .max(150, 'Judul tantangan maksimal 150 karakter.')
    .optional(),
  description: z
    .string()
    .trim()
    .max(3000, 'Deskripsi maksimal 3000 karakter.')
    .optional(),
  rules: z
    .string()
    .trim()
    .max(3000, 'Aturan maksimal 3000 karakter.')
    .optional(),
  category_id: optionalCategoryId,
  start_date: z
    .string()
    .regex(DATE_REGEX, 'Format tanggal mulai harus YYYY-MM-DD.')
    .optional(),
  end_date: z
    .string()
    .regex(DATE_REGEX, 'Format tanggal berakhir harus YYYY-MM-DD.')
    .optional(),
});
