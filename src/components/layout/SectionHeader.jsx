import Link from 'next/link';

/**
 * Judul bagian halaman yang konsisten (eyebrow + heading + deskripsi opsional + tautan aksi).
 */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  rightSlot,
}) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="text-[1.4rem] font-semibold leading-tight text-ink sm:text-[1.75rem]"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm text-ink-soft sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {rightSlot ? (
        <div className="shrink-0">{rightSlot}</div>
      ) : actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-[44px] shrink-0 items-center text-sm font-semibold text-brand-700 hover:underline"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
