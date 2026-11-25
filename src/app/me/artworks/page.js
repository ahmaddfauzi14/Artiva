import PageHeader from '@/components/layout/PageHeader';
import MemberArtworks from '@/components/features/member/MemberArtworks';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listMemberArtworks } from '@/lib/repositories/artworks';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Karya Saya · ARTIVA',
};

export default async function MemberArtworksPage() {
  const user = await requirePageRole('member', '/me/artworks');
  const myArtworks = await listMemberArtworks(user.user_id, {
    page: 1,
    limit: 48,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PORTOFOLIO MEMBER"
        title="Karya saya"
        subtitle="Kelola karya, dari sketsa pertama sampai siap dipublikasikan."
        actionLabel="Tambah karya →"
        actionHref="/me/artworks/new"
      />
      <MemberArtworks initialArtworks={myArtworks.items} />
    </div>
  );
}
