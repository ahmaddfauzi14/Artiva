'use client';

import PillScrollRow from '@/components/ui/PillScrollRow';

export default function ChipRow({ items = [], activeValue, onSelect, className = '' }) {
  return (
    <PillScrollRow
      role="tablist"
      aria-label="Filter daftar"
      activeKey={activeValue}
      className={`gap-2.5 ${className}`}
    >
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect?.(item.value)}
            className={`min-h-[44px] shrink-0 rounded-full px-5 py-2 text-sm font-semibold motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] ${
              isActive
                ? 'bg-grad-primary text-white shadow-btn'
                : 'border border-line bg-surface text-ink shadow-card-sm hover:border-brand-200 hover:bg-brand-50 motion-safe:hover:-translate-y-0.5'
            }`}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' ? (
              <span
                className={`tabular-nums ml-2 rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-brand-50 text-brand-700'
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </PillScrollRow>
  );
}
