'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateRangeId } from '@/lib/shared/format';

export default function ChallengeSubmitForm({
  challenge,
  artworks = [],
  isOpenWindow = false,
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const firstEligible = artworks.find((a) => !a.already_submitted);
  const [selectedId, setSelectedId] = useState(
    firstEligible ? firstEligible.artwork_id : null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedArtwork = artworks.find((a) => a.artwork_id === selectedId);

  const handleConfirmSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/challenges/${challenge.challenge_id}/submissions`, {
        method: 'POST',
        body: { artwork_id: selectedId },
      });
      setConfirmOpen(false);
      showToast({
        tone: 'success',
        title: 'Submission berhasil',
        message: `Karya "${selectedArtwork?.title}" telah didaftarkan ke tantangan.`,
      });
      router.push('/dashboard/member?tab=submissions');
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/challenges/${challenge.challenge_id}`}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke detail tantangan
        </Link>
      </div>

      {/* Ringkasan Tantangan */}
      <section className="edge-glow rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge domain="challenge" status={challenge.status} />
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand-700">
            {challenge.category ? challenge.category.name : 'Semua Kategori'}
          </span>
        </div>
        <h1 className="text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
          Ikut tantangan: {challenge.title}
        </h1>
        <p className="text-sm text-ink-soft">
          Periode {formatDateRangeId(challenge.start_date, challenge.end_date)} · Kurator:{' '}
          <strong>{challenge.curator.display_name}</strong>
        </p>
      </section>

      {!isOpenWindow ? (
        <Alert tone="warning" title="Tantangan tidak menerima submission">
          Tantangan ini sedang tidak dalam masa pengumpulan karya. Periksa kembali jadwal periode tantangan.
        </Alert>
      ) : artworks.length === 0 ? (
        <EmptyState
          title="Belum ada karya yang memenuhi syarat"
          description={
            challenge.category
              ? `Kamu belum memiliki karya berstatus Dipublikasikan pada kategori ${challenge.category.name}.`
              : 'Kamu belum memiliki karya berstatus Dipublikasikan untuk diajukan.'
          }
          actionLabel="Unggah karya →"
          actionHref="/dashboard/member/artworks/new"
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-ink">
              Pilih karya dari portofoliomu
            </h2>
            <p className="text-sm text-ink-soft">
              Karya direferensikan langsung tanpa perlu mengunggah ulang file gambar.
            </p>
          </div>

          <div className="auto-grid-wide gap-4">
            {artworks.map((art) => {
              const isSelected = selectedId === art.artwork_id;
              const disabled = art.already_submitted;

              return (
                <label
                  key={art.artwork_id}
                  className={`flex cursor-pointer items-center gap-4 rounded-[18px] border p-4 transition-all ${
                    disabled
                      ? 'cursor-not-allowed border-line bg-canvas opacity-65'
                      : isSelected
                        ? 'border-brand-600 bg-brand-50 shadow-card-sm'
                        : 'border-line bg-surface hover:border-brand-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="eligible_artwork"
                    value={art.artwork_id}
                    disabled={disabled}
                    checked={isSelected}
                    onChange={() => setSelectedId(art.artwork_id)}
                    className="h-4 w-4 shrink-0 accent-brand-600"
                  />
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-[14px] bg-brand-50">
                    <img
                      src={art.image_url}
                      alt={art.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-base font-semibold text-ink">
                      {art.title}
                    </p>
                    <p className="text-xs text-ink-mute">{art.category.name}</p>
                    {art.already_submitted ? (
                      <StatusBadge domain="submission" status="submitted" />
                    ) : art.previously_withdrawn ? (
                      <span className="inline-block text-xs font-medium text-brand-700">
                        Pernah ditarik · bisa dikirim ulang
                      </span>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedId}
              onClick={() => setConfirmOpen(true)}
            >
              Ajukan karya ke tantangan →
            </Button>
            <Button variant="secondary" href="/dashboard/member/artworks/new">
              Unggah karya baru
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Konfirmasi submission"
        description={`Karya "${selectedArtwork?.title || ''}" akan diajukan ke "${challenge.title}". Pastikan karya berstatus Dipublikasikan, milikmu sendiri, dan memenuhi ketentuan tantangan.`}
        confirmLabel="Ajukan karya"
        cancelLabel="Batal"
        variant="primary"
        loading={submitting}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
