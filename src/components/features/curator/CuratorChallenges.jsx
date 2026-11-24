'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ChallengeCard from '@/components/cards/ChallengeCard';
import ChipRow from '@/components/ui/Chip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

const STATUS_FILTERS = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu pemenang', value: 'closed' },
  { label: 'Terbuka', value: 'open' },
  { label: 'Draft', value: 'draft' },
  { label: 'Diumumkan', value: 'announced' },
];

export default function CuratorChallenges({ initialChallenges = [] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [challenges, setChallenges] = useState(initialChallenges);
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishingId, setPublishingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const drafts = challenges.filter((c) => c.status === 'draft');
  const opens = challenges.filter((c) => c.status === 'open');
  const closeds = challenges.filter((c) => c.status === 'closed');
  const announceds = challenges.filter((c) => c.status === 'announced');

  const handlePublish = async (ch) => {
    setPublishingId(ch.challenge_id);
    try {
      const res = await apiFetch(
        `/api/curator/challenges/${ch.challenge_id}/publish`,
        { method: 'POST' }
      );
      setChallenges((prev) =>
        prev.map((item) =>
          item.challenge_id === ch.challenge_id ? res.data.challenge : item
        )
      );
      showToast({
        tone: 'success',
        title: 'Tantangan dipublikasikan',
        message: `"${ch.title}" kini terbuka untuk menerima karya.`,
      });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(
        `/api/curator/challenges/${deleteTarget.challenge_id}`,
        { method: 'DELETE' }
      );
      setChallenges((prev) =>
        prev.filter((c) => c.challenge_id !== deleteTarget.challenge_id)
      );
      showToast({
        tone: 'info',
        title: 'Tantangan dihapus',
        message: `"${deleteTarget.title}" berhasil dihapus.`,
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const renderChallengeActions = (ch) => (
    <>
      {ch.status === 'draft' ? (
        <Button
          variant="primary"
          size="sm"
          loading={publishingId === ch.challenge_id}
          onClick={() => handlePublish(ch)}
        >
          Publikasikan
        </Button>
      ) : null}

      {ch.status !== 'draft' ? (
        <Button
          variant="tonal"
          size="sm"
          href={`/curator/challenges/${ch.challenge_id}/submissions`}
        >
          Lihat submission ({ch.submission_count}) →
        </Button>
      ) : null}

      {ch.status === 'closed' ? (
        <Button
          variant="primary"
          size="sm"
          href={`/curator/challenges/${ch.challenge_id}/winners`}
        >
          Tentukan pemenang →
        </Button>
      ) : null}

      {ch.status === 'announced' ? (
        <Button
          variant="secondary"
          size="sm"
          href={`/curator/challenges/${ch.challenge_id}/winners`}
        >
          Lihat pengumuman →
        </Button>
      ) : null}

      {ch.status === 'draft' || ch.status === 'open' ? (
        <Button
          variant="secondary"
          size="sm"
          href={`/curator/challenges/${ch.challenge_id}/edit`}
        >
          Ubah
        </Button>
      ) : null}

      {ch.status === 'draft' || ch.total_submissions === 0 ? (
        <button
          type="button"
          onClick={() => setDeleteTarget(ch)}
          className="min-h-[44px] px-2 text-sm font-semibold text-[#FCA5A5] hover:underline"
        >
          Hapus
        </button>
      ) : null}
    </>
  );

  const visibleList =
    statusFilter === 'closed'
      ? closeds
      : statusFilter === 'open'
        ? opens
        : statusFilter === 'draft'
          ? drafts
          : statusFilter === 'announced'
            ? announceds
            : challenges;

  const groupedSections = [
    { key: 'closed', title: 'Menunggu penetapan pemenang', list: closeds },
    { key: 'open', title: 'Sedang berlangsung (Terbuka)', list: opens },
    { key: 'draft', title: 'Draft', list: drafts },
    { key: 'announced', title: 'Sudah diumumkan', list: announceds },
  ].filter((group) => group.list.length > 0);

  return (
    <div className="space-y-6">
      <ChipRow
        items={STATUS_FILTERS.map((item) => ({
          ...item,
          count:
            item.value === 'all'
              ? challenges.length
              : item.value === 'closed'
                ? closeds.length
                : item.value === 'open'
                  ? opens.length
                  : item.value === 'draft'
                    ? drafts.length
                    : announceds.length,
        }))}
        activeValue={statusFilter}
        onSelect={setStatusFilter}
      />

      {closeds.length > 0 &&
      (statusFilter === 'all' || statusFilter === 'closed') ? (
        <Alert tone="warning" title="Menunggu penetapan pemenang">
          Ada {closeds.length} tantangan yang periodenya sudah berakhir dan siap
          ditetapkan pemenangnya.
        </Alert>
      ) : null}

      {challenges.length === 0 ? (
        <EmptyState
          title="Belum ada tantangan dibuat"
          description="Buat tantangan tematik pertamamu untuk mengajak kreator berpartisipasi."
          actionLabel="Buat tantangan →"
          actionHref="/curator/challenges/new"
        />
      ) : statusFilter === 'all' ? (
        <div className="space-y-10">
          {groupedSections.map((group) => (
            <section key={group.key} className="space-y-4">
              <h2 className="tabular-nums text-xl font-semibold text-ink">
                {group.title} ({group.list.length})
              </h2>
              <div className="space-y-4">
                {group.list.map((ch, idx) => (
                  <ChallengeCard
                    key={ch.challenge_id}
                    challenge={ch}
                    variant="compact"
                    index={idx}
                    actions={renderChallengeActions(ch)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : visibleList.length === 0 ? (
        <EmptyState
          title="Tidak ada tantangan pada status ini"
          description="Tantangan yang kamu buat dengan status terkait akan tampil di sini."
          actionLabel="Tampilkan semua tantangan"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="space-y-4">
          {visibleList.map((ch, idx) => (
            <ChallengeCard
              key={ch.challenge_id}
              challenge={ch}
              variant="compact"
              index={idx}
              actions={renderChallengeActions(ch)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus tantangan ini?"
        description={`Tantangan "${deleteTarget?.title || ''}" akan dihapus permanen.`}
        confirmLabel="Ya, hapus tantangan"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
