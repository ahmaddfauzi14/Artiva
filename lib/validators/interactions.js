import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string({ error: 'Komentar wajib diisi.' })
    .trim()
    .min(1, 'Komentar tidak boleh kosong.')
    .max(1000, 'Komentar maksimal 1000 karakter.'),
});
