'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import ChipRow from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateTimeId } from '@/lib/shared/format';

const FILTER_TABS = [
  { label: 'Terkirim', value: 'submitted' },
  { label: 'Ditarik', value: 'withdrawn' },
  { label: 'Semua', value: 'all' },
];

export default function CuratorSubmissions({
  challenge,
  initialSubmissions = [],
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFilter = async (nextStatus) => {
    setStatusFilter(nextStatus);
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiFetch(
        `/api/curator/challenges/${challenge.challenge_id}/submissions?status=${nextStatus}&limit=50`
      );
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/curator/challenges"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar tantangan
        </Link>
      </div>

      <ChipRow
        items={FILTER_TABS}
        activeValue={statusFilter}
        onSelect={handleFilter}
      />

      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat submission">
          {errorMsg}
        </Alert>
      ) : null}

      {loading ? (
        <div className="auto-grid-wide gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-72 rounded-[28px]"
            />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          title="Belum ada submission pada filter ini"
          description="Karya yang dikirimkan peserta ke tantangan ini akan muncul di sini."
        />
      ) : (
        <div className="auto-grid-wide gap-6">
          {submissions.map((sub) => (
            <article
              key={sub.submission_id}
              className="flex flex-col justify-between rounded-[28px] border border-line bg-surface p-4 shadow-card-sm space-y-3"
            >
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-brand-50">
                  {sub.is_moderated || !sub.artwork.image_url ? (
                    <div className="flex h-full items-center justify-center bg-[#1B2945] p-4 text-center text-sm font-semibold text-ink-soft">
                      Karya disembunyikan/dihapus oleh moderasi
                    </div>
                  ) : (
                    <img
                      src={sub.artwork.image_url}
                      alt={sub.artwork.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <StatusBadge domain="submission" status={sub.status} />
                    {sub.winner_rank ? (
                      <StatusBadge
                        label={`Juara ${sub.winner_rank}`}
                        tone="info"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="truncate text-lg font-semibold text-ink">
                    {sub.artwork.title}
                  </h3>
                  <p className="text-sm text-ink-soft">
                    oleh <strong>{sub.creator.display_name}</strong> (@
                    {sub.creator.username})
                  </p>
                  <p className="text-xs text-ink-mute">
                    Dikirim: {formatDateTimeId(sub.submitted_at)}
                  </p>
                  {sub.is_moderated ? (
                    <StatusBadge
                      label="Karya dimoderasi / non-publik"
                      tone="danger"
                    />
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
