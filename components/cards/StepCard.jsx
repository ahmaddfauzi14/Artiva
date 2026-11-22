import Link from 'next/link';
import { offsetAt, tintAt, tintFullClassByName } from '@/lib/shared/stagger';

export default function StepCard({
  number,
  title,
  description,
  href,
  ctaLabel,
  tint,
  index = 0,
  stagger = false,
  className = '',
}) {
  const chosenTint = tint || tintAt(index);
  const tintClass = tintFullClassByName(chosenTint);
  const offsetPx = stagger ? offsetAt(index) : 0;

  const offsetClass =
    offsetPx === 24
      ? 'lg:translate-y-3'
      : offsetPx === 8
        ? 'lg:translate-y-1.5'
        : '';

  const cardClasses = `subgrid-step-card group gap-y-3 rounded-[28px] p-6 ${tintClass} ${offsetClass} ${
    href
      ? 'motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-1 hover:shadow-lift'
      : ''
  } ${className}`;

  const regions = (
    <>
      <div>
        <span className="tabular-nums inline-flex h-8 w-8 items-center justify-center rounded-[12px] bg-surface text-sm font-semibold text-brand-700 shadow-card-sm motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-105">
          {number}
        </span>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-ink">
          {title}
        </h3>
      </div>

      <p className="text-base text-ink-soft">{description || ''}</p>

      {ctaLabel ? (
        <span className="self-end pt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 motion-safe:transition-transform motion-safe:duration-200 group-hover:translate-x-0.5">
          {ctaLabel}
        </span>
      ) : (
        <span aria-hidden="true" className="hidden md:block" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {regions}
      </Link>
    );
  }
  return <article className={cardClasses}>{regions}</article>;
}
