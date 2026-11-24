'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateId, formatDateRangeId } from '@/lib/shared/format';

export default function ChallengeSubmitForm({
  challenge,
  artworks = [],
  isOpenWindow = false,
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectableArtworks = useMemo(
    () => artworks.filter((a) => !a.already_submitted),
    [artworks]
  );
  const submittedArtworks = useMemo(
    () => artworks.filter((a) => a.already_submitted),
    [artworks]
  );

  const filteredSelectable = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return selectableArtworks;
    return selectableArtworks.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category?.name?.toLowerCase().includes(q)
    );
  }, [selectableArtworks, filterText]);

  const selectedArtwork = useMemo(
    () => selectableArtworks.find((a) => a.artwork_id === selectedId) || null,
    [selectableArtworks, selectedId]
  );

  const hasSelection = Boolean(selectedArtwork);

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
      router.push('/me/submissions');
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <Link
          href={`/challenges/${challenge.challenge_id}`}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke detail tantangan
        </Link>
      </div>

      {/* Ringkasan Tantangan */}
      <section className="edge-glow space-y-3 rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge domain="challenge" status={challenge.status} />
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand-700">
            {challenge.category
              ? `Kategori: ${challenge.category.name}`
              : 'Semua Kategori'}
          </span>
        </div>
        <h1 className="text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
          Ikut tantangan: {challenge.title}
        </h1>
        <p className="text-sm text-ink-soft">
          Periode {formatDateRangeId(challenge.start_date, challenge.end_date)} ·
          Kurator: <strong className="text-ink">{challenge.curator.display_name}</strong>
        </p>
      </section>

      {!isOpenWindow ? (
        <Alert tone="warning" title="Tantangan tidak menerima submission">
          Tantangan ini sedang tidak dalam masa pengumpulan karya. Periksa kembali
          jadwal periode tantangan.
        </Alert>
      ) : artworks.length === 0 ? (
        <EmptyState
          title={
            challenge.category
              ? `Belum ada karya pada kategori ${challenge.category.name}`
              : 'Belum ada karya yang memenuhi syarat'
          }
          description={
            challenge.category
              ? `Hanya karya berstatus Dipublikasikan dengan kategori ${challenge.category.name} yang dapat didaftarkan ke tantangan ini. Unggah karya baru atau periksa status karyamu di halaman Karya saya.`
              : 'Hanya karya berstatus Dipublikasikan yang dapat didaftarkan ke tantangan ini. Unggah karya baru atau publikasikan karyamu di halaman Karya saya.'
          }
          actionLabel="Unggah karya baru →"
          actionHref="/me/artworks/new"
        />
      ) : (
        <div className="space-y-10">
          {/* Bagian 1: Karya Portofolio Siap Dipilih */}
          <section className="space-y-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  LANGSUNG DARI PORTOFOLIOMU
                </p>
                <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                  Pilih karya untuk diikutkan kompetisi
                </h2>
                <p className="text-sm text-ink-soft">
                  Klik langsung karya milikmu di bawah ini tanpa perlu mengunggah
                  ulang file gambar.
                  {selectableArtworks.length > 0 ? (
                    <span className="ml-1.5 font-semibold text-ink">
                      ({selectableArtworks.length} karya siap dipilih
                      {submittedArtworks.length > 0
                        ? ` · ${submittedArtworks.length} sudah terdaftar`
                        : ''}
                      )
                    </span>
                  ) : null}
                </p>
              </div>

              {selectableArtworks.length > 4 ? (
                <div className="w-full sm:w-64">
                  <label htmlFor="filter-eligible-artwork" className="sr-only">
                    Cari karya di portofoliomu
                  </label>
                  <input
                    id="filter-eligible-artwork"
                    type="search"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Cari judul karyamu..."
                    className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-mute focus:border-brand-700 focus:outline-none"
                  />
                </div>
              ) : null}
            </div>

            {selectableArtworks.length === 0 ? (
              <Alert
                tone="info"
                title="Semua karyamu yang memenuhi syarat sudah terdaftar"
              >
                <div className="space-y-3">
                  <p>
                    Seluruh karya portofoliomu yang cocok dengan ketentuan
                    tantangan ini sudah berhasil diajukan. Kamu dapat memantau
                    atau menarik pengajuan di halaman Submission.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      href="/me/submissions"
                    >
                      Lihat submission saya →
                    </Button>
                    <Link
                      href="/me/artworks/new"
                      className="text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Atau unggah karya baru
                    </Link>
                  </div>
                </div>
              </Alert>
            ) : filteredSelectable.length === 0 ? (
              <Alert tone="info" title="Tidak ditemukan">
                Tidak ada karya yang cocok dengan kata kunci &ldquo;{filterText}
                &rdquo;.
              </Alert>
            ) : (
              <fieldset className="space-y-5">
                <legend className="sr-only">
                  Daftar karya portofolio yang dapat dipilih untuk tantangan
                </legend>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSelectable.map((art) => {
                    const isSelected = selectedId === art.artwork_id;

                    return (
                      <label
                        key={art.artwork_id}
                        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[22px] border-2 motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] motion-safe:active:scale-[0.985] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-brand-700 has-[:focus-visible]:outline-offset-2 ${
                          isSelected
                            ? 'border-brand-700 bg-gradient-to-b from-[#2B2616] via-[#1B2542] to-[#122142] ring-4 ring-brand-700/25 shadow-[0_18px_40px_-14px_rgba(242,201,76,0.45)] motion-safe:-translate-y-1.5'
                            : hasSelection
                              ? 'border-line/80 bg-surface/80 opacity-60 saturate-[0.65] hover:border-brand-400/80 hover:opacity-100 hover:saturate-100 motion-safe:hover:-translate-y-0.5'
                              : 'border-line bg-surface hover:border-brand-400 hover:shadow-card motion-safe:hover:-translate-y-1'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eligible_artwork"
                          value={art.artwork_id}
                          checked={isSelected}
                          onChange={() => setSelectedId(art.artwork_id)}
                          className="sr-only"
                        />

                        {/* Media Pratinjau Karya */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-900">
                          <img
                            src={art.image_url}
                            alt={art.title}
                            loading="lazy"
                            className={`h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 ${
                              isSelected
                                ? 'scale-[1.04]'
                                : 'group-hover:scale-[1.03]'
                            }`}
                          />

                          {/* Overlay Vignette halus agar badge selalu terbaca kontras */}
                          <div
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
                              isSelected
                                ? 'bg-gradient-to-t from-[#091326]/70 via-transparent to-[#091326]/40 ring-2 ring-inset ring-brand-700/60'
                                : 'bg-gradient-to-t from-[#091326]/50 via-transparent to-[#091326]/20'
                            }`}
                          />

                          {/* Badge Kiri Atas: Penanda Jelas Karya Terpilih */}
                          {isSelected ? (
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1 text-xs font-bold tracking-wide text-[#091326] shadow-md">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                  stroke="currentColor"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Dipilih untuk kompetisi
                            </span>
                          ) : (
                            <span className="absolute left-3 top-3 rounded-full bg-canvas/80 px-2.5 py-1 text-[11px] font-semibold text-ink-soft backdrop-blur-sm">
                              {art.category.name}
                            </span>
                          )}

                          {/* Indikator Radio Visual di Kanan Atas */}
                          <span
                            aria-hidden="true"
                            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                              isSelected
                                ? 'border-brand-700 bg-brand-700 text-[#091326] scale-105 shadow-md'
                                : 'border-ink/50 bg-canvas/65 text-transparent group-hover:border-brand-700/80'
                            }`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>

                        {/* Info Karya */}
                        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                          <div className="space-y-1">
                            <p
                              className={`line-clamp-2 text-base font-semibold leading-snug transition-colors ${
                                isSelected ? 'text-brand-700' : 'text-ink'
                              }`}
                            >
                              {art.title}
                            </p>
                            <p className="text-xs text-ink-mute">
                              {art.category.name} ·{' '}
                              {formatDateId(art.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 border-t border-line/60 pt-2.5 text-xs">
                            {isSelected ? (
                              <span className="font-semibold text-brand-700">
                                ★ Siap diajukan ke tantangan
                              </span>
                            ) : art.previously_withdrawn ? (
                              <span className="font-medium text-brand-400">
                                Pernah ditarik · bisa dikirim ulang
                              </span>
                            ) : (
                              <span className="text-ink-soft group-hover:text-ink">
                                Klik untuk memilih karya ini
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Bar Konfirmasi Sticky untuk Karya Terpilih */}
                <div
                  className={`sticky bottom-4 z-20 rounded-[22px] border-2 p-4 backdrop-blur-md transition-all duration-200 sm:p-5 ${
                    selectedArtwork
                      ? 'border-brand-700 bg-[#14203C]/95 shadow-[0_18px_46px_-14px_rgba(4,10,24,0.9),0_0_0_1px_rgba(242,201,76,0.2)]'
                      : 'border-line bg-surface/92 shadow-card'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    {selectedArtwork ? (
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-[12px] border-2 border-brand-700 bg-brand-900">
                          <img
                            src={selectedArtwork.image_url}
                            alt={selectedArtwork.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700">
                            Karya Terpilih untuk Kompetisi
                          </p>
                          <p className="truncate text-base font-semibold text-ink">
                            {selectedArtwork.title}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {selectedArtwork.category.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-ink">
                          Belum ada karya yang dipilih
                        </p>
                        <p className="text-xs text-ink-soft">
                          Klik salah satu kartu karya di atas untuk memilihnya
                          sebagai entri kompetisimu.
                        </p>
                      </div>
                    )}

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      {selectedArtwork ? (
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
                        >
                          Batalkan pilihan
                        </button>
                      ) : null}
                      <Button
                        variant="primary"
                        size="lg"
                        disabled={!selectedArtwork}
                        onClick={() => setConfirmOpen(true)}
                      >
                        Ajukan karya terpilih →
                      </Button>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}
          </section>

          {/* Bagian 2: Karya yang Sudah Terdaftar di Tantangan Ini */}
          {submittedArtworks.length > 0 ? (
            <section className="space-y-4 border-t border-line/70 pt-6">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-ink">
                  Sudah terdaftar di tantangan ini ({submittedArtworks.length})
                </h3>
                <p className="text-xs text-ink-soft">
                  Karya di bawah sudah aktif mengikuti tantangan ini dan tidak
                  dapat dikirim dua kali.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {submittedArtworks.map((art) => (
                  <div
                    key={art.artwork_id}
                    className="flex items-center gap-3.5 rounded-[18px] border border-line/70 bg-canvas/70 p-3.5 opacity-75"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-brand-900">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {art.title}
                      </p>
                      <p className="text-xs text-ink-mute">
                        {art.category.name}
                      </p>
                      <StatusBadge domain="submission" status="submitted" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
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
