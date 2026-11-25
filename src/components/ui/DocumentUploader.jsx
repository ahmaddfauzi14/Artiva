'use client';

import { useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import Button from '@/components/ui/Button';

const ACCEPTED_MIME_TYPES =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function getDocBadgeLabel(fileName, fallbackExt = '') {
  const ext = (
    fileName?.split('.').pop() ||
    fallbackExt ||
    ''
  ).toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc') return 'WORD (.DOC)';
  if (ext === 'docx') return 'WORD (.DOCX)';
  return 'DOKUMEN';
}

export default function DocumentUploader({
  label = 'Unggah dokumen CV (Word atau PDF)',
  name = 'cv',
  file = null,
  onFileSelect,
  existingUrl = null,
  existingExt = null,
  required = false,
  disabled = false,
  error,
  helperText = 'Format PDF (.pdf) atau Word (.doc, .docx), maks. 5 MB.',
}) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const describedBy =
    [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const handlePickedFile = (picked) => {
    if (disabled || !picked) return;
    onFileSelect?.(picked);
  };

  const handleClear = () => {
    if (disabled) return;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect?.(null);
  };

  const hasCurrent = Boolean(file || existingUrl);
  const badgeText = file
    ? getDocBadgeLabel(file.name)
    : getDocBadgeLabel('', existingExt);

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
        name={name}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={(e) => handlePickedFile(e.target.files?.[0])}
        className="sr-only"
      />

      {hasCurrent ? (
        <div
          className={`space-y-3 rounded-[20px] border bg-[#0B1730] p-4 shadow-card-sm ${
            error ? 'border-[#F87171]' : 'border-line'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"
              >
                <HugeiconsIcon
                  icon={File01Icon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-brand-700">
                    {badgeText}
                  </span>
                  {file ? (
                    <span className="tabular-nums text-xs text-ink-mute">
                      {formatBytes(file.size)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-ink">
                  {file ? file.name : 'CV saat ini sudah terlampir'}
                </p>
              </div>
            </div>

            {!disabled ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {!file && existingUrl ? (
                  <a
                    href={`${existingUrl}${existingExt === 'pdf' ? '' : '?download=1'}`}
                    target={existingExt === 'pdf' ? '_blank' : undefined}
                    rel={existingExt === 'pdf' ? 'noopener noreferrer' : undefined}
                    className="inline-flex min-h-[44px] items-center rounded-full px-3 text-xs font-semibold text-brand-700 hover:underline"
                  >
                    {existingExt === 'pdf' ? 'Lihat CV' : 'Unduh CV'}
                  </a>
                ) : null}
                {file && (!required || existingUrl) ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="min-h-[44px] rounded-full px-3 text-xs font-semibold text-[#FCA5A5] hover:bg-[#38171E] hover:underline"
                  >
                    Batalkan file baru
                  </button>
                ) : null}
                <Button
                  variant="tonal"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Ganti file
                </Button>
              </div>
            ) : null}
          </div>
          {helperText ? (
            <p id={helperId} className="text-xs text-ink-mute">
              {helperText}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-1.5">
          <button
            type="button"
            disabled={disabled}
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
              handlePickedFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-[22px] border-2 border-dashed px-5 py-7 text-center motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] ${
              disabled
                ? 'cursor-not-allowed border-line bg-surface/60 opacity-60'
                : isDragging
                  ? 'scale-[1.01] border-brand-600 bg-brand-50 shadow-card-sm'
                  : error
                    ? 'border-[#F87171] bg-[#38171E]/60'
                    : 'border-brand-200 bg-[#0B1730] hover:border-brand-400 hover:bg-brand-50/40'
            }`}
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700"
            >
              <HugeiconsIcon
                icon={Upload04Icon}
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-ink sm:text-base">
                Pilih file CV atau seret ke sini
              </p>
              {helperText ? (
                <p id={helperId} className="text-[0.8125rem] text-ink-mute">
                  {helperText}
                </p>
              ) : null}
            </div>
          </button>
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-[0.8125rem] font-medium text-[#FCA5A5]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
