import { z } from 'zod';

export const rejectVerificationSchema = z.object({
  note: z
    .string({ error: 'Catatan penolakan wajib diisi.' })
    .trim()
    .min(5, 'Catatan penolakan minimal 5 karakter agar calon Kurator memahami alasannya.')
    .max(1000, 'Catatan penolakan maksimal 1000 karakter.'),
});
