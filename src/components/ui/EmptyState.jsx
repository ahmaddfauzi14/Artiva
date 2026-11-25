import Button from '@/components/ui/Button';

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[24px] bg-tint-lavender px-6 py-8 text-center shadow-tint-lavender sm:py-10 ${className}`}
    >
      <span
        aria-hidden="true"
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand-700 shadow-card-sm"
      >
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-base text-ink-soft">{description}</p>
      ) : null}
      {actionLabel && (actionHref || onAction) ? (
        <div className="mt-6">
          <Button variant="primary" href={actionHref} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
