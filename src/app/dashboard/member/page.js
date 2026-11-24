import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const TAB_REDIRECTS = {
  artworks: '/me/artworks',
  submissions: '/me/submissions',
  favorites: '/me/favorites',
};

export default async function LegacyMemberDashboardRedirect({ searchParams }) {
  const sp = await searchParams;
  const tab = sp?.tab;
  redirect(TAB_REDIRECTS[tab] || '/');
}
