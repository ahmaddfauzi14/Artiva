'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import CircularGallery from '@/components/effects/CircularGallery';
import EmptyState from '@/components/ui/EmptyState';
import { useMotion } from '@/components/effects/MotionContext';
import Pagination from '@/components/ui/Pagination';
import ProfileCard from '@/components/effects/ProfileCard';
import TiltedCard from '@/components/effects/TiltedCard';
import { useToast } from '@/components/ui/Toast';
import { formatDateId } from '@/lib/shared/format';

export default function CreatorProfile({ creator, artworks = [], meta }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { isMotionActive } = useMotion();
  const [flipped, setFlipped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeWebsite =
    creator.website && /^https?:\/\//i.test(creator.website)
      ? creator.website
      : null;

  const roleLabel =
    creator.role === 'curator' ? 'Kurator Terverifikasi' : 'Kreator ARTIVA';

  const visibleArtworks = useMemo(() => artworks || [], [artworks]);

  const galleryItems = useMemo(
    () =>
      visibleArtworks.map((art) => {
        const catName = art.category?.name || 'Karya';
        const rawDesc = (art.description || '').trim();
        const shortDesc =
          rawDesc.length > 110 ? `${rawDesc.slice(0, 110).trimEnd()}…` : rawDesc;
        const summary = shortDesc
          ? `${shortDesc} · Oleh ${creator.display_name} (${catName})`
          : `Oleh ${creator.display_name} · ${catName} · ${art.like_count ?? 0} suka · ${art.comment_count ?? 0} komentar`;
        return {
          image: art.image_url || '',
          text: art.title,
          description: summary,
          alt: `${art.title} oleh ${creator.display_name}`,
        };
      }),
    [visibleArtworks, creator.display_name]
  );

  const activeArtwork =
    visibleArtworks[activeIndex % Math.max(visibleArtworks.length, 1)] || null;

  const handleCopyProfileLink = async () => {
    try {
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}/creators/${creator.username}`
          : `/creators/${creator.username}`;
      await navigator.clipboard.writeText(url);
      showToast({
        title: 'Tautan profil disalin',
        message: `Profil @${creator.username} siap dibagikan.`,
        tone: 'success',
      });
    } catch {
      showToast({
        title: 'Tidak dapat menyalin otomatis',
        message: `Bagikan alamat /creators/${creator.username} secara manual.`,
        tone: 'warning',
      });
    }
  };

  const backContent = (
    <div className="flex h-full w-full flex-col justify-between p-6 text-ink">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#F2C94C]">
              BIODATA &amp; KONTAK
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold text-ink">
              {creator.display_name}
            </h2>
            <p className="truncate text-xs text-ink-soft">@{creator.username}</p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            className="shrink-0 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-[#F2C94C]/60 hover:text-ink"
          >
            ↺ Profil
          </button>
        </div>

        <div className="rounded-[16px] border border-line/80 bg-[#091326]/60 p-4">
          <p className="max-h-[120px] overflow-y-auto text-sm leading-relaxed text-ink-soft">
            {creator.bio || 'Kreator ini belum menambahkan biodata singkat.'}
          </p>
        </div>

        <dl className="space-y-2.5 border-t border-line pt-4 text-xs text-ink-soft">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-mute">Peran</dt>
            <dd className="font-semibold text-ink">{roleLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-mute">Karya</dt>
            <dd className="tabular-nums font-semibold text-ink">
              {meta.total} dipublikasikan
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-mute">Bergabung</dt>
            <dd className="font-medium text-ink">
              {formatDateId(creator.created_at)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 pt-3">
        {safeWebsite ? (
          <Button
            variant="primary"
            size="sm"
            href={safeWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full justify-center"
          >
            Kunjungi portofolio eksternal ↗
          </Button>
        ) : null}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyProfileLink}
          className="w-full justify-center"
        >
          Salin tautan profil @{creator.username}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Portofolio Kreator */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            PORTOFOLIO KARYA
          </p>
          <h1 className="mt-1 text-[1.625rem] font-semibold leading-tight text-ink sm:text-[2rem]">
            Karya oleh {creator.display_name}
          </h1>
        </div>
        <span className="tabular-nums rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink-soft">
          {meta.total} karya dipublikasikan
        </span>
      </div>

      {/* Baris Utama: ProfileCard (kiri) & CircularGallery Karya (kanan) setinggi sejajar */}
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-8">
        {/* Kiri: ProfileCard (depan) & Biodata/Kontak (belakang) dengan rasio terjaga */}
        <aside className="flex w-full shrink-0 justify-center lg:w-[390px]">
          <div className="h-[30.3125rem] w-[21.25rem] max-w-full sm:h-[33.75rem] sm:w-[24.375rem]">
            <TiltedCard
              altText={`Kartu profil ${creator.display_name}`}
              captionText={
                flipped
                  ? 'Klik kartu untuk kembali ke profil'
                  : 'Klik kartu atau Kontak untuk biodata'
              }
              containerWidth="100%"
              containerHeight="100%"
              imageWidth="100%"
              imageHeight="100%"
              rotateAmplitude={10}
              scaleOnHover={1.03}
              radius={26}
              glare={0.45}
              glareColor="#F2C94C"
              shadow={0.55}
              showTooltip
              flipped={flipped}
              onFlip={setFlipped}
              backContent={backContent}
            >
              <ProfileCard
                name={creator.display_name}
                title={roleLabel}
                handle={creator.username}
                status={`${meta.total} karya dipublikasikan`}
                statusColor="#F2C94C"
                contactText="Kontak"
                avatarUrl={creator.avatar_url || ''}
                miniAvatarUrl={creator.avatar_url || ''}
                holo={0.8}
                glare={0.4}
                enableTilt={false}
                intro={false}
                parallax={8}
                radius={16}
                showUserInfo
                theme="dark"
                onContactClick={() => setFlipped(true)}
              />
            </TiltedCard>
          </div>
        </aside>

        {/* Kanan: Galeri Karya CircularGallery setinggi sama dengan ProfileCard */}
        <section className="flex min-w-0 w-full flex-1 flex-col">
          {visibleArtworks.length === 0 ? (
            <div className="flex h-[26.25rem] items-center justify-center rounded-[28px] border border-line bg-surface/75 p-6 sm:h-[33.75rem]">
              <EmptyState
                title="Belum ada karya dipublikasikan"
                description="Kreator ini belum menampilkan karya publik di galeri ARTIVA."
              />
            </div>
          ) : (
            <div className="edge-glow flex h-[26.25rem] w-full flex-col overflow-hidden rounded-[28px] border border-line bg-brand-900/65 shadow-glass sm:h-[33.75rem]">
              <div className="min-h-0 w-full flex-1">
                <CircularGallery
                  items={galleryItems}
                  bend={3}
                  itemSize={1.12}
                  textColor="#F7F3E6"
                  borderRadius={0.05}
                  font="600 28px Poppins, sans-serif"
                  scrollEase={isMotionActive ? 0.05 : 1}
                  wave={isMotionActive ? 1 : 0}
                  openOnClick
                  intro={isMotionActive}
                  onActiveChange={(index) => setActiveIndex(index)}
                  onItemClick={(_item, index) => setActiveIndex(index)}
                  aria-label={`Galeri lengkung karya ${creator.display_name}`}
                />
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line/70 px-5 py-3 text-xs text-ink-soft">
                <span>
                  Seret, gulir, atau gunakan tombol panah untuk menjelajah · Klik karya untuk membuka tampilan penuh
                </span>
                <span className="tabular-nums font-semibold text-brand-700">
                  {String((activeIndex % visibleArtworks.length) + 1).padStart(
                    2,
                    '0'
                  )}{' '}
                  / {String(visibleArtworks.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Panel Detail Karya Terpilih di Bawah */}
      {activeArtwork ? (
        <article className="spotlight-surface flex flex-col justify-between gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
                {activeArtwork.category?.name || 'Karya'}
              </span>
              <span className="text-ink-mute">
                {formatDateId(activeArtwork.created_at)}
              </span>
              <span className="tabular-nums text-ink-soft">
                · {activeArtwork.like_count ?? 0} suka ·{' '}
                {activeArtwork.comment_count ?? 0} komentar
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-ink sm:text-[1.75rem]">
              {activeArtwork.title}
            </h2>

            <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
              {activeArtwork.description ||
                'Belum ada deskripsi cerita untuk karya ini.'}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button
              variant="primary"
              href={`/artworks/${activeArtwork.artwork_id}`}
            >
              Lihat detail &amp; apresiasi →
            </Button>
          </div>
        </article>
      ) : null}

      <Pagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={(nextPage) =>
          router.push(`/creators/${creator.username}?page=${nextPage}`)
        }
      />
    </div>
  );
}
