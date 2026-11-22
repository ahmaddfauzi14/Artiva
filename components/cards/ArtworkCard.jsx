'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { masonryAspectAt, tiltAt, tintCardClassAt } from '@/lib/shared/stagger';

export default function ArtworkCard({
  artwork,
  index = 0,
  mode = 'public',
  aspectClass,
  masonry = false,
  onToggleStatus,
  onDelete,
  togglingId = null,
  className = '',
}) {
  const isFullTint = mode === 'horizontal';
  const tintClass = tintCardClassAt(index, isFullTint);
  const tiltDeg = tiltAt(index);
  const chosenAspect =
    aspectClass || (masonry ? masonryAspectAt(index) : 'aspect-[4/5]');

  const isModerated =
    mode === 'public' && artwork.status && artwork.status !== 'published';
  const href =
    mode === 'dashboard' || mode === 'horizontal'
      ? `/dashboard/member/artworks/${artwork.artwork_id}/edit`
      : `/artworks/${artwork.artwork_id}`;

  const handlePointerMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    e.currentTarget.style.setProperty('--mx', `${x.toFixed(1)}%`);
    e.currentTarget.style.setProperty('--my', `${y.toFixed(1)}%`);
  };

  const mediaBlock = (
    <div
      className={`relative ${chosenAspect} w-full overflow-hidden rounded-[14px] bg-brand-50`}
    >
      {isModerated || !artwork.image_url ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#1B2945] p-4 text-center text-ink-soft">
          <svg
            className="mb-2 h-8 w-8 text-ink-mute"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.82A2 2 0 004.62 20h14.76a2 2 0 001.73-3.32l-7.4-12.82a2 2 0 00-3.42 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-semibold">
            Karya telah dihapus oleh moderasi
          </p>
        </div>
      ) : (
        <img
          src={artwork.image_url}
          alt={artwork.title}
          loading="lazy"
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 ease-[var(--ease-spring)] group-hover:scale-[1.03]"
        />
      )}

      {mode === 'dashboard' ? (
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge domain="artwork" status={artwork.status} />
        </div>
      ) : null}
    </div>
  );

  const captionBlock = (
    <div className="mt-3 space-y-1 px-1 pb-1">
      <h3 className="truncate text-lg font-semibold leading-snug text-ink">
        {isModerated ? 'Karya telah dihapus oleh moderasi' : artwork.title}
      </h3>
      <div className="flex items-center justify-between gap-2 text-sm text-ink-soft">
        <p className="truncate">
          {artwork.creator?.display_name ? `${artwork.creator.display_name} · ` : ''}
          {artwork.category?.name || 'Karya'}
        </p>
        {typeof artwork.like_count === 'number' &&
        mode === 'public' &&
        !isModerated ? (
          <span className="tabular-nums inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-soft">
            <svg
              className="h-3.5 w-3.5 text-brand-700"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            {artwork.like_count}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (mode === 'horizontal') {
    return (
      <article
        onPointerMove={handlePointerMove}
        className={`spotlight-surface group flex flex-col gap-5 rounded-[28px] p-4 sm:flex-row sm:items-center sm:justify-between ${tintClass} motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-0.5 hover:shadow-lift ${className}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href={
              artwork.status === 'published'
                ? `/artworks/${artwork.artwork_id}`
                : href
            }
            className="h-[140px] w-full shrink-0 overflow-hidden rounded-[14px] bg-surface shadow-card-sm sm:w-[140px]"
          >
            {artwork.image_url ? (
              <img
                src={artwork.image_url}
                alt={artwork.title}
                loading="lazy"
                className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1B2945] p-3 text-center text-xs font-semibold text-ink-soft">
                Tanpa gambar
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge domain="artwork" status={artwork.status} />
              <span className="rounded-full bg-surface/90 px-3 py-0.5 text-xs font-semibold text-ink-soft">
                {artwork.category?.name || 'Karya'}
              </span>
            </div>

            <h3 className="truncate text-xl font-semibold text-ink">
              <Link
                href={
                  artwork.status === 'published'
                    ? `/artworks/${artwork.artwork_id}`
                    : href
                }
                className="hover:text-brand-700 hover:underline"
              >
                {artwork.title}
              </Link>
            </h3>

            <p className="line-clamp-2 text-sm text-ink-soft">
              {artwork.description ||
                'Belum ada deskripsi cerita untuk karya ini.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="primary" size="sm" href={href}>
            Ubah karya
          </Button>
          {onToggleStatus ? (
            <Button
              variant="secondary"
              size="sm"
              loading={togglingId === artwork.artwork_id}
              onClick={() => onToggleStatus(artwork)}
            >
              {artwork.status === 'published' ? 'Sembunyikan' : 'Publikasikan'}
            </Button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(artwork)}
              className="min-h-[44px] rounded-full px-3 text-sm font-semibold text-[#FCA5A5] hover:bg-[#38171E] hover:underline"
            >
              Hapus karya
            </button>
          ) : null}
        </div>
      </article>
    );
  }

  if (mode === 'dashboard') {
    return (
      <article
        onPointerMove={handlePointerMove}
        className={`spotlight-surface group flex flex-col justify-between rounded-[28px] border border-line bg-surface p-3 ${tintClass} motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-0.5 hover:shadow-lift ${className}`}
      >
        <div>
          <Link
            href={
              artwork.status === 'published'
                ? `/artworks/${artwork.artwork_id}`
                : href
            }
          >
            {mediaBlock}
          </Link>
          {captionBlock}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
          <Button variant="tonal" size="sm" href={href}>
            Ubah karya
          </Button>
          {onToggleStatus ? (
            <Button
              variant="secondary"
              size="sm"
              loading={togglingId === artwork.artwork_id}
              onClick={() => onToggleStatus(artwork)}
            >
              {artwork.status === 'published' ? 'Sembunyikan' : 'Publikasikan'}
            </Button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(artwork)}
              className="min-h-[44px] px-2 text-sm font-semibold text-[#FCA5A5] hover:underline"
            >
              Hapus karya
            </button>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <Link
      href={href}
      onPointerMove={handlePointerMove}
      style={{ '--tilt': `${tiltDeg}deg` }}
      className={`spotlight-surface group block rounded-[28px] border border-line bg-surface p-3 ${tintClass} ${
        index < 6 ? 'rise' : ''
      } motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] lg:[transform:rotate(var(--tilt))] motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0 hover:shadow-lift ${className}`}
    >
      {mediaBlock}
      {captionBlock}
    </Link>
  );
}
