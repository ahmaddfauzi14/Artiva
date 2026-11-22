import { z } from 'zod';

export const REPORT_REASON_VALUES = [
  'spam',
  'plagiarism',
  'inappropriate',
  'copyright',
  'other',
];

export const createReportSchema = z.object({
  reason: z.enum(REPORT_REASON_VALUES, {
    error: 'Pilih alasan pelaporan yang valid.',
  }),
  description: z
    .string()
    .trim()
    .max(1000, 'Deskripsi laporan maksimal 1000 karakter.')
    .optional()
    .default(''),
});

export const dismissReportSchema = z.object({
  resolution_note: z
    .string({ error: 'Catatan tinjauan wajib diisi.' })
    .trim()
    .min(5, 'Catatan tinjauan minimal 5 karakter.')
    .max(1000, 'Catatan tinjauan maksimal 1000 karakter.'),
});

export const resolveReportSchema = z.object({
  action: z.enum(['hide', 'remove'], {
    error: 'Pilih tindakan moderasi hide atau remove.',
  }),
  resolution_note: z
    .string({ error: 'Catatan tinjauan wajib diisi.' })
    .trim()
    .min(5, 'Catatan tinjauan minimal 5 karakter.')
    .max(1000, 'Catatan tinjauan maksimal 1000 karakter.'),
});
