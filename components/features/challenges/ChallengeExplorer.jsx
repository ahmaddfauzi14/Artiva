'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import ChallengeCard from '@/components/cards/ChallengeCard';
import ChipRow from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/ui/SearchBar';
import { ChallengeCardSkeleton } from '@/components/ui/Skeleton';
import { apiFetch } from '@/lib/shared/api-client';

const STATUS_TABS = [
  { label: 'Semua tantangan', value: '' },
  { label: 'Terbuka', value: 'open' },
  { label: 'Selesai', value: 'ended' },
];

export default function ChallengeExplorer({
  initialChallenges = [],
  initialMeta = { page: 1, limit: 12, total: 0 },
  initialStatus = '',
  initialQuery = '',
}) {
  const router = useRouter();
  const [challenges, setChallenges] = useState(initialChallenges);
  const [meta, setMeta] = useState(initialMeta);
  const [status, setStatus] = useState(initialStatus);
  const [q, setQ] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchChallenges = async ({
    nextStatus = status,
    nextQ = q,
    nextPage = 1,
  }) => {
    setLoading(true);
    setErrorMsg('');

    const params = new URLSearchParams();
    if (nextStatus) params.set('status', nextStatus);
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextPage > 1) params.set('page', String(nextPage));

    const qs = params.toString();
    router.replace(qs ? `/challenges?${qs}` : '/challenges', { scroll: false });

    try {
      params.set('limit', '12');
      const res = await apiFetch(`/api/challenges?${params.toString()}`);
      setChallenges(res.data.challenges || []);
      setMeta(res.meta || { page: nextPage, limit: 12, total: 0 });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ChipRow
          items={STATUS_TABS}
          activeValue={status}
          onSelect={(val) => {
            setStatus(val);
            fetchChallenges({ nextStatus: val, nextQ: q, nextPage: 1 });
          }}
        />
        <SearchBar
          compact
          value={q}
          onChange={setQ}
          placeholder="Cari judul tantangan…"
          onSubmit={(val) => {
            setQ(val);
            fetchChallenges({ nextStatus: status, nextQ: val, nextPage: 1 });
          }}
        />
      </div>

      {errorMsg ? (
        <Alert tone="danger" title="Gagal memuat tantangan">
          {errorMsg}
        </Alert>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <ChallengeCardSkeleton />
          <ChallengeCardSkeleton />
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          title="Belum ada tantangan ditemukan"
          description="Coba lihat kategori status lainnya atau cek kembali dalam waktu dekat."
          actionLabel="Tampilkan semua tantangan"
          onAction={() => {
            setStatus('');
            setQ('');
            fetchChallenges({ nextStatus: '', nextQ: '', nextPage: 1 });
          }}
        />
      ) : (
        <>
          <div className="space-y-5">
            {challenges.map((ch, idx) => (
              <ChallengeCard
                key={ch.challenge_id}
                challenge={ch}
                variant={idx === 0 ? 'feature' : 'compact'}
                index={idx}
              />
            ))}
          </div>
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            onPageChange={(nextPage) =>
              fetchChallenges({ nextStatus: status, nextQ: q, nextPage })
            }
          />
        </>
      )}
    </div>
  );
}
