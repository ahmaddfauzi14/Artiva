'use client';

import { useCallback, useMemo, useState } from 'react';
import { Select as BaseSelect } from '@base-ui/react/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { twMerge } from 'tailwind-merge';

const EMPTY_VALUE_SENTINEL = '__artiva_empty_option__';

function toInternalValue(val) {
  if (val === '' || val === null || val === undefined) {
    return EMPTY_VALUE_SENTINEL;
  }
  return String(val);
}

function toExternalValue(val) {
  if (val === EMPTY_VALUE_SENTINEL || val === null || val === undefined) {
    return '';
  }
  return String(val);
}

const SIZE_CLASSES = {
  sm: {
    trigger: 'min-h-[44px] rounded-xl px-3.5 text-xs sm:text-sm font-semibold',
    item: 'min-h-[38px] rounded-lg px-3 py-2 text-xs sm:text-sm',
  },
  md: {
    trigger: 'h-12 rounded-[18px] px-4 text-base font-normal',
    item: 'min-h-[42px] rounded-[11px] px-3 py-2.5 text-sm sm:text-[0.9375rem]',
  },
};

export default function Select({
  id,
  name,
  value,
  onValueChange,
  options = [],
  placeholder = 'Pilih opsi',
  disabled = false,
  required = false,
  error = false,
  size = 'md',
  align = 'start',
  className = '',
  popupClassName = '',
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaInvalid,
}) {
  const [portalContainer, setPortalContainer] = useState(null);

  const handleTriggerRef = useCallback((node) => {
    if (!node) return;
    const parentDialog = node.closest('dialog');
    setPortalContainer(parentDialog || null);
  }, []);

  const normalizedOptions = useMemo(
    () =>
      options.map((opt) => ({
        rawValue: opt.value ?? '',
        value: toInternalValue(opt.value),
        label: opt.label,
        disabled: Boolean(opt.disabled),
      })),
    [options]
  );

  const itemsMap = useMemo(() => {
    const map = {};
    for (const opt of normalizedOptions) {
      map[opt.value] = opt.label;
    }
    return map;
  }, [normalizedOptions]);

  const hasMatchingOption = normalizedOptions.some(
    (opt) => opt.value === toInternalValue(value)
  );
  const currentInternalValue = hasMatchingOption
    ? toInternalValue(value)
    : null;

  const sizeStyle = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ?? ''}
          disabled={disabled}
        />
      ) : null}

      <BaseSelect.Root
        items={itemsMap}
        value={currentInternalValue}
        disabled={disabled}
        required={required}
        modal={false}
        onValueChange={(nextInternal) => {
          if (nextInternal === null || nextInternal === undefined) return;
          onValueChange?.(toExternalValue(nextInternal));
        }}
      >
        <BaseSelect.Trigger
          ref={handleTriggerRef}
          id={id}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid || (error ? 'true' : undefined)}
          className={twMerge(
            'inline-flex w-full items-center justify-between gap-3 border bg-[#0B1730] text-left text-ink transition-colors duration-150',
            'hover:border-brand-400/75 hover:bg-[#0E1C3A]',
            'focus-visible:outline-none focus-visible:ring-2',
            'data-[popup-open]:bg-surface data-[popup-open]:ring-2',
            error
              ? 'border-[#F87171] focus-visible:border-[#F87171] focus-visible:ring-[#F87171]/45 data-[popup-open]:border-[#F87171] data-[popup-open]:ring-[#F87171]/35'
              : 'border-line focus-visible:border-brand-700 focus-visible:ring-brand-700/50 data-[popup-open]:border-brand-700 data-[popup-open]:ring-brand-700/35',
            disabled
              ? 'cursor-not-allowed opacity-60 hover:border-line hover:bg-[#0B1730]'
              : 'cursor-pointer',
            sizeStyle.trigger,
            className
          )}
        >
          <BaseSelect.Value
            placeholder={placeholder}
            className="min-w-0 flex-1 truncate data-[placeholder]:text-ink-mute"
          />
          <BaseSelect.Icon className="shrink-0 text-ink-soft motion-safe:transition-transform motion-safe:duration-150 [[data-popup-open]_&]:rotate-180">
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>

        <BaseSelect.Portal container={portalContainer || undefined}>
          <BaseSelect.Positioner
            side="bottom"
            sideOffset={6}
            align={align}
            collisionPadding={12}
            alignItemWithTrigger={false}
            className="z-[70] outline-none"
          >
            <BaseSelect.Popup
              data-select-popup=""
              className={twMerge(
                'min-w-[var(--anchor-width)] max-w-[min(28rem,calc(100vw-1.5rem))] origin-[var(--transform-origin)] rounded-[16px] border border-line bg-surface p-1.5 shadow-modal outline-none',
                'motion-safe:transition-[opacity,transform] motion-safe:duration-150',
                'data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0',
                'data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0',
                popupClassName
              )}
            >
              <BaseSelect.List className="max-h-[min(18rem,var(--available-height,18rem))] space-y-0.5 overflow-y-auto p-0.5 outline-none">
                {normalizedOptions.map((opt) => (
                  <BaseSelect.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className={twMerge(
                      'flex cursor-pointer items-center justify-between gap-3 font-medium text-ink-soft outline-none select-none transition-colors',
                      'data-[highlighted]:bg-brand-50 data-[highlighted]:text-ink',
                      'data-[selected]:bg-brand-700/15 data-[selected]:font-semibold data-[selected]:text-brand-700',
                      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45',
                      sizeStyle.item
                    )}
                  >
                    <BaseSelect.ItemText className="min-w-0 flex-1 leading-snug">
                      {opt.label}
                    </BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="shrink-0 text-brand-700">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={15}
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </>
  );
}
