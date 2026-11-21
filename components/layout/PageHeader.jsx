import Button from '@/components/ui/Button';

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[30px] font-semibold leading-tight text-ink sm:text-[40px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-base text-ink-soft">{subtitle}</p>
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
