export const INTERACTION_ROLES = ['member'];
export const REPORT_ROLES = ['member'];

export function canInteract(user) {
  return Boolean(
    user && user.status === 'active' && INTERACTION_ROLES.includes(user.role)
  );
}

export function canReport(user) {
  return Boolean(
    user && user.status === 'active' && REPORT_ROLES.includes(user.role)
  );
}
