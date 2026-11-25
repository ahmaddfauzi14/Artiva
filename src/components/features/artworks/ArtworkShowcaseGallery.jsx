'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import CircularGallery from '@/components/effects/CircularGallery';
import { useMotion } from '@/components/effects/MotionContext';
import { formatDateId } from '@/lib/shared/format';

function buildGalleryItems(artworks, fallbackCreatorName) {
  return artworks.map((art) => {
    const creator =
      art.creator?.display_name || fallbackCreatorName || 'Kreator ARTIVA';
    const catName = art.category?.name || 'Karya';
    const rawDesc = (art.description || '').trim();
    const shortDesc =
      rawDesc.length > 110 ? `${rawDesc.slice(0, 110).trimEnd()}…` : rawDesc;

    const summary = shortDesc
      ? `${shortDesc} · Oleh ${creator} (${catName})`
      : `Oleh ${creator} · ${catName} · ${art.like_count ?? 0} suka · ${art.comment_count ?? 0} komentar`;

    return {
      image: art.image_url || '',
      text: art.title,
      description: summary,
      alt: `${art.title} oleh ${creator}`,
    };
  });
}

/**
 * Bingkai galeri lengkung 3D interaktif beserta bar petunjuk dan penghitung item.
 */
export function ArtworkShowcaseFrame({
  artworks = [],
  fallbackCreatorName = '',
  activeIndex = 0,
  onActiveChange,
  ariaLabel = 'Galeri lengkung interaktif karya komunitas ARTIVA',
  heightClass = 'h-[300px] sm:h-[360px] lg:h-[400px]',
  fillHeight = false,
}) {
  const { isMotionActive } = useMotion();

  const galleryItems = useMemo(
    () => buildGalleryItems(artworks, fallbackCreatorName),
    [artworks, fallbackCreatorName]
  );

  if (artworks.length === 0) return null;

  const safeIndex = activeIndex % artworks.length;

  return (
    <div
      className={`edge-glow relative flex flex-col overflow-hidden rounded-[26px] border border-line bg-brand-900/65 shadow-glass ${
        fillHeight ? 'h-full' : ''
      }`}
    >
      <div className={`min-h-0 w-full ${heightClass}`}>
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
          onActiveChange={onActiveChange}
          onItemClick={(_item, index) => onActiveChange?.(index)}
          aria-label={ariaLabel}
        />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line/70 px-5 py-2.5 text-xs text-ink-soft">
        <span>
          Seret, gulir, atau gunakan tombol panah untuk menjelajah · Klik karya untuk tampilan penuh
        </span>
        <span className="tabular-nums font-semibold text-brand-700">
          {String(safeIndex + 1).padStart(2, '0')} /{' '}
          {String(artworks.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

/**
 * Kartu sorotan ringkas untuk karya yang sedang aktif di CircularGallery.
 */
export function ArtworkSpotlightCard({
  artwork,
  fallbackCreatorName = '',
  showCreatorInfo = true,
}) {
  if (!artwork) return null;

  const creatorUsername = artwork.creator?.username;
  const creatorDisplayName =
    artwork.creator?.display_name || fallbackCreatorName || 'Kreator ARTIVA';

  return (
    <article className="spotlight-surface flex flex-col justify-between gap-5 rounded-[26px] border border-line bg-surface p-5 shadow-card sm:p-6 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">
            {artwork.category?.name || 'Karya'}
          </span>
          <span className="text-ink-mute">
            {formatDateId(artwork.created_at)}
          </span>
          <span className="tabular-nums text-ink-soft">
            · {artwork.like_count ?? 0} suka · {artwork.comment_count ?? 0}{' '}
            komentar
          </span>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-xl font-semibold text-ink sm:text-2xl">
            {artwork.title}
          </h2>
          {showCreatorInfo ? (
            <p className="text-sm text-ink-soft">
              Oleh{' '}
              {creatorUsername ? (
                <Link
                  href={`/creators/${creatorUsername}`}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  {creatorDisplayName}
                </Link>
              ) : (
                <span className="font-semibold text-ink">
                  {creatorDisplayName}
                </span>
              )}
            </p>
          ) : null}
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
          {artwork.description || 'Belum ada deskripsi cerita untuk karya ini.'}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        {showCreatorInfo && creatorUsername ? (
          <Button variant="secondary" href={`/creators/${creatorUsername}`}>
            Kontak kreator →
          </Button>
        ) : null}
        <Button variant="primary" href={`/artworks/${artwork.artwork_id}`}>
          Lihat detail &amp; apresiasi →
        </Button>
      </div>
    </article>
  );
}

/**
 * Kombinasi galeri lengkung dan kartu sorotan untuk halaman Eksplorasi Karya.
 */
export default function ArtworkShowcaseGallery({
  artworks = [],
  fallbackCreatorName = '',
  showCreatorInfo = true,
  ariaLabel = 'Galeri lengkung interaktif karya komunitas ARTIVA',
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (artworks.length === 0) return null;

  const activeArtwork = artworks[activeIndex % artworks.length] || artworks[0];

  return (
    <div className="space-y-5">
      <ArtworkShowcaseFrame
        artworks={artworks}
        fallbackCreatorName={fallbackCreatorName}
        activeIndex={activeIndex}
        onActiveChange={setActiveIndex}
        ariaLabel={ariaLabel}
      />
      <ArtworkSpotlightCard
        artwork={activeArtwork}
        fallbackCreatorName={fallbackCreatorName}
        showCreatorInfo={showCreatorInfo}
      />
    </div>
  );
}
