'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Select from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import WinnerPodium from '@/components/cards/WinnerPodium';
import { apiFetch } from '@/lib/shared/api-client';

const RANK_OPTIONS = [
  { value: '1', label: 'Juara 1' },
  { value: '2', label: 'Juara 2' },
  { value: '3', label: 'Juara 3' },
];

export default function CuratorWinners({
  challenge: initialChallenge,
  eligibleSubmissions = [],
  existingWinners = [],
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [challenge, setChallenge] = useState(initialChallenge);
  const [winners, setWinners] = useState(existingWinners);
  const [selectedMap, setSelectedMap] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleSelect = (submissionId) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[submissionId]) {
        delete next[submissionId];
        return next;
      }
      if (Object.keys(next).length >= 3) {
        showToast({
          tone: 'warning',
          message: 'Maksimal 3 pemenang dapat dipilih.',
        });
        return prev;
      }
      const usedRanks = new Set(Object.values(next));
      const nextRank = [1, 2, 3].find((r) => !usedRanks.has(r)) || 1;
      next[submissionId] = nextRank;
      return next;
    });
  };

  const setRank = (submissionId, rank) => {
    const targetRank = Number(rank);
    setSelectedMap((prev) => {
      const next = { ...prev };
      const oldRank = next[submissionId];
      const conflictingEntry = Object.entries(next).find(
        ([id, r]) => Number(id) !== submissionId && r === targetRank
      );
      if (conflictingEntry && oldRank) {
        next[conflictingEntry[0]] = oldRank;
      }
      next[submissionId] = targetRank;
      return next;
    });
  };

  const chosenEntries = Object.entries(selectedMap)
    .map(([subId, rank]) => {
      const sub = eligibleSubmissions.find(
        (s) => s.submission_id === Number(subId)
      );
      return sub ? { submission_id: Number(subId), rank, sub } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);

  const handleConfirmAnnounce = async () => {
    setSubmitting(true);
    try {
      const payload = {
        winners: chosenEntries.map((item) => ({
          submission_id: item.submission_id,
          rank: item.rank,
        })),
      };
      const res = await apiFetch(
        `/api/curator/challenges/${challenge.challenge_id}/winners`,
        { method: 'POST', body: payload }
      );
      setWinners(res.data.winners || []);
      setChallenge((prev) => ({ ...prev, status: 'announced' }));
      setConfirmOpen(false);
      showToast({
        tone: 'success',
        title: 'Pemenang diumumkan!',
        message: 'Daftar pemenang kini tampil secara publik pada halaman tantangan.',
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (challenge.status === 'open') {
    return (
      <div className="space-y-6">
        <Link
          href="/curator/challenges"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar tantangan
        </Link>
        <Alert tone="warning" title="Tantangan masih berlangsung">
          Penetapan pemenang baru dapat dilakukan setelah tanggal berakhir tantangan lewat dan status berubah menjadi Ditutup.
        </Alert>
      </div>
    );
  }

  if (challenge.status === 'announced') {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/curator/challenges"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            ← Kembali ke daftar tantangan
          </Link>
          <Button
            variant="secondary"
            size="sm"
            href={`/challenges/${challenge.challenge_id}`}
          >
            Lihat halaman publik
          </Button>
        </div>

        <Alert tone="info" title="Apresiasi terbaik dimulai dari kurasi yang adil.">
          Pemenang tantangan ini sudah diumumkan secara resmi dan tidak dapat diubah kembali.
        </Alert>

        <WinnerPodium
          winners={winners}
          showModerationWarning
          artworkHrefPrefix={`/curator/challenges/${challenge.challenge_id}/winners`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/curator/challenges"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar tantangan
        </Link>
      </div>

      {eligibleSubmissions.length === 0 ? (
        <EmptyState
          title="Belum ada karya peserta aktif"
          description="Tidak terdapat submission berstatus Terkirim dan karya Dipublikasikan untuk ditetapkan sebagai pemenang."
          actionLabel="Lihat semua submission"
          actionHref={`/curator/challenges/${challenge.challenge_id}/submissions`}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Daftar Kandidat */}
          <div className="space-y-4 lg:col-span-8">
            <h2 className="tabular-nums text-xl font-semibold text-ink">
              Pilih 1 hingga 3 karya terbaik ({eligibleSubmissions.length} peserta)
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {eligibleSubmissions.map((sub) => {
                const chosenRank = selectedMap[sub.submission_id];
                const isSelected = Boolean(chosenRank);
                return (
                  <div
                    key={sub.submission_id}
                    className={`rounded-[28px] border p-4 motion-safe:transition-all motion-safe:duration-200 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 shadow-card-sm'
                        : 'border-line bg-surface hover:border-brand-200'
                    }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-[14px] bg-brand-50">
                      <img
                        src={sub.artwork.image_url}
                        alt={sub.artwork.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-3 space-y-2">
                      <h3 className="truncate text-lg font-semibold text-ink">
                        {sub.artwork.title}
                      </h3>
                      <p className="text-sm text-ink-soft">
                        oleh {sub.creator.display_name}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <Button
                          variant={isSelected ? 'primary' : 'tonal'}
                          size="sm"
                          onClick={() => toggleSelect(sub.submission_id)}
                        >
                          {isSelected ? `Terpilih · Juara 0${chosenRank}` : 'Pilih karya'}
                        </Button>

                        {isSelected ? (
                          <div className="w-[126px] shrink-0">
                            <Select
                              size="sm"
                              align="end"
                              ariaLabel={`Peringkat untuk ${sub.artwork.title}`}
                              value={String(chosenRank)}
                              onValueChange={(nextRank) =>
                                setRank(sub.submission_id, nextRank)
                              }
                              options={RANK_OPTIONS}
                              className="border-brand-200 bg-surface"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Karya Dipilih */}
          <aside className="space-y-4 rounded-[28px] border border-line bg-surface p-6 shadow-card lg:col-span-4 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
              KARYA DIPILIH
            </p>
            <h3 className="tabular-nums text-xl font-semibold text-ink">
              Ringkasan pemenang ({chosenEntries.length}/3)
            </h3>

            {chosenEntries.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Pilih minimal 1 karya di samping, lalu atur peringkat unik mulai dari Juara 1.
              </p>
            ) : (
              <ul className="space-y-3">
                {chosenEntries.map((item) => (
                  <li
                    key={item.submission_id}
                    className="flex items-center justify-between gap-3 rounded-[18px] bg-canvas p-3 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="tabular-nums text-xs font-semibold text-brand-700">
                        JUARA 0{item.rank}
                      </p>
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.sub.artwork.title}
                      </p>
                      <p className="truncate text-xs text-ink-mute">
                        {item.sub.creator.display_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.rank > 1 ? (
                        <button
                          type="button"
                          aria-label={`Naikkan peringkat ${item.sub.artwork.title}`}
                          onClick={() => setRank(item.submission_id, item.rank - 1)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-xs font-semibold text-ink hover:bg-brand-50"
                        >
                          ↑
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.submission_id)}
                        className="min-h-[36px] px-2 text-xs font-semibold text-[#FCA5A5] hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Button
              variant="primary"
              disabled={chosenEntries.length === 0}
              onClick={() => setConfirmOpen(true)}
              className="w-full"
            >
              Umumkan pemenang
            </Button>
          </aside>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Konfirmasi pengumuman"
        description="Pastikan karya dan peringkat sudah benar. Setelah diumumkan, status tantangan berubah menjadi Diumumkan dan daftar pemenang tidak dapat diubah."
        infoBox="Hanya submission aktif yang dipilih akan diumumkan."
        confirmLabel="Umumkan pemenang"
        cancelLabel="Batal"
        variant="primary"
        loading={submitting}
        onConfirm={handleConfirmAnnounce}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
