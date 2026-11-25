'use client';

import { useId } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  as = 'input',
  rows = 4,
  children,
  className = '',
  inputProps = {},
}) {
  const autoId = useId();
  const fieldId = name ? `field-${name}-${autoId}` : autoId;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const baseControlClass = [
    'w-full rounded-[18px] bg-[#0B1730] px-4 text-base text-ink placeholder:text-ink-mute',
    'border transition-all duration-150 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-brand-400/40',
    error
      ? 'border-[#F87171] focus:border-[#F87171]'
      : 'border-line focus:border-brand-700',
    disabled ? 'cursor-not-allowed opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="block text-sm font-semibold text-ink"
        >
          {label}
          {required ? (
            <span className="ml-1 text-[#FCA5A5]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {as === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${baseControlClass} min-h-[120px] py-3`}
          {...inputProps}
        />
      ) : as === 'select' ? (
        <div className="relative">
          <select
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={`${baseControlClass} h-12 appearance-none pr-10`}
            {...inputProps}
          >
            {children}
          </select>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft"
          />
        </div>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${baseControlClass} h-12`}
          {...inputProps}
        />
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-[0.8125rem] font-medium text-[#FCA5A5]">
          {error}
        </p>
      ) : null}
      {helperText ? (
        <p id={helperId} className="text-[0.8125rem] text-ink-mute">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
