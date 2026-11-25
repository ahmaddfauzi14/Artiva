'use client';

import { Children, Fragment, isValidElement, useId, useMemo } from 'react';
import Select from '@/components/ui/Select';

function extractSelectOptions(children) {
  const result = [];
  const visit = (nodes) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) {
        visit(child.props?.children);
        return;
      }
      if (child.type === 'option') {
        result.push({
          value: child.props.value ?? '',
          label: child.props.children,
          disabled: Boolean(child.props.disabled),
        });
      }
    });
  };
  visit(children);
  return result;
}

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
  options,
  children,
  className = '',
  inputProps = {},
}) {
  const autoId = useId();
  const fieldId = name ? `field-${name}-${autoId}` : autoId;
  const labelId = label ? `${fieldId}-label` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const selectOptions = useMemo(() => {
    if (as !== 'select') return [];
    if (Array.isArray(options)) return options;
    return extractSelectOptions(children);
  }, [as, options, children]);

  const baseControlClass = [
    'w-full rounded-[18px] bg-[#0B1730] px-4 text-base text-ink placeholder:text-ink-mute',
    'border transition-colors duration-150 focus:bg-surface focus:outline-none focus:ring-2',
    error
      ? 'border-[#F87171] focus:border-[#F87171] focus:ring-[#F87171]/45'
      : 'border-line hover:border-brand-400/75 focus:border-brand-700 focus:ring-brand-700/45',
    disabled ? 'cursor-not-allowed opacity-60 hover:border-line' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <label
          id={labelId}
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
        <Select
          id={fieldId}
          name={name}
          value={value}
          onValueChange={(nextValue) => {
            onChange?.({
              target: { name, value: nextValue },
              currentTarget: { name, value: nextValue },
            });
          }}
          options={selectOptions}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          error={Boolean(error)}
          ariaLabelledBy={labelId}
          ariaDescribedBy={describedBy}
          ariaInvalid={error ? 'true' : undefined}
        />
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
