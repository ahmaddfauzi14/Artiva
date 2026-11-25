import Link from 'next/link';
import ArtworkCard from '@/components/cards/ArtworkCard';
import ChallengeCard from '@/components/cards/ChallengeCard';
import StepCard from '@/components/cards/StepCard';
import WinnerPodium from '@/components/cards/WinnerPodium';
import HomeSearchBox from '@/components/features/home/HomeSearchBox';
import PublicShell from '@/components/layout/PublicShell';
import SectionHeader from '@/components/layout/SectionHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getPublicViewer } from '@/lib/auth/page-guards';
import { listPublicArtworks } from '@/lib/repositories/artworks';
import { listActiveCategories } from '@/lib/repositories/categories';
import {
  listLatestAnnouncedWinners,
  listPublicChallenges,
} from '@/lib/repositories/challenges';

export const dynamic = 'force-dynamic';

/**
 * Menentukan tombol CTA sekunder pada bagian Hero sesuai peran pengguna.
 */
function getHeroSecondaryCta(user) {
  if (user?.role === 'member') {
    return { label: 'Karya saya →', href: '/me/artworks' };
  }
  if (user?.role === 'curator') {
    const isActive = user.status === 'active';
    return {
      label: isActive ? 'Kelola tantangan →' : 'Status verifikasi →',
      href: isActive ? '/curator/challenges' : '/curator/verification',
    };
  }
  return { label: 'Gabung sebagai Member', href: '/register/member' };
}

/**
 * Menentukan kartu langkah pertama (01) pada alur berkarya sesuai peran pengguna.
 */
function getFirstStepConfig(user) {
  if (user?.role === 'member') {
    return {
      title: 'Lengkapi profilmu',
      description:
        'Perbarui bio, foto profil, dan tautan portofolio kreator sesuai gaya visualmu.',
      href: '/me/profile',
      ctaLabel: 'Atur profil →',
    };
  }
  if (user?.role === 'curator') {
    const isActive = user.status === 'active';
    return isActive
      ? {
          title: 'Lengkapi profil kurator',
          description:
            'Perbarui nama penyelenggara, bio kurasi, dan tautan portofolio kuratormu.',
          href: '/curator/profile',
          ctaLabel: 'Atur profil →',
        }
      : {
          title: 'Status verifikasi kurator',
          description:
            'Pantau status peninjauan pengajuan akun Kurator oleh tim Admin.',
          href: '/curator/verification',
          ctaLabel: 'Lihat status →',
        };
  }
  return {
    title: 'Buat akun Member',
    description:
      'Siapkan profil kreator pribadimu dalam beberapa detik tanpa biaya.',
    href: '/register/member',
    ctaLabel: 'Daftar Member →',
  };
}

/**
 * Menentukan tombol utama untuk panel CTA penutup saat pengguna sudah masuk.
 */
function getClosingPrimaryCta(user) {
  if (user.role === 'member') {
    return { label: 'Karya saya →', href: '/me/artworks' };
  }
  const isActive = user.status === 'active';
  return {
    label: isActive ? 'Kelola tantangan →' : 'Status verifikasi →',
    href: isActive ? '/curator/challenges' : '/curator/verification',
  };
}

export default async function HomePage() {
  const user = await getPublicViewer();

  const [
    categories,
    artworksData,
    popularArtworksData,
    openChallengesData,
    latestWinnersData,
  ] = await Promise.all([
    listActiveCategories(),
    listPublicArtworks({ limit: 4 }),
    listPublicArtworks({ sort: 'popular', limit: 4 }),
    listPublicChallenges({ status: 'open', limit: 1 }),
    listLatestAnnouncedWinners(),
  ]);

  let featuredChallenge = openChallengesData.items[0] || null;
  if (!featuredChallenge) {
    const anyChallenges = await listPublicChallenges({ limit: 1 });
    featuredChallenge = anyChallenges.items[0] || null;
  }

  const latestArtworks = artworksData.items || [];
  const popularArtworks = popularArtworksData.items || [];
  const heroArtwork =
    latestArtworks.find((item) => Boolean(item.image_url)) ||
    popularArtworks.find((item) => Boolean(item.image_url)) ||
    null;
  const winners = latestWinnersData.winners || [];

  const heroCta = getHeroSecondaryCta(user);
  const firstStep = getFirstStepConfig(user);
  const isSignedInCreator =
    user && (user.role === 'member' || user.role === 'curator');

  const curatorEmptyAction =
    user?.role === 'curator'
      ? user.status === 'active'
        ? { label: 'Buat tantangan →', href: '/curator/challenges/new' }
        : { label: 'Status verifikasi →', href: '/curator/verification' }
      : { label: 'Ajukan sebagai Kurator →', href: '/register/curator' };

  return (
    <PublicShell user={user} mainClassName="space-y-10 py-6 sm:space-y-12 sm:py-8">
      {/* 1. Hero Editorial Seimbang */}
      <section className="grid grid-cols-1 items-center gap-7 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-4 lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            PLATFORM SHOWCASE &amp; TANTANGAN KREATIF
          </p>
          <h1 className="text-display-fluid font-semibold text-ink">
            Karyamu punya cerita. Saatnya dilihat dunia.
          </h1>
          <p className="max-w-xl text-base text-ink-soft sm:text-lg">
            Satu karya, tiga fungsi: tampil di portofolio digital, berinteraksi lewat apresiasi komunitas, dan berkompetisi di tantangan kurasi tanpa mengunggah ulang file.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button variant="primary" size="lg" href="/artworks">
              Jelajahi karya →
            </Button>
            <Button variant="secondary" size="lg" href={heroCta.href}>
              {heroCta.label}
            </Button>
          </div>

          <p className="text-sm text-ink-soft">
            {user
              ? 'Kelola karya portofoliomu atau ikuti tantangan yang sedang terbuka.'
              : 'Eksplorasi bebas. Bergabung saat kamu siap berkarya.'}
          </p>
        </div>

        {/* Sorotan Visual Hero */}
        <div className="lg:col-span-5">
          <div className="edge-glow rounded-[26px] bg-grad-hero p-4 shadow-glass">
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
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-brand-700">
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
                href={user?.role === 'member' ? '/me/artworks/new' : '/artworks'}
                className="group flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-[18px] border border-line bg-surface p-5 shadow-card-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-brand-700">
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
              {[
                { num: '01', label: 'Portofolio' },
                { num: '02', label: 'Apresiasi' },
                { num: '03', label: 'Kompetisi' },
              ].map((pillar) => (
                <div
                  key={pillar.num}
                  className="rounded-[14px] border border-line/80 bg-surface/75 px-2.5 py-2"
                >
                  <p className="tabular-nums text-xs font-semibold text-brand-700">
                    {pillar.num}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">
                    {pillar.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Inspirasi tanpa batas */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="TEMUKAN PERSPEKTIF BARU"
          title="Inspirasi tanpa batas."
          rightSlot={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <HomeSearchBox />
              <Link
                href="/artworks"
                className="inline-flex min-h-[44px] shrink-0 items-center text-sm font-semibold text-brand-700 hover:underline"
              >
                Lihat semua →
              </Link>
            </div>
          }
        />

        <nav
          aria-label="Filter kategori karya"
          className="flex flex-wrap items-center gap-x-1.5 gap-y-2.5 lg:gap-2.5"
        >
          <Link
            href="/artworks"
            aria-current="page"
            className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full bg-grad-primary px-3 text-[0.8125rem] font-semibold text-white shadow-btn lg:px-4 lg:text-sm"
          >
            Semua karya
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.category_id}
              href={`/artworks?category=${cat.slug}`}
              className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-line bg-surface px-3 text-[0.8125rem] font-semibold text-ink shadow-card-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 lg:px-4 lg:text-sm"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {latestArtworks.length === 0 ? (
          <EmptyState
            title="Galeri menanti karya pertamamu"
            description="Jadilah kreator pertama yang membagikan karya digital ke komunitas ARTIVA."
            actionLabel="Unggah karya pertama →"
            actionHref={
              user?.role === 'member' ? '/me/artworks/new' : '/register/member'
            }
          />
        ) : (
          <div className="auto-grid-cards gap-5">
            {latestArtworks.map((art, idx) => (
              <ArtworkCard key={art.artwork_id} artwork={art} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Karya paling populer */}
      <section aria-labelledby="karya-populer" className="space-y-5">
        <SectionHeader
          id="karya-populer"
          eyebrow="PALING BANYAK DISUKAI"
          title="Karya terpopuler di komunitas."
          actionLabel="Lihat karya populer →"
          actionHref="/artworks?sort=popular"
        />

        {popularArtworks.length === 0 ? (
          <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] bg-tint-sky p-5 shadow-tint-sky sm:flex-row sm:items-center sm:p-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink">
                Sorotan karya terpopuler akan tampil di sini.
              </p>
              <p className="text-sm text-ink-soft sm:text-base">
                Jelajahi galeri dan berikan suka pada karya favoritmu dari kreator ARTIVA.
              </p>
            </div>
            <Button
              variant="secondary"
              href="/artworks?sort=popular"
              className="shrink-0"
            >
              Jelajahi galeri →
            </Button>
          </div>
        ) : (
          <div className="auto-grid-cards gap-5">
            {popularArtworks.map((art, idx) => (
              <ArtworkCard key={art.artwork_id} artwork={art} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Ubah ide jadi tantangan */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="KOMPETISI TERKURASI"
          title="Ubah ide jadi tantangan."
          actionLabel="Lihat semua tantangan →"
          actionHref="/challenges"
        />

        {featuredChallenge ? (
          <ChallengeCard challenge={featuredChallenge} variant="feature" />
        ) : (
          <EmptyState
            title="Tantangan baru segera dibuka"
            description="Para Kurator sedang menyiapkan tantangan kreatif berikutnya untuk komunitas."
            actionLabel={curatorEmptyAction.label}
            actionHref={curatorEmptyAction.href}
          />
        )}
      </section>

      {/* 4. Karya yang mencuri perhatian */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="APRESIASI UNTUK KREATIVITAS"
          title="Karya yang mencuri perhatian."
          actionLabel={
            latestWinnersData.challenge
              ? `Dari tantangan: ${latestWinnersData.challenge.title} →`
              : undefined
          }
          actionHref={
            latestWinnersData.challenge
              ? `/challenges/${latestWinnersData.challenge.challenge_id}`
              : undefined
          }
        />

        {winners.length > 0 ? (
          <WinnerPodium winners={winners} />
        ) : (
          <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] bg-tint-butter p-5 shadow-tint-butter sm:flex-row sm:items-center sm:p-6">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-ink">
                Pemenang tantangan akan tampil di sini setelah kurasi diumumkan.
              </p>
              <p className="text-sm text-ink-soft sm:text-base">
                Ikuti tantangan terbuka dan wujudkan karyamu menjadi salah satu sorotan utama.
              </p>
            </div>
            <Button variant="secondary" href="/challenges" className="shrink-0">
              Jelajahi tantangan →
            </Button>
          </div>
        )}
      </section>

      {/* 5. Mulai perjalanan kreatifmu */}
      <section className="space-y-5">
        <SectionHeader
          eyebrow="ALUR BERKARYA DI ARTIVA"
          title="Mulai perjalanan kreatifmu."
        />

        <div className="subgrid-step-row gap-5 lg:pb-2">
          <StepCard
            index={0}
            stagger
            number="01"
            tint="lavender"
            title={firstStep.title}
            description={firstStep.description}
            href={firstStep.href}
            ctaLabel={firstStep.ctaLabel}
          />
          <StepCard
            index={1}
            stagger
            number="02"
            tint="mint"
            title="Publikasikan karya"
            description="Unggah gambar karyamu sekali saja dengan kontrol penuh status publikasi."
            href={user?.role === 'member' ? '/me/artworks/new' : '/artworks'}
            ctaLabel={user?.role === 'member' ? 'Tambah karya →' : 'Lihat galeri →'}
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

      {/* 6. Panel CTA Penutup */}
      <section>
        {isSignedInCreator ? (
          <div className="edge-glow grid grid-cols-1 items-center gap-5 rounded-[26px] bg-grad-hero p-6 shadow-glass sm:p-7 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                SIAP BERKARYA HARI INI
              </p>
              <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-[1.875rem]">
                {user.role === 'member'
                  ? 'Lanjutkan kreativitasmu di ARTIVA.'
                  : 'Lanjutkan kurasi tantangan di ARTIVA.'}
              </h2>
              <p className="text-sm text-ink-soft sm:text-base">
                {user.role === 'curator'
                  ? 'Kelola tantangan tematik, tinjau karya peserta, atau perbarui identitas kuratormu.'
                  : 'Kelola karya portofolio, ikuti tantangan terbuka, atau jelajahi perspektif baru dari kreator lain.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <Button
                variant="primary"
                size="lg"
                href={getClosingPrimaryCta(user).href}
              >
                {getClosingPrimaryCta(user).label}
              </Button>
              <Button variant="secondary" size="lg" href="/challenges">
                Lihat tantangan →
              </Button>
            </div>
          </div>
        ) : (
          <div className="edge-glow grid grid-cols-1 gap-5 rounded-[26px] bg-grad-hero p-5 shadow-glass sm:p-7 lg:grid-cols-12">
            <div className="flex flex-col justify-between gap-5 lg:col-span-6 lg:pr-4">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  BERGABUNG SEKARANG
                </p>
                <h2 className="text-2xl font-semibold leading-tight text-ink sm:text-[1.875rem]">
                  Setiap peran membuka kemungkinan baru.
                </h2>
                <p className="text-sm text-ink-soft sm:text-base">
                  Bagikan perspektif visualmu, beri dukungan kepada sesama kreator, dan kembangkan portofolio yang terarah.
                </p>
              </div>
              <div>
                <Button variant="primary" size="lg" href="/register/member">
                  Daftar sebagai Member →
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-5 rounded-[22px] border border-line bg-surface p-5 shadow-card sm:p-6 lg:col-span-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  UNTUK PENYELENGGARA
                </p>
                <h3 className="text-xl font-semibold text-ink sm:text-2xl">
                  Punya visi untuk komunitas kreatif?
                </h3>
                <p className="text-sm text-ink-soft sm:text-base">
                  Kelola tantangan tematik, tinjau karya masuk, dan umumkan pemenang secara transparan sebagai Kurator terverifikasi.
                </p>
              </div>
              <div className="space-y-1.5">
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
    </PublicShell>
  );
}
