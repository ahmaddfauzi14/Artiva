import ArtworkExplorer from '@/components/features/artworks/ArtworkExplorer';
import Button from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { getCurrentUser } from '@/lib/auth/session';
import { listPublicArtworks } from '@/lib/repositories/artworks';
import { listActiveCategories } from '@/lib/repositories/categories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Jelajahi Karya · ARTIVA',
};

export default async function ArtworksPage({ searchParams }) {
  const sp = await searchParams;
  const q = sp?.q || '';
  const category = sp?.category || 'all';
  const page = Math.max(1, Number(sp?.page || '1') || 1);

  const [user, categories, result] = await Promise.all([
    getCurrentUser(),
    listActiveCategories(),
    listPublicArtworks({ q, category, page, limit: 12 }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-5 py-10 md:px-8">
        <section className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
          <div className="space-y-2 md:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              GALERI KOMUNITAS
            </p>
            <h1 className="text-[32px] font-semibold leading-tight text-ink sm:text-[40px]">
              Jelajahi karya dari kreator bertalenta.
            </h1>
          </div>
          <p className="text-base text-ink-soft md:col-span-5">
            Temukan ilustrasi, fotografi, desain antarmuka, hingga eksplorasi 3D terbaru yang dipublikasikan oleh komunitas ARTIVA.
          </p>
        </section>

        <ArtworkExplorer
          initialArtworks={result.items}
          initialMeta={result.meta}
          categories={categories}
          initialQuery={q}
          initialCategory={category}
        />

        <section className="edge-glow flex flex-col items-start justify-between gap-6 rounded-[28px] bg-grad-hero p-6 shadow-glass sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              BAGIKAN KARYAMU
            </p>
            <h2 className="text-2xl font-semibold text-ink">
              Dari terinspirasi, jadi menginspirasi.
            </h2>
          </div>
          <Button
            variant="primary"
            href={
              user?.role === 'member'
                ? '/dashboard/member/artworks/new'
                : user
                  ? '/challenges'
                  : '/register/member'
            }
          >
            {user?.role === 'member'
              ? 'Unggah karya →'
              : user
                ? 'Jelajahi tantangan →'
                : 'Gabung sebagai Member →'}
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
