'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import ChallengeCard from '@/components/cards/ChallengeCard';
import ChipRow from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTimeId } from '@/lib/shared/format';

const STATUS_FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Terbuka', value: 'open' },
  { label: 'Ditutup', value: 'closed' },
  { label: 'Diumumkan', value: 'announced' },
];

export default function MemberChallenges({ initialChallenges = [] }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const openCount = initialChallenges.filter((c) => c.status === 'open').length;
  const closedCount = initialChallenges.filter(
    (c) => c.status === 'closed'
  ).length;
  const announcedCount = initialChallenges.filter(
    (c) => c.status === 'announced'
  ).length;

  const visibleChallenges =
    statusFilter === 'all'
      ? initialChallenges
      : initialChallenges.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6">
      <ChipRow
        items={STATUS_FILTERS.map((item) => ({
          ...item,
          count:
            item.value === 'all'
              ? initialChallenges.length
              : item.value === 'open'
                ? openCount
                : item.value === 'closed'
                  ? closedCount
                  : announcedCount,
        }))}
        activeValue={statusFilter}
        onSelect={setStatusFilter}
      />

      {initialChallenges.length === 0 ? (
        <EmptyState
          title="Belum ada tantangan yang diikuti."
          description="Kamu belum mengikuti tantangan apa pun. Jelajahi tantangan yang sedang terbuka dan kirim karya terbaikmu."
          actionLabel="Jelajahi tantangan terbuka →"
          actionHref="/challenges"
        />
      ) : visibleChallenges.length === 0 ? (
        <EmptyState
          title="Tidak ada tantangan pada status ini"
          description="Coba lihat semua tantangan yang pernah kamu ikuti."
          actionLabel="Tampilkan semua"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="space-y-4">
          {visibleChallenges.map((ch) => {
            const part = ch.participation || {};
            return (
              <ChallengeCard
                key={ch.challenge_id}
                challenge={ch}
                variant="compact"
                metaSlot={
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    {part.best_winner_rank ? (
                      <StatusBadge
                        label={`Juara #${part.best_winner_rank}`}
                        tone="warning"
                      />
                    ) : null}
                    {part.active_count > 0 ? (
                      <StatusBadge
                        label={`${part.active_count} karya aktif dikirim`}
                        tone="success"
                      />
                    ) : (
                      <StatusBadge
                        label="Submission ditarik"
                        tone="neutral"
                      />
                    )}
                    {part.last_submitted_at ? (
                      <span className="text-xs text-ink-mute">
                        Terakhir kirim {formatDateTimeId(part.last_submitted_at)}
                      </span>
                    ) : null}
                  </div>
                }
                actions={
                  <>
                    {ch.status === 'open' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        href={`/challenges/${ch.challenge_id}/submit`}
                      >
                        Kirim karya →
                      </Button>
                    ) : null}
                    <Button
                      variant="tonal"
                      size="sm"
                      href="/dashboard/member?tab=submissions"
                    >
                      Submission saya
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      href={`/challenges/${ch.challenge_id}`}
                    >
                      Detail
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
