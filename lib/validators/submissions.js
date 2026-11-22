import { z } from 'zod';

export const createSubmissionSchema = z.object({
  artwork_id: z.coerce
    .number({ error: 'Karya wajib dipilih.' })
    .int('ID karya tidak valid.')
    .positive('ID karya tidak valid.'),
});
