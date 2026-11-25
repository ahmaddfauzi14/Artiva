import { getStatusMeta, TONE_CLASSES } from '@/lib/shared/status-styles';

export default function StatusBadge({
  domain,
  status,
  label: customLabel,
  tone: customTone,
  className = '',
}) {
  const meta =
    domain && status
      ? getStatusMeta(domain, status)
      : { label: customLabel || status || '-', tone: customTone || 'neutral' };

  const label = customLabel || meta.label;
  const tone = customTone || meta.tone;
  const style = TONE_CLASSES[tone] || TONE_CLASSES.neutral;

  return (
    <span
      className={`inline-flex min-h-[26px] items-center gap-1.5 rounded-full px-3 py-0.5 text-[0.8125rem] font-semibold leading-tight ${style.bg} ${style.text} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
      />
      <span>{label}</span>
    </span>
  );
}
