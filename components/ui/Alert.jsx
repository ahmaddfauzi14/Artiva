import { TONE_CLASSES } from '@/lib/shared/status-styles';

export default function Alert({
  tone = 'info',
  title,
  children,
  className = '',
  action,
}) {
  const style = TONE_CLASSES[tone] || TONE_CLASSES.info;
  const role = tone === 'danger' || tone === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`rounded-[18px] border ${style.border} ${style.bg} p-4 ${style.text} ${className}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
          />
          <div className="min-w-0 space-y-1">
            {title ? <p className="text-sm font-semibold">{title}</p> : null}
            <div className="text-sm leading-relaxed">{children}</div>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
