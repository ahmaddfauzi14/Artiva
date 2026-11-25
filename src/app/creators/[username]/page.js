import { notFound } from 'next/navigation';
import CreatorProfile from '@/components/features/creators/CreatorProfile';
import PublicShell from '@/components/layout/PublicShell';
import { getPublicViewer } from '@/lib/auth/page-guards';
import { findPublicCreatorByUsername } from '@/lib/repositories/artworks';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { username } = await params;
  const data = await findPublicCreatorByUsername(username);
  return {
    title: data
      ? `${data.creator.display_name} (@${data.creator.username}) · ARTIVA`
      : 'Kreator Tidak Ditemukan · ARTIVA',
  };
}

export default async function CreatorProfilePage({ params, searchParams }) {
  const viewer = await getPublicViewer();

  const { username } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page || '1') || 1);

  const data = await findPublicCreatorByUsername(username, { page, limit: 12 });
  if (!data) {
    notFound();
  }

  const { creator, artworks, meta } = data;

  return (
    <PublicShell user={viewer} mainClassName="py-6 sm:py-8">
      <CreatorProfile creator={creator} artworks={artworks} meta={meta} />
    </PublicShell>
  );
}
