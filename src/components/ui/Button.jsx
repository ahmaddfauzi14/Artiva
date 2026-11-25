import Link from 'next/link';

const VARIANT_CLASSES = {
  primary:
    'bg-grad-primary text-white shadow-btn hover:shadow-lift motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px relative overflow-hidden',
  secondary:
    'bg-surface text-brand-700 border border-line shadow-card-sm hover:border-brand-200 hover:shadow-card motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px',
  tonal:
    'bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100 motion-safe:hover:-translate-y-px motion-safe:active:translate-y-px',
  ghost:
    'bg-transparent text-brand-700 hover:underline underline-offset-4 px-2',
  danger:
    'bg-[#D64545] text-white shadow-card-sm hover:bg-[#B83232] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px',
  crimson:
    'bg-crimson text-white shadow-card-sm hover:bg-[#8E263C] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px',
};

const SIZE_CLASSES = {
  md: 'min-h-[44px] px-6 py-2.5 text-[0.9375rem]',
  sm: 'min-h-[44px] px-4 py-2 text-sm',
  lg: 'min-h-[48px] px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = Boolean(disabled || loading);
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClass =
    variant === 'ghost'
      ? 'min-h-[44px] py-2 text-sm'
      : SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const baseClass = [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
    'motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] select-none whitespace-nowrap',
    variantClass,
    sizeClass,
    isDisabled ? 'opacity-50 pointer-events-none shadow-none' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !isDisabled) {
    return (
      <Link href={href} className={baseClass} {...props}>
        {variant === 'primary' ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
          />
        ) : null}
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      className={baseClass}
      {...props}
    >
      {variant === 'primary' ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                className="opacity-80"
                d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
              />
            </svg>
            <span>Memproses…</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
