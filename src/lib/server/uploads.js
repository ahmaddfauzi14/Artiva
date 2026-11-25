import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '@/lib/server/http';

const ALLOWED_FOLDERS = new Set(['artworks', 'avatars', 'challenges']);

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function getUploadRoot() {
  return path.resolve(
    /*turbopackIgnore: true*/ process.cwd(),
    process.env.UPLOAD_DIR || './storage/uploads'
  );
}

export function getMaxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_MB || '5');
  const safeMb = Number.isFinite(mb) && mb > 0 ? mb : 5;
  return safeMb * 1024 * 1024;
}

export function detectImageFormat(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }

  return null;
}

export async function saveUploadedImage(file, folder) {
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error(`Folder upload tidak diizinkan: ${folder}`);
  }

  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    throw new AppError(400, 'INVALID_FILE', 'File gambar wajib diunggah.', {
      image: 'File gambar wajib diunggah.',
    });
  }

  const maxBytes = getMaxUploadBytes();
  const maxMb = Math.round(maxBytes / (1024 * 1024));
  if (file.size > maxBytes) {
    throw new AppError(
      400,
      'INVALID_FILE',
      `Ukuran gambar melebihi batas maksimal ${maxMb} MB.`,
      { image: `Ukuran maksimal ${maxMb} MB.` }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageFormat(buffer);
  if (!detected) {
    throw new AppError(
      400,
      'INVALID_FILE',
      'Format file tidak valid. Gunakan gambar JPEG, PNG, atau WEBP asli.',
      { image: 'Hanya mendukung JPEG, PNG, atau WEBP yang valid.' }
    );
  }

  const root = getUploadRoot();
  const targetDir = path.join(/*turbopackIgnore: true*/ root, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${detected.ext}`;
  const fullPath = path.join(/*turbopackIgnore: true*/ targetDir, filename);
  await fs.writeFile(fullPath, buffer);

  return `${folder}/${filename}`;
}

export async function deleteUploadedFile(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return;
  const clean = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length !== 2 || !ALLOWED_FOLDERS.has(parts[0])) return;

  const root = getUploadRoot();
  const resolved = path.resolve(/*turbopackIgnore: true*/ root, parts[0], parts[1]);
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return;

  try {
    await fs.unlink(resolved);
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.error('[ARTIVA UPLOAD CLEANUP]', err?.message || err);
    }
  }
}

export function resolveSafeUploadPath(segments) {
  if (!Array.isArray(segments) || segments.length !== 2) return null;

  for (const seg of segments) {
    if (
      typeof seg !== 'string' ||
      !seg ||
      seg.includes('..') ||
      seg.includes('/') ||
      seg.includes('\\') ||
      seg.includes('\0') ||
      seg.includes(':')
    ) {
      return null;
    }
  }

  const [folder, filename] = segments;
  if (!ALLOWED_FOLDERS.has(folder)) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;

  const ext = path.extname(filename).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;

  const root = getUploadRoot();
  const resolved = path.resolve(/*turbopackIgnore: true*/ root, folder, filename);
  const rel = path.relative(root, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }

  return { filePath: resolved, mime };
}

export { toUploadUrl } from '@/lib/shared/format';
