import { ok, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { listAllAdminCategories } from '@/lib/repositories/admin';
import { createAdminCategory } from '@/lib/services/admin';
import { createCategorySchema } from '@/lib/validators/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  await requireRole('admin');
  const categories = await listAllAdminCategories();
  return ok({ categories });
});

export const POST = withHandler(async (request) => {
  await requireRole('admin');
  const body = await request.json();
  const input = createCategorySchema.parse(body);
  const category = await createAdminCategory(input);
  return ok({ category }, undefined, 201);
});
