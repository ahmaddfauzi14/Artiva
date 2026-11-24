import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export const DASHBOARD_HOME_BY_ROLE = {
  member: '/',
  curator: '/',
  admin: '/dashboard/admin',
};

export function getHomeForUser(user) {
  if (!user) return '/login';
  if (user.role === 'curator' && user.status !== 'active') {
    return '/curator/verification';
  }
  return DASHBOARD_HOME_BY_ROLE[user.role] || '/';
}

export async function requirePageRole(allowedRoles, nextPath = '/dashboard') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (user.status === 'suspended') {
    redirect('/login?error=suspended');
  }
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    redirect(getHomeForUser(user));
  }
  return user;
}
