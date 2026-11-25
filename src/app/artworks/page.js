import ArtworkExplorer from '@/components/features/artworks/ArtworkExplorer';
import PublicShell from '@/components/layout/PublicShell';
import Button from '@/components/ui/Button';
import { getPublicViewer } from '@/lib/auth/page-guards';
import { listPublicArtworks } from '@/lib/repositories/artworks';
import { listActiveCategories } from '@/lib/repositories/categories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Jelajahi Karya · ARTIVA',
};

function getBannerCta(user) {
  if (user?.role === 'member') {
    return { label: 'Unggah karya →', href: '/me/artworks/new' };
  }
  if (user) {
    return { label: 'Jelajahi tantangan →', href: '/challenges' };
  }
  return { label: 'Gabung sebagai Member →', href: '/register/member' };
}

export default async function ArtworksPage({ searchParams }) {
  const user = await getPublicViewer();

  const sp = await searchParams;
  const q = sp?.q || '';
  const category = sp?.category || 'all';
  const sort = sp?.sort === 'popular' ? 'popular' : 'newest';

  const [categories, result] = await Promise.all([
    listActiveCategories(),
    listPublicArtworks({ q, category, sort, limit: null }),
  ]);

  const bannerCta = getBannerCta(user);

  return (
    <PublicShell user={user} mainClassName="space-y-7 py-6 sm:py-8">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
        <div className="space-y-1.5 md:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            GALERI KOMUNITAS
          </p>
          <h1 className="text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
            Jelajahi karya dari kreator bertalenta.
          </h1>
        </div>
        <p className="text-sm text-ink-soft sm:text-base md:col-span-5">
          Temukan ilustrasi, fotografi, desain antarmuka, hingga eksplorasi 3D terbaru yang dipublikasikan oleh komunitas ARTIVA.
        </p>
      </section>

      <ArtworkExplorer
        initialArtworks={result.items}
        categories={categories}
        initialQuery={q}
        initialCategory={category}
        initialSort={sort}
      />

      <section className="edge-glow flex flex-col items-start justify-between gap-4 rounded-[26px] bg-grad-hero p-5 shadow-glass sm:flex-row sm:items-center sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            BAGIKAN KARYAMU
          </p>
          <h2 className="text-xl font-semibold text-ink sm:text-2xl">
            Dari terinspirasi, jadi menginspirasi.
          </h2>
        </div>
        <Button variant="primary" href={bannerCta.href}>
          {bannerCta.label}
        </Button>
      </section>
    </PublicShell>
  );
}
