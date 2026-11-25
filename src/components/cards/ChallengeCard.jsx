'use client';

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon } from '@hugeicons/core-free-icons';
import Button from '@/components/ui/Button';
import { useMotion } from '@/components/effects/MotionContext';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateRangeId, getInitials } from '@/lib/shared/format';
import {
  tintFullClassByName,
  updateSpotlightPosition,
} from '@/lib/shared/stagger';

const STATUS_TINTS = {
  open: 'mint',
  announced: 'lavender',
  closed: 'peach',
  draft: 'butter',
};

export default function ChallengeCard({
  challenge,
  variant = 'feature',
  actions = null,
  metaSlot = null,
}) {
  const { isMotionActive } = useMotion();
  const isClosingSoon =
    challenge.status === 'open' &&
    typeof challenge.days_remaining === 'number' &&
    challenge.days_remaining >= 0 &&
    challenge.days_remaining <= 3;

  const periodText = formatDateRangeId(challenge.start_date, challenge.end_date);
  const visualUrl = challenge.banner_url || challenge.cover_image_url;

  const handlePointerMove = (e) => {
    if (!isMotionActive) return;
    updateSpotlightPosition(e);
  };

  if (variant === 'compact') {
    const tintName = STATUS_TINTS[challenge.status] || 'lavender';
    const tintClass = tintFullClassByName(tintName);

    return (
      <article
        onPointerMove={handlePointerMove}
        className={`cq-card spotlight-surface group rounded-[28px] p-5 sm:p-6 ${tintClass} motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-0.5 hover:shadow-lift`}
      >
        <div className="cq-card-body">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[14px] bg-surface shadow-card-sm">
              {visualUrl ? (
                <img
                  src={visualUrl}
                  alt={challenge.title}
                  loading="lazy"
                  className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-brand-100 text-brand-700">
                  <span className="text-lg font-bold">
                    {getInitials(challenge.title)}
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge domain="challenge" status={challenge.status} />
                {isClosingSoon ? (
                  <StatusBadge label="Segera berakhir" tone="warning" />
                ) : null}
                {challenge.category ? (
                  <span className="rounded-full bg-surface px-3 py-0.5 text-xs font-semibold text-ink-soft">
                    {challenge.category.name}
                  </span>
                ) : null}
              </div>

              <h3 className="text-xl font-semibold leading-snug text-ink">
                <Link
                  href={`/challenges/${challenge.challenge_id}`}
                  className="hover:text-brand-700 hover:underline"
                >
                  {challenge.title}
                </Link>
              </h3>

              <p className="text-sm text-ink-soft">
                Periode {periodText}
                {typeof challenge.submission_count === 'number' ? (
                  <span className="tabular-nums">
                    {' '}
                    · {challenge.submission_count} karya masuk
                  </span>
                ) : null}
              </p>

              {challenge.prize ? (
                <p className="inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-brand-700">
                  <HugeiconsIcon
                    icon={Award01Icon}
                    size={14}
                    strokeWidth={1.8}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">Hadiah: {challenge.prize}</span>
                </p>
              ) : null}

              {challenge.description ? (
                <p className="line-clamp-2 text-sm text-ink-soft">
                  {challenge.description}
                </p>
              ) : null}

              {metaSlot}
            </div>
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {actions}
            </div>
          ) : (
            <div className="shrink-0">
              <Button
                variant={challenge.status === 'open' ? 'primary' : 'secondary'}
                size="sm"
                href={`/challenges/${challenge.challenge_id}`}
              >
                {challenge.status === 'open'
                  ? 'Lihat & ikut tantangan →'
                  : 'Lihat detail →'}
              </Button>
            </div>
          )}
        </div>
      </article>
    );
  }

  // Variant Feature (panel gelap brand-900 dengan sorot kursor & edge glow)
  return (
    <article
      onPointerMove={handlePointerMove}
      className="spotlight-surface spotlight-deep edge-glow group overflow-hidden rounded-[28px] bg-brand-900 text-white shadow-card motion-safe:transition-transform motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-0.5"
    >
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12">
        {/* Panel Visual Kiri (~35%) */}
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[250px] md:col-span-4">
          {visualUrl ? (
            <img
              src={visualUrl}
              alt={challenge.title}
              loading="lazy"
              className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-brand-500/45 via-brand-600/60 to-brand-900 p-6">
              <span className="inline-flex w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.06em] text-[#FFF2B2] uppercase">
                {challenge.category?.name || 'Semua Kategori'}
              </span>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.08em] text-[#C4D2E8]">
                  Tantangan Kreatif
                </p>
                <p className="tabular-nums text-2xl font-semibold text-white">
                  {challenge.submission_count || 0} Karya Terdaftar
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Konten Kanan */}
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 md:col-span-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge domain="challenge" status={challenge.status} />
              {isClosingSoon ? (
                <StatusBadge label="Segera berakhir" tone="warning" />
              ) : null}
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-[#F7F3E6]">
                {challenge.category?.name || 'Semua Kategori'}
              </span>
            </div>

            <Link
              href={`/challenges/${challenge.challenge_id}`}
              className="block hover:underline underline-offset-4"
            >
              <h3 className="text-[1.625rem] font-semibold leading-tight text-white sm:text-[1.875rem]">
                {challenge.title}
              </h3>
            </Link>

            <p className="line-clamp-2 text-base text-[#C4D2E8]">
              {challenge.description ||
                'Tunjukkan interpretasi visual terbaikmu dan ikuti kurasi komunitas.'}
            </p>

            {challenge.prize ? (
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-700/35 bg-brand-700/10 px-3.5 py-1.5 text-xs font-semibold text-[#FFF2B2]">
                <HugeiconsIcon
                  icon={Award01Icon}
                  size={15}
                  strokeWidth={1.8}
                  className="shrink-0 text-brand-700"
                  aria-hidden="true"
                />
                <span className="truncate">Hadiah: {challenge.prize}</span>
              </div>
            ) : null}

            <p className="text-sm text-[#DCE6F5]">
              Kurator:{' '}
              <span className="font-semibold text-white">
                {challenge.curator?.display_name}
              </span>{' '}
              · Periode {periodText}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="primary"
              href={`/challenges/${challenge.challenge_id}`}
            >
              Lihat detail tantangan →
            </Button>
            <p className="text-xs text-[#C4D2E8]">
              Khusus Member · Karya berstatus Dipublikasikan
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
