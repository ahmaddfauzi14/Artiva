'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, FavouriteIcon } from '@hugeicons/core-free-icons';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  masonryAspectAt,
  tiltAt,
  tintCardClassAt,
  updateSpotlightPosition,
} from '@/lib/shared/stagger';

function ArtworkActionButtons({
  artwork,
  editHref,
  onToggleStatus,
  onDelete,
  togglingId,
  variant = 'horizontal',
}) {
  const isHorizontal = variant === 'horizontal';

  return (
    <>
      <Button variant={isHorizontal ? 'primary' : 'tonal'} size="sm" href={editHref}>
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
          className={
            isHorizontal
              ? 'min-h-[44px] rounded-full px-3 text-sm font-semibold text-[#FCA5A5] hover:bg-[#38171E] hover:underline'
              : 'min-h-[44px] px-2 text-sm font-semibold text-[#FCA5A5] hover:underline'
          }
        >
          Hapus karya
        </button>
      ) : null}
    </>
  );
}

export default function ArtworkCard({
  artwork,
  index = 0,
  mode = 'public',
  href,
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
  const detailHref = href || `/artworks/${artwork.artwork_id}`;
  const editHref = `/me/artworks/${artwork.artwork_id}/edit`;
  const publicOrEditHref =
    artwork.status === 'published' ? detailHref : editHref;

  if (mode === 'horizontal') {
    return (
      <article
        onPointerMove={updateSpotlightPosition}
        className={`spotlight-surface group flex flex-col gap-4 overflow-hidden rounded-[24px] p-4 sm:flex-row sm:items-center sm:justify-between ${tintClass} motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-0.5 hover:shadow-lift ${className}`}
      >
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href={publicOrEditHref}
            className="h-[120px] w-full shrink-0 overflow-hidden rounded-[14px] bg-surface shadow-card-sm sm:w-[120px]"
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

          <div className="w-full min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge domain="artwork" status={artwork.status} />
              <span className="rounded-full bg-surface/90 px-3 py-0.5 text-xs font-semibold text-ink-soft">
                {artwork.category?.name || 'Karya'}
              </span>
            </div>

            <h3 className="max-w-full truncate text-lg font-semibold text-ink sm:text-xl">
              <Link
                href={publicOrEditHref}
                className="block truncate hover:text-brand-700 hover:underline"
              >
                {artwork.title}
              </Link>
            </h3>

            <p className="line-clamp-2 text-sm text-ink-soft">
              {artwork.description || 'Belum ada deskripsi cerita untuk karya ini.'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ArtworkActionButtons
            artwork={artwork}
            editHref={editHref}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            togglingId={togglingId}
            variant="horizontal"
          />
        </div>
      </article>
    );
  }

  const mediaBlock = (
    <div
      className={`relative ${chosenAspect} w-full overflow-hidden rounded-[14px] bg-brand-50`}
    >
      {isModerated || !artwork.image_url ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#1B2945] p-4 text-center text-ink-soft">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={32}
            strokeWidth={1.8}
            className="mb-2 text-ink-mute"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold">Karya telah dihapus oleh moderasi</p>
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
    <div className="mt-2.5 space-y-1 px-1 pb-1">
      <h3 className="truncate text-base font-semibold leading-snug text-ink sm:text-lg">
        {isModerated ? 'Karya telah dihapus oleh moderasi' : artwork.title}
      </h3>
      <div className="flex items-center justify-between gap-2 text-xs text-ink-soft sm:text-sm">
        <p className="truncate">
          {artwork.creator?.display_name ? `${artwork.creator.display_name} · ` : ''}
          {artwork.category?.name || 'Karya'}
        </p>
        {typeof artwork.like_count === 'number' &&
        mode === 'public' &&
        !isModerated ? (
          <span className="tabular-nums inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-soft">
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={14}
              strokeWidth={1.8}
              fill="currentColor"
              className="text-brand-700"
              aria-hidden="true"
            />
            {artwork.like_count}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (mode === 'dashboard') {
    return (
      <article
        onPointerMove={updateSpotlightPosition}
        className={`spotlight-surface group flex flex-col justify-between rounded-[24px] border border-line bg-surface p-3 ${tintClass} motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-0.5 hover:shadow-lift ${className}`}
      >
        <div>
          <Link href={publicOrEditHref}>{mediaBlock}</Link>
          {captionBlock}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
          <ArtworkActionButtons
            artwork={artwork}
            editHref={editHref}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            togglingId={togglingId}
            variant="dashboard"
          />
        </div>
      </article>
    );
  }

  return (
    <Link
      href={detailHref}
      onPointerMove={updateSpotlightPosition}
      style={{ '--tilt': `${tiltDeg}deg` }}
      className={`spotlight-surface group block rounded-[24px] border border-line bg-surface p-3 ${tintClass} ${
        index < 6 ? 'rise' : ''
      } motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] lg:[transform:rotate(var(--tilt))] motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-0 hover:shadow-lift ${className}`}
    >
      {mediaBlock}
      {captionBlock}
    </Link>
  );
}
