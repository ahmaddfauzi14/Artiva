'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTimeId } from '@/lib/shared/format';

/**
 * Daftar riwayat pengajuan & banding verifikasi Kurator yang dapat dilipat.
 * Digunakan bersama di halaman status Kurator dan halaman peninjauan Admin.
 */
export default function VerificationHistoryList({
  history = [],
  title = 'Riwayat Pengajuan',
  currentVerificationId = null,
  showReviewerMeta = false,
  buildDetailHref = null,
}) {
  const historyListId = useId();
  const [showHistory, setShowHistory] = useState(false);

  if (!Array.isArray(history) || history.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
          {title} ({history.length})
        </h3>
        <button
          type="button"
          aria-expanded={showHistory}
          aria-controls={historyListId}
          onClick={() => setShowHistory((prev) => !prev)}
          className="inline-flex min-h-[44px] -my-2 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50/50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          <span>{showHistory ? 'Sembunyikan' : 'Lihat semua'}</span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className={`motion-safe:transition-transform ${
              showHistory ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {showHistory ? (
        <ol id={historyListId} className="space-y-2.5">
          {history.map((item) => {
            const isCurrent =
              currentVerificationId !== null &&
              item.verification_id === currentVerificationId;
            const detailHref = buildDetailHref ? buildDetailHref(item) : null;

            return (
              <li
                key={item.verification_id}
                className={`space-y-1.5 rounded-[16px] border p-3.5 text-sm ${
                  isCurrent
                    ? 'border-brand-700 bg-brand-50/40'
                    : 'border-line bg-canvas'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">
                      {showReviewerMeta
                        ? `RG-${String(item.verification_id).padStart(3, '0')} · `
                        : ''}
                      {item.is_appeal
                        ? `Banding ke-${item.appeal_number}`
                        : 'Pengajuan awal'}
                    </span>

                    {!showReviewerMeta ? (
                      <span className="text-xs text-ink-mute">
                        {formatDateTimeId(item.submitted_at)}
                      </span>
                    ) : isCurrent ? (
                      <span className="text-xs font-semibold text-brand-700">
                        (Sedang dilihat)
                      </span>
                    ) : detailHref ? (
                      <Link
                        href={detailHref}
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        Buka detail
                      </Link>
                    ) : null}
                  </div>
                  <StatusBadge domain="verification" status={item.status} />
                </div>

                {showReviewerMeta ? (
                  <p className="text-xs text-ink-mute">
                    Diajukan {formatDateTimeId(item.submitted_at)}
                    {item.reviewed_at
                      ? ` · Diputuskan ${formatDateTimeId(item.reviewed_at)}`
                      : ''}
                    {item.reviewer_display_name || item.reviewer_username
                      ? ` oleh ${item.reviewer_display_name || item.reviewer_username}`
                      : ''}
                  </p>
                ) : null}

                {item.appeal_note ? (
                  <p className="text-ink-soft">
                    <span className="font-semibold text-ink">Catatan banding:</span>{' '}
                    {item.appeal_note}
                  </p>
                ) : null}

                {item.note ? (
                  <p className="text-ink-soft">
                    <span className="font-semibold text-ink">Catatan Admin:</span>{' '}
                    {item.note}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
