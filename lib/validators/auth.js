import { z } from 'zod';

const usernameField = z
  .string({ error: 'Username wajib diisi.' })
  .trim()
  .toLowerCase()
  .min(3, 'Username minimal 3 karakter.')
  .max(30, 'Username maksimal 30 karakter.')
  .regex(/^[a-z0-9_]+$/, 'Username hanya boleh huruf kecil, angka, dan garis bawah (_).');

const emailField = z
  .string({ error: 'Email wajib diisi.' })
  .trim()
  .toLowerCase()
  .max(255, 'Email maksimal 255 karakter.')
  .email('Format email tidak valid.');

const passwordField = z
  .string({ error: 'Kata sandi wajib diisi.' })
  .min(8, 'Kata sandi minimal 8 karakter.')
  .max(100, 'Kata sandi maksimal 100 karakter.');

const websiteField = z
  .string()
  .trim()
  .max(255, 'Tautan situs maksimal 255 karakter.')
  .optional()
  .default('')
  .refine(
    (val) => !val || /^https?:\/\/.+/i.test(val),
    'Tautan situs harus diawali http:// atau https://.'
  );

export const registerMemberSchema = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
  display_name: z
    .string()
    .trim()
    .max(60, 'Nama tampilan maksimal 60 karakter.')
    .optional()
    .default(''),
});

export const registerCuratorSchema = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
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
  website: websiteField,
});

export const loginSchema = z.object({
  identifier: z
    .string({ error: 'Email atau username wajib diisi.' })
    .trim()
    .min(1, 'Email atau username wajib diisi.'),
  password: z
    .string({ error: 'Kata sandi wajib diisi.' })
    .min(1, 'Kata sandi wajib diisi.'),
});

export const updateProfileSchema = z.object({
  display_name: z
    .string({ error: 'Nama tampilan wajib diisi.' })
    .trim()
    .min(2, 'Nama tampilan minimal 2 karakter.')
    .max(60, 'Nama tampilan maksimal 60 karakter.'),
  bio: z
    .string()
    .trim()
    .max(1000, 'Bio maksimal 1000 karakter.')
    .optional()
    .default(''),
  website: websiteField,
});

export const updateAccountSchema = z
  .object({
    current_password: z
      .string({ error: 'Kata sandi saat ini wajib diisi.' })
      .min(1, 'Kata sandi saat ini wajib diisi.'),
    email: emailField.optional(),
    new_password: passwordField.optional(),
  })
  .refine((data) => Boolean(data.email || data.new_password), {
    message: 'Isi email baru atau kata sandi baru untuk memperbarui akun.',
    path: ['_form'],
  });
