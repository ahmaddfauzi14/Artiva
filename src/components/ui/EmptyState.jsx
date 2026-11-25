import { HugeiconsIcon } from '@hugeicons/react';
import { Image02Icon } from '@hugeicons/core-free-icons';
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
        <HugeiconsIcon
          icon={Image02Icon}
          size={24}
          strokeWidth={1.8}
          aria-hidden="true"
        />
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
