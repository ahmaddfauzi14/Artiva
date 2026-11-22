import { ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireAuth } from '@/lib/auth/guards';
import { removeOwnComment } from '@/lib/services/interactions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const DELETE = withHandler(async (_request, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const commentId = parsePositiveInt(id, 'comment_id');
  const result = await removeOwnComment(user, commentId);
  return ok(result);
});
