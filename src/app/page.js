import Link from 'next/link';
import ArtworkCard from '@/components/cards/ArtworkCard';
import Button from '@/components/ui/Button';
import ChallengeCard from '@/components/cards/ChallengeCard';
import EmptyState from '@/components/ui/EmptyState';
import Footer from '@/components/layout/Footer';
import HomeSearchBox from '@/components/features/home/HomeSearchBox';
import Navbar from '@/components/layout/Navbar';
import StepCard from '@/components/cards/StepCard';
import WinnerPodium from '@/components/cards/WinnerPodium';
import { getCurrentUser } from '@/lib/auth/session';
import { listPublicArtworks } from '@/lib/repositories/artworks';
import { listActiveCategories } from '@/lib/repositories/categories';
import {
  listLatestAnnouncedWinners,
  listPublicChallenges,
} from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';

function getWorkspacePath(user) {
  if (!user) return '/login';
  if (user.role === 'curator' && user.status !== 'active') {
    return '/dashboard/curator/verification';
  }
  return `/dashboard/${user.role}`;
}

export default async function HomePage() {
  const [user, categories, artworksData, openChallengesData, latestWinnersData] =
    await Promise.all([
      getCurrentUser(),
      listActiveCategories(),
      listPublicArtworks({ limit: 4 }),
      listPublicChallenges({ status: 'open', limit: 1 }),
      listLatestAnnouncedWinners(),
    ]);

  let featuredChallenge = openChallengesData.items[0] || null;
  if (!featuredChallenge) {
    const anyChallenges = await listPublicChallenges({ limit: 1 });
    featuredChallenge = anyChallenges.items[0] || null;
  }

  const latestArtworks = artworksData.items || [];
  const heroArtwork = latestArtworks.find((item) => Boolean(item.image_url)) || null;
  const winners = latestWinnersData.winners || [];
  const workspaceHref = getWorkspacePath(user);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-14 px-5 py-10 md:space-y-16 md:px-8 lg:py-12">
        {/* 1. Hero Editorial Seimbang */}
        <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              PLATFORM SHOWCASE &amp; TANTANGAN KREATIF
            </p>
            <h1 className="text-display-fluid font-semibold text-ink">
              Karyamu punya cerita. Saatnya dilihat dunia.
            </h1>
            <p className="max-w-xl text-lg text-ink-soft">
              Satu karya, tiga fungsi: tampil di portofolio digital, berinteraksi lewat apresiasi komunitas, dan berkompetisi di tantangan kurasi tanpa mengunggah ulang file.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button variant="primary" size="lg" href="/artworks">
                Jelajahi karya →
              </Button>
              {user ? (
                <Button variant="secondary" size="lg" href={workspaceHref}>
                  Buka ruang saya →
                </Button>
              ) : (
                <Button variant="secondary" size="lg" href="/register/member">
                  Gabung sebagai Member
                </Button>
              )}
            </div>
            <p className="text-sm text-ink-soft">
              {user
                ? 'Kelola karya portofoliomu atau ikuti tantangan yang sedang terbuka.'
                : 'Eksplorasi bebas. Bergabung saat kamu siap berkarya.'}
            </p>
          </div>

          {/* Sorotan Visual Hero agar proporsi kanan-kiri seimbang */}
          <div className="lg:col-span-5">
            <div className="edge-glow rounded-[28px] bg-grad-hero p-4 shadow-glass sm:p-5">
              {heroArtwork ? (
                <Link
                  href={`/artworks/${heroArtwork.artwork_id}`}
                  className="group block overflow-hidden rounded-[18px] border border-line bg-surface shadow-card-sm"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
                    <img
                      src={heroArtwork.image_url}
                      alt={heroArtwork.title}
                      className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/95 via-brand-900/60 to-transparent p-4 pt-10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700">
                        {heroArtwork.category?.name || 'GALERI KURASI'}
                      </p>
                      <p className="mt-0.5 truncate text-base font-semibold text-ink">
                        {heroArtwork.title}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        {heroArtwork.creator?.display_name
                          ? `oleh ${heroArtwork.creator.display_name}`
                          : 'Karya terbaru komunitas ARTIVA'}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link
                  href={user?.role === 'member' ? '/dashboard/member/artworks/new' : '/artworks'}
                  className="group flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-[18px] border border-line bg-surface p-5 shadow-card-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700">
                      ETALASE KOMUNITAS
                    </span>
                    <span className="text-xs font-semibold text-brand-700 group-hover:translate-x-0.5 motion-safe:transition-transform">
                      {user?.role === 'member' ? 'Unggah →' : 'Galeri →'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xl font-semibold leading-snug text-ink">
                      Ruang bagi setiap karya orisinal kreator.
                    </p>
                    <p className="text-sm text-ink-soft">
                      Publikasikan karya pertamamu agar tampil di sorotan utama ARTIVA.
                    </p>
                  </div>
                </Link>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-[14px] border border-line/80 bg-surface/75 px-2.5 py-2.5">
                  <p className="tabular-nums text-xs font-semibold text-brand-700">01</p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">Portofolio</p>
                </div>
                <div className="rounded-[14px] border border-line/80 bg-surface/75 px-2.5 py-2.5">
                  <p className="tabular-nums text-xs font-semibold text-brand-700">02</p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">Apresiasi</p>
                </div>
                <div className="rounded-[14px] border border-line/80 bg-surface/75 px-2.5 py-2.5">
                  <p className="tabular-nums text-xs font-semibold text-brand-700">03</p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">Kompetisi</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Inspirasi tanpa batas */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                TEMUKAN PERSPEKTIF BARU
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-tight text-ink sm:text-[30px]">
                Inspirasi tanpa batas.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
              <HomeSearchBox />
              <Link
                href="/artworks"
                className="inline-flex min-h-[44px] shrink-0 items-center text-sm font-semibold text-brand-700 hover:underline"
              >
                Lihat semua →
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scroll-smooth sm:overflow-visible sm:pb-0 sm:wrap-balance">
            <Link
              href="/artworks"
              className="min-h-[44px] inline-flex shrink-0 items-center rounded-full bg-grad-primary px-5 text-sm font-semibold text-white shadow-btn"
            >
              Semua karya
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                href={`/artworks?category=${cat.slug}`}
                className="min-h-[44px] inline-flex shrink-0 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink shadow-card-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {latestArtworks.length === 0 ? (
            <EmptyState
              title="Galeri menanti karya pertamamu"
              description="Jadilah kreator pertama yang membagikan karya digital ke komunitas ARTIVA."
              actionLabel="Unggah karya pertama →"
              actionHref={
                user?.role === 'member'
                  ? '/dashboard/member/artworks/new'
                  : '/register/member'
              }
            />
          ) : (
            <div
              className={`auto-grid-cards gap-6 ${
                latestArtworks.length === 1 ? 'max-w-sm' : ''
              }`}
            >
              {latestArtworks.map((art, idx) => (
                <ArtworkCard key={art.artwork_id} artwork={art} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* 3. Ubah ide jadi tantangan */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                KOMPETISI TERKURASI
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-tight text-ink sm:text-[30px]">
                Ubah ide jadi tantangan.
              </h2>
            </div>
            <Link
              href="/challenges"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-brand-700 hover:underline"
            >
              Lihat semua tantangan →
            </Link>
          </div>

          {featuredChallenge ? (
            <ChallengeCard challenge={featuredChallenge} variant="feature" />
          ) : (
            <EmptyState
              title="Tantangan baru segera dibuka"
              description="Para Kurator sedang menyiapkan tantangan kreatif berikutnya untuk komunitas."
              actionLabel={
                user?.role === 'curator'
                  ? 'Buka ruang Kurator →'
                  : 'Ajukan sebagai Kurator →'
              }
              actionHref={
                user?.role === 'curator' ? workspaceHref : '/register/curator'
              }
            />
          )}
        </section>

        {/* 4. Karya yang mencuri perhatian */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                APRESIASI UNTUK KREATIVITAS
              </p>
              <h2 className="mt-1 text-[24px] font-semibold leading-tight text-ink sm:text-[30px]">
                Karya yang mencuri perhatian.
              </h2>
            </div>
            {latestWinnersData.challenge ? (
              <Link
                href={`/challenges/${latestWinnersData.challenge.challenge_id}`}
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-brand-700 hover:underline"
              >
                Dari tantangan: {latestWinnersData.challenge.title} →
              </Link>
            ) : null}
          </div>

          {winners.length > 0 ? (
            <WinnerPodium winners={winners} />
          ) : (
            <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] bg-tint-butter p-6 shadow-tint-butter sm:flex-row sm:items-center sm:p-8">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-ink">
                  Pemenang tantangan akan tampil di sini setelah kurasi diumumkan.
                </p>
                <p className="text-base text-ink-soft">
                  Ikuti tantangan terbuka dan wujudkan karyamu menjadi salah satu sorotan utama.
                </p>
              </div>
              <Button variant="secondary" href="/challenges" className="shrink-0">
                Jelajahi tantangan →
              </Button>
            </div>
          )}
        </section>

        {/* 5. Mulai perjalanan kreatifmu (StepCard sejajar subgrid di desktop) */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              ALUR BERKARYA DI ARTIVA
            </p>
            <h2 className="mt-1 text-[24px] font-semibold leading-tight text-ink sm:text-[30px]">
              Mulai perjalanan kreatifmu.
            </h2>
          </div>

          <div className="subgrid-step-row gap-6 lg:pb-3">
            <StepCard
              index={0}
              stagger
              number="01"
              tint="lavender"
              title={user ? 'Lengkapi portofoliomu' : 'Buat akun Member'}
              description={
                user
                  ? 'Kelola ruang karyamu dan perbarui profil kreator sesuai gaya visualmu.'
                  : 'Siapkan profil kreator pribadimu dalam beberapa detik tanpa biaya.'
              }
              href={user ? workspaceHref : '/register/member'}
              ctaLabel={user ? 'Buka ruang saya →' : 'Daftar Member →'}
            />
            <StepCard
              index={1}
              stagger
              number="02"
              tint="mint"
              title="Publikasikan karya"
              description="Unggah gambar karyamu sekali saja dengan kontrol penuh status publikasi."
              href={
                user?.role === 'member'
                  ? '/dashboard/member/artworks/new'
                  : '/artworks'
              }
              ctaLabel={
                user?.role === 'member' ? 'Tambah karya →' : 'Lihat galeri →'
              }
            />
            <StepCard
              index={2}
              stagger
              number="03"
              tint="peach"
              title="Ikut tantangan"
              description="Pilih karya dari portofoliomu untuk ikut kompetisi kurasi tanpa unggah ulang."
              href="/challenges"
              ctaLabel="Jelajahi tantangan →"
            />
          </div>
        </section>

        {/* 6. Panel CTA */}
        <section>
          {user ? (
            <div className="edge-glow grid grid-cols-1 items-center gap-6 rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  SIAP BERKARYA HARI INI
                </p>
                <h2 className="text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
                  Lanjutkan kreativitasmu di ruang ARTIVA.
                </h2>
                <p className="text-base text-ink-soft">
                  Kelola karya portofolio, ikuti tantangan terbuka, atau jelajahi perspektif baru dari kreator lain.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
                <Button variant="primary" size="lg" href={workspaceHref}>
                  Buka ruang saya →
                </Button>
                <Button variant="secondary" size="lg" href="/challenges">
                  Lihat tantangan →
                </Button>
              </div>
            </div>
          ) : (
            <div className="edge-glow grid grid-cols-1 gap-6 rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-8 lg:grid-cols-12">
              <div className="flex flex-col justify-between gap-6 lg:col-span-6 lg:pr-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                    BERGABUNG SEKARANG
                  </p>
                  <h2 className="text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
                    Setiap peran membuka kemungkinan baru.
                  </h2>
                  <p className="text-base text-ink-soft">
                    Bagikan perspektif visualmu, beri dukungan kepada sesama kreator, dan kembangkan portofolio yang terarah.
                  </p>
                </div>
                <div>
                  <Button variant="primary" size="lg" href="/register/member">
                    Daftar sebagai Member →
                  </Button>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                    UNTUK PENYELENGGARA
                  </p>
                  <h3 className="text-2xl font-semibold text-ink">
                    Punya visi untuk komunitas kreatif?
                  </h3>
                  <p className="text-base text-ink-soft">
                    Kelola tantangan tematik, tinjau karya masuk, dan umumkan pemenang secara transparan sebagai Kurator terverifikasi.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button variant="secondary" href="/register/curator">
                    Ajukan sebagai Kurator →
                  </Button>
                  <p className="text-xs text-ink-mute">
                    Pengajuan ditinjau dan diverifikasi oleh admin.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
