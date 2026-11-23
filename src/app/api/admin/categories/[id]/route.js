import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import {
  deleteAdminCategory,
  updateAdminCategory,
} from '@/lib/services/admin';
import { updateCategorySchema } from '@/lib/validators/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const PATCH = withHandler(async (request, { params }) => {
  await requireRole('admin');
  const { id } = await params;
  const categoryId = parsePositiveInt(id, 'category_id');
  const body = await request.json();
  const input = updateCategorySchema.parse(body);

  const category = await updateAdminCategory(categoryId, input);
  return ok({ category });
});

export const DELETE = withHandler(async (_request, { params }) => {
  await requireRole('admin');
  const { id } = await params;
  const categoryId = parsePositiveInt(id, 'category_id');
  const result = await deleteAdminCategory(categoryId);
  return ok(result);
});
