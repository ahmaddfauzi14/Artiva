import Link from 'next/link';
import { tintFullClassByName } from '@/lib/shared/stagger';

const RANK_TINT = {
  1: 'butter',
  2: 'lavender',
  3: 'mint',
};

export default function WinnerCard({ winner }) {
  const tintName = RANK_TINT[winner.rank] || 'lavender';
  const bgClass = tintFullClassByName(tintName);
  const rankLabel = `JUARA 0${winner.rank}`;

  return (
    <article
      className={`group flex items-center gap-4 rounded-[28px] p-4 ${bgClass} motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-1 hover:shadow-lift`}
    >
      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-surface shadow-card-sm">
        {winner.is_moderated || !winner.artwork?.image_url ? (
          <div className="flex h-full w-full items-center justify-center bg-[#1B2945] p-2 text-center text-[0.6875rem] font-semibold text-ink-soft">
            Dimoderasi
          </div>
        ) : (
          <img
            src={winner.artwork.image_url}
            alt={winner.artwork.title}
            loading="lazy"
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="tabular-nums text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
          {rankLabel}
        </p>
        <h3 className="truncate text-lg font-semibold text-ink">
          {winner.artwork?.title}
        </h3>
        <p className="truncate text-sm text-ink-soft">
          oleh {winner.creator?.display_name}
        </p>
        {!winner.is_moderated && winner.artwork?.artwork_id ? (
          <Link
            href={`/artworks/${winner.artwork.artwork_id}`}
            className="inline-flex items-center pt-0.5 text-sm font-semibold text-brand-700 hover:underline"
          >
            Lihat karya →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
