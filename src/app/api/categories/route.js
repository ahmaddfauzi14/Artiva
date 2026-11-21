import { ok, withHandler } from '@/lib/server/http';
import { listActiveCategories } from '@/lib/repositories/categories';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async () => {
  const categories = await listActiveCategories();
  return ok({ categories });
});
