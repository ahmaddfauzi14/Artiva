import MemberDashboard from '@/components/features/member/MemberDashboard';
import { requirePageRole } from '@/lib/auth/page-guards';
import {
  listMemberArtworks,
  listPublicArtworks,
} from '@/lib/repositories/artworks';
import { listUserFavorites } from '@/lib/repositories/interactions';
import { listMemberSubmissions } from '@/lib/repositories/submissions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard Member · ARTIVA',
};

export default async function MemberDashboardPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requirePageRole('member', '/dashboard/member');

  const [myArtworks, myFavorites, mySubmissions, community] = await Promise.all([
    listMemberArtworks(user.user_id, { page: 1, limit: 48 }),
    listUserFavorites(user.user_id, { page: 1, limit: 48 }),
    listMemberSubmissions(user.user_id, { page: 1, limit: 50 }),
    listPublicArtworks({ page: 1, limit: 4 }),
  ]);

  const tabParam = sp?.tab || 'overview';

  return (
    <MemberDashboard
      key={tabParam}
      user={user}
      initialTab={tabParam}
      initialArtworks={myArtworks.items}
      initialFavorites={myFavorites.items}
      initialSubmissions={mySubmissions.items || []}
      communityArtworks={community.items}
    />
  );
}
