import { AppError } from '@/lib/server/http';
import { getCurrentUser } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/shared/error-messages';

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError(401, 'UNAUTHENTICATED', getErrorMessage('UNAUTHENTICATED'));
  }
  if (user.status === 'suspended') {
    throw new AppError(403, 'ACCOUNT_SUSPENDED', getErrorMessage('ACCOUNT_SUSPENDED'));
  }
  return user;
}

export async function requireRole(allowedRoles) {
  const user = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    throw new AppError(403, 'FORBIDDEN', getErrorMessage('FORBIDDEN'));
  }
  return user;
}

export async function requireActiveCurator() {
  const user = await requireRole('curator');
  if (user.status !== 'active') {
    throw new AppError(
      403,
      'CURATOR_NOT_VERIFIED',
      getErrorMessage('CURATOR_NOT_VERIFIED')
    );
  }
  return user;
}
