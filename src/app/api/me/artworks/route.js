import { ok, parsePagination, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { listMemberArtworks } from '@/lib/repositories/artworks';
import { createMemberArtwork } from '@/lib/services/artworks';
import { createArtworkSchema } from '@/lib/validators/artworks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (request) => {
  const user = await requireRole('member');
  const { searchParams } = new URL(request.url);
  const { page, limit } = parsePagination(searchParams, 12, 48);
  const status = searchParams.get('status') || '';

  const result = await listMemberArtworks(user.user_id, { status, page, limit });
  return ok({ artworks: result.items }, result.meta);
});

export const POST = withHandler(async (request) => {
  const user = await requireRole('member');
  const formData = await request.formData();

  const raw = {
    title: formData.get('title') ?? '',
    description: formData.get('description') ?? '',
    category_id: formData.get('category_id'),
    status: formData.get('status') || 'published',
  };

  const input = createArtworkSchema.parse(raw);
  const imageFile = formData.get('image');
  const artwork = await createMemberArtwork(user.user_id, input, imageFile);

  return ok({ artwork }, undefined, 201);
});
