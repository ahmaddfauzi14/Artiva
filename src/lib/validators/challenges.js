import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const optionalCategoryId = z.preprocess(
  (val) => (val === '' || val === undefined || val === null ? null : Number(val)),
  z.number().int().positive().nullable().optional()
);

const booleanFlag = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === '1') return true;
  if (
    val === 'false' ||
    val === '0' ||
    val === '' ||
    val === undefined ||
    val === null
  ) {
    return false;
  }
  return val;
}, z.boolean());

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
    prize: z
      .string()
      .trim()
      .max(500, 'Hadiah maksimal 500 karakter.')
      .optional()
      .default(''),
    category_id: optionalCategoryId,
    start_date: z
      .string({ error: 'Tanggal mulai wajib diisi.' })
      .regex(DATE_REGEX, 'Format tanggal mulai harus YYYY-MM-DD.'),
    end_date: z
      .string({ error: 'Tanggal berakhir wajib diisi.' })
      .regex(DATE_REGEX, 'Format tanggal berakhir harus YYYY-MM-DD.'),
    publish: booleanFlag.optional().default(false),
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
  prize: z
    .string()
    .trim()
    .max(500, 'Hadiah maksimal 500 karakter.')
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
  remove_banner: booleanFlag.optional(),
});

const CHALLENGE_FORM_FIELDS = [
  'title',
  'description',
  'rules',
  'prize',
  'category_id',
  'start_date',
  'end_date',
  'publish',
  'remove_banner',
];

/**
 * Mengurai payload challenge dari multipart/form-data atau JSON beserta file banner opsional.
 */
export async function parseChallengeRequest(request, { partial = false } = {}) {
  const contentType = request.headers.get('content-type') || '';
  let raw = {};
  let bannerFile = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    for (const key of CHALLENGE_FORM_FIELDS) {
      if (formData.has(key)) {
        raw[key] = formData.get(key);
      }
    }
    const fileEntry = formData.get('banner');
    if (fileEntry && typeof fileEntry === 'object' && fileEntry.size > 0) {
      bannerFile = fileEntry;
    }
  } else {
    raw = await request.json();
  }

  const schema = partial ? updateChallengeSchema : createChallengeSchema;
  const hasTextUpdates = !partial || Object.keys(raw).length > 0;
  const input = hasTextUpdates ? schema.parse(raw) : {};
  return { input, bannerFile };
}
