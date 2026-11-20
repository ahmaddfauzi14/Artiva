import { query } from '@/lib/server/db';
import { todayInTz } from '@/lib/shared/format';

export { todayInTz };

export async function syncChallengeStatuses(client = null) {
  const today = todayInTz();
  await query(
    `UPDATE challenges
     SET status = 'closed'
     WHERE status = 'open' AND end_date < $1`,
    [today],
    client
  );
  return today;
}

export function daysRemaining(endDateStr) {
  if (!endDateStr) return null;
  const today = todayInTz();
  const [ty, tm, td] = today.split('-').map(Number);
  const [ey, em, ed] = String(endDateStr).slice(0, 10).split('-').map(Number);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((endUtc - todayUtc) / 86400000);
}
