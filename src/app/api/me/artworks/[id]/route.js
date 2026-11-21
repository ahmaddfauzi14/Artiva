import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import {
  deleteMemberArtwork,
  getMemberArtwork,
  updateMemberArtwork,
} from '@/lib/services/artworks';
import { updateArtworkSchema } from '@/lib/validators/artworks';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  const user = await requireRole('member');
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const artwork = await getMemberArtwork(user.user_id, artworkId);
  return ok({ artwork });
});

export const PATCH = withHandler(async (request, { params }) => {
  const user = await requireRole('member');
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');

  const contentType = request.headers.get('content-type') || '';
  let raw = {};
  let imageFile = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    if (formData.has('title')) raw.title = formData.get('title');
    if (formData.has('description')) raw.description = formData.get('description');
    if (formData.has('category_id')) raw.category_id = formData.get('category_id');
    if (formData.has('status')) raw.status = formData.get('status');

    const fileEntry = formData.get('image');
    if (fileEntry && typeof fileEntry === 'object' && fileEntry.size > 0) {
      imageFile = fileEntry;
    }
  } else {
    raw = await request.json();
  }

  const hasTextUpdates = Object.keys(raw).length > 0;
  const input = hasTextUpdates ? updateArtworkSchema.parse(raw) : {};
  const artwork = await updateMemberArtwork(
    user.user_id,
    artworkId,
    input,
    imageFile
  );

  return ok({ artwork });
});

export const DELETE = withHandler(async (_request, { params }) => {
  const user = await requireRole('member');
  const { id } = await params;
  const artworkId = parsePositiveInt(id, 'artwork_id');
  const result = await deleteMemberArtwork(user.user_id, artworkId);
  return ok(result);
});
