import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/server/http';

const ALLOWED_FOLDERS = new Set(['artworks', 'avatars', 'challenges']);
const ALLOWED_DOC_FOLDERS = new Set(['cvs']);
const ALLOWED_CLEANUP_FOLDERS = new Set([
  ...ALLOWED_FOLDERS,
  ...ALLOWED_DOC_FOLDERS,
]);

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const DOC_MIME_BY_EXT = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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

export function detectDocumentFormat(buffer, originalFilename = '') {
  if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null;

  const extHint = path.extname(String(originalFilename || '')).toLowerCase();

  // PDF: %PDF-
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { ext: 'pdf', mime: DOC_MIME_BY_EXT['.pdf'] };
  }

  // Word .doc (OLE2 Compound File)
  if (
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1 &&
    (!extHint || extHint === '.doc')
  ) {
    return { ext: 'doc', mime: DOC_MIME_BY_EXT['.doc'] };
  }

  // Word .docx (ZIP containing word/ directory entries)
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04 &&
    buffer.includes(Buffer.from('word/')) &&
    (!extHint || extHint === '.docx')
  ) {
    return { ext: 'docx', mime: DOC_MIME_BY_EXT['.docx'] };
  }

  return null;
}

export async function validateUploadedDocument(file, fieldName = 'cv') {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    throw new AppError(
      400,
      'INVALID_FILE',
      'File CV berformat PDF atau Word wajib diunggah.',
      { [fieldName]: 'File CV (PDF atau Word) wajib diunggah.' }
    );
  }

  const maxBytes = getMaxUploadBytes();
  const maxMb = Math.round(maxBytes / (1024 * 1024));
  if (file.size > maxBytes) {
    throw new AppError(
      400,
      'INVALID_FILE',
      `Ukuran file CV melebihi batas maksimal ${maxMb} MB.`,
      { [fieldName]: `Ukuran maksimal ${maxMb} MB.` }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectDocumentFormat(buffer, file.name);
  if (!detected) {
    throw new AppError(
      400,
      'INVALID_FILE',
      'Format file CV tidak valid. Gunakan file PDF (.pdf) atau Word (.doc, .docx) asli.',
      { [fieldName]: 'Hanya mendukung file PDF (.pdf) atau Word (.doc, .docx) yang valid.' }
    );
  }

  return { buffer, ...detected };
}

export async function saveValidatedDocument(
  validated,
  folder = 'cvs'
) {
  if (!ALLOWED_DOC_FOLDERS.has(folder)) {
    throw new Error(`Folder dokumen tidak diizinkan: ${folder}`);
  }

  const root = getUploadRoot();
  const targetDir = path.join(/*turbopackIgnore: true*/ root, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${validated.ext}`;
  const fullPath = path.join(/*turbopackIgnore: true*/ targetDir, filename);
  await fs.writeFile(fullPath, validated.buffer);

  return `${folder}/${filename}`;
}

export async function saveUploadedDocument(
  file,
  folder = 'cvs',
  fieldName = 'cv'
) {
  const validated = await validateUploadedDocument(file, fieldName);
  return saveValidatedDocument(validated, folder);
}

export async function deleteUploadedFile(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return;
  const clean = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length !== 2 || !ALLOWED_CLEANUP_FOLDERS.has(parts[0])) return;

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

export function resolveSafeDocumentPath(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return null;
  const clean = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length !== 2) return null;

  const [folder, filename] = parts;
  if (!ALLOWED_DOC_FOLDERS.has(folder)) return null;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;

  const extWithDot = path.extname(filename).toLowerCase();
  const mime = DOC_MIME_BY_EXT[extWithDot];
  if (!mime) return null;

  const root = getUploadRoot();
  const resolved = path.resolve(/*turbopackIgnore: true*/ root, folder, filename);
  const rel = path.relative(root, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    return null;
  }

  return { filePath: resolved, mime, ext: extWithDot.slice(1) };
}

export async function serveDocumentFile(
  relativePath,
  { filenameBase = 'cv-kurator', forceDownload = false } = {}
) {
  const resolved = resolveSafeDocumentPath(relativePath);
  if (!resolved) {
    throw new AppError(404, 'NOT_FOUND', 'File CV tidak ditemukan.');
  }

  let fileBuffer;
  try {
    fileBuffer = await fs.readFile(resolved.filePath);
  } catch (err) {
    if (err?.code === 'ENOENT') {
      throw new AppError(404, 'NOT_FOUND', 'File CV tidak ditemukan.');
    }
    throw err;
  }

  const cleanBase =
    String(filenameBase || 'cv-kurator')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cv-kurator';
  const downloadName = `${cleanBase}.${resolved.ext}`;
  const dispositionType =
    forceDownload || resolved.ext !== 'pdf' ? 'attachment' : 'inline';

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': resolved.mime,
      'Content-Disposition': `${dispositionType}; filename="${downloadName}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
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
