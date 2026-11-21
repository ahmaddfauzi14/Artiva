'use client';

import { useState } from 'react';

export default function SearchBar({
  defaultValue = '',
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = 'Cari karya, kreator, atau ide yang kamu suka…',
  compact = false,
  className = '',
}) {
  const [internal, setInternal] = useState(defaultValue);
  const currentValue =
    controlledValue !== undefined ? controlledValue : internal;

  const handleInput = (e) => {
    const next = e.target.value;
    if (controlledValue === undefined) {
      setInternal(next);
    }
    onChange?.(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(currentValue.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex h-[52px] w-full items-center gap-2 rounded-full border border-line bg-surface p-1.5 pl-4 shadow-card-sm transition-shadow focus-within:border-brand-600 focus-within:ring-3 focus-within:ring-brand-400/35 ${
        compact ? 'max-w-sm' : ''
      } ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5 shrink-0 text-ink-mute"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5L17 17" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={currentValue}
        onChange={handleInput}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-mute focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-grad-primary px-4 text-sm font-semibold text-white shadow-btn motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:-translate-y-px"
      >
        Cari →
      </button>
    </form>
  );
}
