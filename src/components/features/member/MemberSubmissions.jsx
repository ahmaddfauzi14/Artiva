'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateRangeId, formatDateTimeId } from '@/lib/shared/format';

export default function MemberSubmissions({ initialSubmissions = [] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      const res = await apiFetch(
        `/api/submissions/${withdrawTarget.submission_id}/withdraw`,
        { method: 'POST' }
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === withdrawTarget.submission_id
            ? {
                ...s,
                status: res.data.submission.status,
                withdrawn_at: res.data.submission.withdrawn_at,
              }
            : s
        )
      );
      showToast({
        tone: 'info',
        title: 'Submission ditarik',
        message: `Submission "${withdrawTarget.artwork.title}" berhasil ditarik.`,
      });
      setWithdrawTarget(null);
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      {submissions.length === 0 ? (
        <EmptyState
          title="Saatnya mencoba tantangan pertamamu."
          description="Kamu belum mengirimkan karya ke tantangan mana pun. Pilih tantangan terbuka dan kirim karyamu."
          actionLabel="Jelajahi tantangan →"
          actionHref="/challenges"
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const canWithdraw =
              sub.status === 'submitted' && sub.challenge.status === 'open';
            return (
              <article
                key={sub.submission_id}
                className="flex flex-col justify-between gap-4 overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-card-sm transition-transform duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-brand-50">
                    {sub.artwork.image_url ? (
                      <img
                        src={sub.artwork.image_url}
                        alt={sub.artwork.title}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge domain="submission" status={sub.status} />
                      <StatusBadge
                        domain="challenge"
                        status={sub.challenge.status}
                      />
                      {sub.winner_rank ? (
                        <StatusBadge
                          label={`Juara #${sub.winner_rank}`}
                          tone="warning"
                        />
                      ) : null}
                    </div>
                    <h2 className="truncate text-lg font-semibold text-ink">
                      {sub.artwork.title}
                    </h2>
                    <p className="text-sm text-ink-soft">
                      Tantangan:{' '}
                      <Link
                        href={`/challenges/${sub.challenge.challenge_id}`}
                        className="font-semibold text-brand-700 hover:underline"
                      >
                        {sub.challenge.title}
                      </Link>{' '}
                      ·{' '}
                      {formatDateRangeId(
                        sub.challenge.start_date,
                        sub.challenge.end_date
                      )}
                    </p>
                    <p className="text-xs text-ink-mute">
                      Dikirim {formatDateTimeId(sub.submitted_at)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="tonal"
                    size="sm"
                    href={`/challenges/${sub.challenge.challenge_id}`}
                  >
                    Lihat tantangan →
                  </Button>
                  {canWithdraw ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setWithdrawTarget(sub)}
                      className="text-[#FCA5A5]"
                    >
                      Tarik
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(withdrawTarget)}
        title="Tarik submission?"
        description={`Submission karya "${withdrawTarget?.artwork?.title || ''}" akan ditarik dari tantangan "${withdrawTarget?.challenge?.title || ''}".`}
        infoBox="Status setelah konfirmasi: Ditarik. Penarikan hanya dapat dilakukan selama tantangan masih berstatus Terbuka."
        confirmLabel="Ya, tarik submission"
        cancelLabel="Batal"
        variant="danger"
        loading={withdrawing}
        onConfirm={handleConfirmWithdraw}
        onClose={() => setWithdrawTarget(null)}
      />
    </div>
  );
}
