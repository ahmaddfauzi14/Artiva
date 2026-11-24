import { getInitials } from '@/lib/shared/format';

const SIZE_CLASSES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-24 w-24 text-2xl',
};

export default function Avatar({
  name = 'ARTIVA',
  avatarUrl = null,
  size = 'sm',
  className = '',
}) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const initials = getInitials(name);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700 ${sizeClass} ${className}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name || 'Avatar pengguna'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
