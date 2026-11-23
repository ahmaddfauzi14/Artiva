import { AppError, ok, parsePositiveInt, withHandler } from '@/lib/server/http';
import { requireRole } from '@/lib/auth/guards';
import { findAdminUserDetail } from '@/lib/repositories/admin';
import {
  changeUserStatusByAdmin,
  deleteUserHardByAdmin,
} from '@/lib/services/admin';
import { updateUserStatusSchema } from '@/lib/validators/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withHandler(async (_request, { params }) => {
  await requireRole('admin');
  const { id } = await params;
  const userId = parsePositiveInt(id, 'user_id');
  const userDetail = await findAdminUserDetail(userId);
  if (!userDetail) {
    throw new AppError(404, 'NOT_FOUND', 'Pengguna tidak ditemukan.');
  }
  return ok({ user: userDetail });
});

export const PATCH = withHandler(async (request, { params }) => {
  const admin = await requireRole('admin');
  const { id } = await params;
  const userId = parsePositiveInt(id, 'user_id');
  const body = await request.json();
  const input = updateUserStatusSchema.parse(body);

  const user = await changeUserStatusByAdmin(admin.user_id, userId, input.status);
  return ok({ user });
});

export const DELETE = withHandler(async (_request, { params }) => {
  const admin = await requireRole('admin');
  const { id } = await params;
  const userId = parsePositiveInt(id, 'user_id');
  const result = await deleteUserHardByAdmin(admin.user_id, userId);
  return ok(result);
});
