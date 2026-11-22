import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import ArtworkEditorForm from '@/components/features/member/ArtworkEditorForm';
import { requirePageRole } from '@/lib/auth/page-guards';
import { findMemberArtworkById } from '@/lib/repositories/artworks';
import { listActiveCategories } from '@/lib/repositories/categories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ubah Karya · ARTIVA',
};

export default async function EditArtworkPage({ params }) {
  const { id } = await params;
  const artworkId = Number(id);
  const user = await requirePageRole(
    'member',
    `/dashboard/member/artworks/${id}/edit`
  );

  if (!Number.isInteger(artworkId) || artworkId <= 0) {
    notFound();
  }

  const [artwork, categories] = await Promise.all([
    findMemberArtworkById(artworkId, user.user_id),
    listActiveCategories(),
  ]);

  if (!artwork) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="UBAH KARYA"
        title={artwork.title}
        subtitle="Perbarui informasi, ganti gambar, atau atur status publikasi karyamu."
      />
      <ArtworkEditorForm categories={categories} initialArtwork={artwork} />
    </div>
  );
}
