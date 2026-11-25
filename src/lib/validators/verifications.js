import { z } from 'zod';
import { requiredWebsiteField } from '@/lib/validators/auth';

export const MAX_CURATOR_APPEALS = 3;

export const rejectVerificationSchema = z.object({
  note: z
    .string({ error: 'Catatan penolakan wajib diisi.' })
    .trim()
    .min(5, 'Catatan penolakan minimal 5 karakter agar calon Kurator memahami alasannya.')
    .max(1000, 'Catatan penolakan maksimal 1000 karakter.'),
});

export const submitCuratorAppealSchema = z.object({
  display_name: z
    .string({ error: 'Nama tampilan atau organisasi wajib diisi.' })
    .trim()
    .min(2, 'Nama tampilan minimal 2 karakter.')
    .max(60, 'Nama tampilan maksimal 60 karakter.'),
  bio: z
    .string({ error: 'Profil singkat atau latar belakang kurator wajib diisi.' })
    .trim()
    .min(10, 'Bio minimal 10 karakter agar Admin dapat meninjau pengajuanmu.')
    .max(1000, 'Bio maksimal 1000 karakter.'),
  website: requiredWebsiteField,
  appeal_note: z
    .string({ error: 'Catatan banding wajib diisi.' })
    .trim()
    .min(10, 'Catatan banding minimal 10 karakter agar Admin memahami perbaikan yang kamu lakukan.')
    .max(1000, 'Catatan banding maksimal 1000 karakter.'),
});
