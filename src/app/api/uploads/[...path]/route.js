import fs from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { fail } from '@/lib/server/http';
import { resolveSafeUploadPath } from '@/lib/server/uploads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const { path: rawSegments } = await params;
  let decodedSegments = [];
  try {
    decodedSegments = Array.isArray(rawSegments)
      ? rawSegments.map((seg) => decodeURIComponent(seg))
      : [];
  } catch {
    return fail('INVALID_FILE', 'Path file tidak valid.', 400);
  }

  const resolved = resolveSafeUploadPath(decodedSegments);
  if (!resolved) {
    return fail('INVALID_FILE', 'Path file tidak valid.', 400);
  }

  try {
    const fileBuffer = await fs.readFile(resolved.filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': resolved.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return fail('NOT_FOUND', 'File gambar tidak ditemukan.', 404);
    }
    console.error('[ARTIVA UPLOAD SERVE]', err?.message || err);
    return fail('INTERNAL_ERROR', 'Gagal membaca file gambar.', 500);
  }
}
