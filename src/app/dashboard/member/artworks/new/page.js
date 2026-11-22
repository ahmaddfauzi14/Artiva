import PageHeader from '@/components/layout/PageHeader';
import ArtworkEditorForm from '@/components/features/member/ArtworkEditorForm';
import { requirePageRole } from '@/lib/auth/page-guards';
import { listActiveCategories } from '@/lib/repositories/categories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tambah Karya · ARTIVA',
};

export default async function NewArtworkPage() {
  const [, categories] = await Promise.all([
    requirePageRole('member', '/dashboard/member/artworks/new'),
    listActiveCategories(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PORTOFOLIO MEMBER"
        title="Tambah karya baru"
        subtitle="Unggah satu kali dan karyamu siap tampil di galeri maupun didaftarkan ke tantangan."
      />
      <ArtworkEditorForm categories={categories} />
    </div>
  );
}
