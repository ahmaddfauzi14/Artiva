import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const VIEW_REDIRECTS = {
  challenges: '/curator/challenges',
  submissions: '/curator/challenges',
  winners: '/curator/challenges',
  announcements: '/curator/challenges',
};

export default async function LegacyCuratorDashboardRedirect({ searchParams }) {
  const sp = await searchParams;
  const view = sp?.view;
  redirect(VIEW_REDIRECTS[view] || '/');
}
