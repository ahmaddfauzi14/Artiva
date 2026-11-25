'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload04Icon } from '@hugeicons/core-free-icons';
import Button from '@/components/ui/Button';

export default function ImageUploader({
  label = 'Gambar karya',
  currentUrl = null,
  onFileSelect,
  error,
  required = false,
  helperText = 'JPEG/PNG/WEBP, maks. 5 MB',
  aspectClass = 'aspect-[4/5]',
  imagePositionClass = 'object-center',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = localPreviewUrl || currentUrl;

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleFile = (file) => {
    if (!file) return;
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const nextUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(nextUrl);
    onFileSelect?.(file);
  };

  return (
    <div className="space-y-2">
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
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="sr-only"
      />

      {previewUrl ? (
        <div className="space-y-3 rounded-[24px] border border-line bg-surface p-3.5 shadow-card-sm">
          <div className={`overflow-hidden rounded-[14px] bg-brand-50 ${aspectClass}`}>
            <img
              src={previewUrl}
              alt="Pratinjau gambar yang dipilih"
              className={`h-full w-full object-cover ${imagePositionClass}`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
            <p className="text-xs leading-snug text-ink-mute">{helperText}</p>
            <Button
              variant="tonal"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="shrink-0"
            >
              Ganti gambar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-[28px] border-2 border-dashed px-6 py-12 text-center motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] ${
            isDragging
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
            <p className="text-[0.8125rem] text-ink-mute">{helperText}</p>
          </div>
        </button>
      )}

      {error ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-[#FCA5A5]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
