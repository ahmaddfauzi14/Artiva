import Image from 'next/image';

const BADGE_SIZES = {
  sm: 'h-9 w-9 rounded-[11px] p-1',
  md: 'h-10 w-10 rounded-[12px] p-1',
};

const TEXT_SIZES = {
  sm: 'text-[18px] md:text-[20px]',
  md: 'text-[20px]',
};

/**
 * Shared ARTIVA brand mark and optional wordmark used across navigation and footers.
 */
export default function ArtivaLogo({
  size = 'sm',
  showWordmark = true,
  className = '',
}) {
  const badgeClass = BADGE_SIZES[size] || BADGE_SIZES.sm;
  const textClass = TEXT_SIZES[size] || TEXT_SIZES.sm;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`inline-flex shrink-0 items-center justify-center border border-[#F7F3E6]/70 bg-[#F7F3E6] shadow-card-sm ${badgeClass}`}
      >
        <Image
          src="/images/artiva-logo.png"
          alt={showWordmark ? '' : 'ARTIVA'}
          width={36}
          height={36}
          priority
          className="h-full w-full object-contain"
        />
      </span>
      {showWordmark ? (
        <span
          className={`font-bold uppercase tracking-[0.18em] text-ink ${textClass}`}
        >
          ARTIVA
        </span>
      ) : null}
    </span>
  );
}
