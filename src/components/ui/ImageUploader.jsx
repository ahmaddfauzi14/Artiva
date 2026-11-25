'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload04Icon } from '@hugeicons/core-free-icons';
import Button from '@/components/ui/Button';

export default function ImageUploader({
  label = 'Gambar karya',
  currentUrl = null,
  onFileSelect,
  onClear,
  clearLabel = 'Hapus gambar',
  disabled = false,
  error,
  required = false,
  helperText = 'JPEG/PNG/WEBP, maks. 5 MB',
  aspectClass = 'aspect-[4/5]',
  imagePositionClass = 'object-center',
}) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = localPreviewUrl || currentUrl;
  const cleanLabel = label.replace(/\s*\(.*?\)\s*/g, '').trim();
  const previewAlt = cleanLabel
    ? `Pratinjau ${cleanLabel.toLowerCase()}`
    : 'Pratinjau gambar yang dipilih';
  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleFile = (file) => {
    if (disabled || !file) return;
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(nextUrl);
    onFileSelect?.(file);
  };

  const handleClear = () => {
    if (disabled) return;
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className="w-full space-y-2 @container/uploader">
      <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="ml-1 text-[#FCA5A5]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
      />

      {previewUrl ? (
        <div
          className={`w-full space-y-3 rounded-[24px] border border-line bg-surface p-3.5 shadow-card-sm @[420px]/uploader:p-4 ${
            disabled ? 'opacity-75' : ''
          }`}
        >
          <img
            src={previewUrl}
            alt={previewAlt}
            className={`block w-full rounded-[14px] bg-brand-50 object-cover ${aspectClass} ${imagePositionClass}`}
          />
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
            {helperText ? (
              <p
                id={helperId}
                className="min-w-0 text-xs leading-snug text-ink-mute text-pretty"
              >
                {helperText}
              </p>
            ) : null}
            {!disabled ? (
              <div className="ms-auto flex shrink-0 flex-wrap items-center gap-2">
                {onClear ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="min-h-[44px] min-w-[44px] rounded-full px-3 text-xs font-semibold text-[#FCA5A5] hover:bg-[#38171E] hover:underline"
                  >
                    {clearLabel}
                  </button>
                ) : null}
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="shrink-0"
                >
                  Ganti gambar
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          aria-describedby={describedBy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            if (disabled) return;
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            if (disabled) return;
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed px-6 py-12 text-center motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] ${
            disabled
              ? 'cursor-not-allowed border-line bg-surface/60 opacity-60'
              : isDragging
                ? 'scale-[1.01] border-brand-600 bg-brand-50 shadow-card-sm'
                : error
                  ? 'border-[#F87171] bg-[#38171E]/60'
                  : 'border-brand-200 bg-surface hover:border-brand-400 hover:bg-brand-50/50'
          }`}
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 motion-safe:transition-transform motion-safe:duration-200 ${
              isDragging ? '-translate-y-1 scale-110' : ''
            }`}
          >
            <HugeiconsIcon
              icon={Upload04Icon}
              size={24}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div className="space-y-1">
            <p className="text-base font-semibold text-ink">
              Seret gambar ke sini atau pilih file
            </p>
            {helperText ? (
              <p
                id={helperId}
                className="text-[0.8125rem] text-ink-mute text-pretty"
              >
                {helperText}
              </p>
            ) : null}
          </div>
        </button>
      )}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-[0.8125rem] font-medium text-[#FCA5A5]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
