import { z } from 'zod';

export const declareWinnersSchema = z.object({
  winners: z
    .array(
      z.object({
        submission_id: z.coerce
          .number({ error: 'Submission tidak valid.' })
          .int()
          .positive(),
        rank: z.coerce
          .number({ error: 'Peringkat tidak valid.' })
          .int()
          .min(1, 'Peringkat minimal 1.')
          .max(3, 'Peringkat maksimal 3.'),
      })
    )
    .min(1, 'Pilih minimal 1 pemenang.')
    .max(3, 'Maksimal 3 pemenang yang dapat ditetapkan.'),
});
