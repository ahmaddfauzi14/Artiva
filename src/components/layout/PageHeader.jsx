import Button from '@/components/ui/Button';

/**
 * Header halaman utama yang menampilkan judul, ringkasan, dan tombol aksi opsional.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  rightSlot,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2.25rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-sm text-ink-soft sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightSlot ? (
        <div className="shrink-0">{rightSlot}</div>
      ) : actionLabel && (actionHref || onAction) ? (
        <div className="shrink-0">
          <Button variant="primary" href={actionHref} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
