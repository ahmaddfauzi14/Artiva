'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateTimeId } from '@/lib/shared/format';

const REASON_LABELS = {
  spam: 'Spam / promosi berlebihan',
  plagiarism: 'Dugaan plagiarisme',
  inappropriate: 'Konten tidak pantas',
  copyright: 'Pelanggaran hak cipta',
  other: 'Laporan komunitas',
};

export default function AdminReportDetail({ initialReport }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [report, setReport] = useState(initialReport);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'hide' | 'remove' | 'dismiss'
  const [busy, setBusy] = useState(false);

  const isPending = report.status === 'pending';

  const openConfirmation = (actionType) => {
    if (note.trim().length < 5) {
      setNoteError('Catatan tinjauan wajib diisi minimal 5 karakter.');
      return;
    }
    setNoteError('');
    setModalAction(actionType);
  };

  const handleConfirmDecision = async () => {
    if (!modalAction) return;
    setBusy(true);
    try {
      let res;
      if (modalAction === 'dismiss') {
        res = await apiFetch(
          `/api/admin/reports/${report.report_id}/dismiss`,
          {
            method: 'POST',
            body: { resolution_note: note.trim() },
          }
        );
      } else {
        res = await apiFetch(
          `/api/admin/reports/${report.report_id}/resolve`,
          {
            method: 'POST',
            body: { action: modalAction, resolution_note: note.trim() },
          }
        );
      }

      setReport(res.data.report);
      setModalAction(null);
      showToast({
        tone: 'success',
        title: 'Keputusan tersimpan',
        message:
          modalAction === 'dismiss'
            ? 'Laporan ditolak dan ditutup.'
            : modalAction === 'remove'
              ? 'Laporan diselesaikan dan karya dihapus.'
              : 'Laporan diselesaikan dan karya disembunyikan.',
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/reports"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke antrean moderasi
        </Link>
      </div>

      {!isPending ? (
        <Alert
          tone={report.status === 'resolved' ? 'success' : 'neutral'}
          title={
            report.status === 'resolved'
              ? `Laporan Selesai. ${
                  report.artwork_status === 'removed'
                    ? 'Karya dihapus.'
                    : report.artwork_status === 'hidden'
                      ? 'Karya disembunyikan.'
                      : 'Karya tetap dipublikasikan.'
                }`
              : 'Laporan Ditolak. Tidak ditemukan pelanggaran.'
          }
        >
          <div className="space-y-1">
            <p>
              <strong>Catatan keputusan:</strong> {report.resolution_note}
            </p>
            <p className="text-xs">
              Ditinjau oleh{' '}
              <strong>
                {report.handler_display_name || report.handler_username || 'Admin'}
              </strong>
            </p>
          </div>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Kiri: Detail Karya & Riwayat Laporan */}
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-5 rounded-[28px] border border-line bg-surface p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge domain="report" status={report.status} />
                <StatusBadge domain="artwork" status={report.artwork_status} />
              </div>
              <span className="tabular-nums text-sm text-ink-mute">
                Laporan #{report.report_id} · {formatDateTimeId(report.created_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
              <div className="overflow-hidden rounded-[14px] bg-brand-50 sm:col-span-5">
                <img
                  src={report.artwork_image_url}
                  alt={report.artwork_title}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <div className="space-y-3 sm:col-span-7">
                <div>
                  <p className="text-xs font-semibold uppercase text-ink-mute">
                    Karya Terlapor
                  </p>
                  <h2 className="mt-0.5 text-2xl font-semibold text-ink">
                    {report.artwork_title}
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Kategori: {report.category_name} · Kreator:{' '}
                    <strong>
                      {report.creator_display_name || report.creator_username}
                    </strong>{' '}
                    (@{report.creator_username})
                  </p>
                </div>

                {report.artwork_description ? (
                  <p className="text-sm text-ink-soft line-clamp-4">
                    {report.artwork_description}
                  </p>
                ) : null}

                {/* Callout Peach Laporan */}
                <div className="rounded-[18px] bg-tint-peach p-4 text-sm text-ink shadow-tint-peach space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#FCA5A5]">
                    {REASON_LABELS[report.reason] || report.reason}
                  </p>
                  <p className="text-ink-soft">
                    <strong>Pelapor:</strong>{' '}
                    {report.reporter_display_name || report.reporter_username} (@
                    {report.reporter_username})
                  </p>
                  {report.description ? (
                    <p className="italic text-ink">
                      &ldquo;{report.description}&rdquo;
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Laporan lain pada karya yang sama */}
          <div className="space-y-4 rounded-[28px] border border-line bg-surface p-6 shadow-card-sm">
            <h3 className="tabular-nums text-lg font-semibold text-ink">
              Riwayat laporan lain pada karya ini ({report.other_reports?.length || 0})
            </h3>
            {!report.other_reports || report.other_reports.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Belum ada laporan lain untuk karya ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {report.other_reports.map((other) => (
                  <li
                    key={other.report_id}
                    className="space-y-1 rounded-[18px] border border-line bg-canvas p-4 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="tabular-nums font-semibold text-ink">
                        #{other.report_id} ·{' '}
                        {REASON_LABELS[other.reason] || other.reason}
                      </span>
                      <StatusBadge domain="report" status={other.status} />
                    </div>
                    <p className="text-ink-soft">
                      Pelapor: @{other.reporter_username} ·{' '}
                      {formatDateTimeId(other.created_at)}
                    </p>
                    {other.description ? (
                      <p className="text-ink-soft">{other.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Kanan: Panel Keputusan Moderasi */}
        <div className="space-y-5 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-5">
          <h3 className="text-xl font-semibold text-ink">Keputusan moderasi</h3>

          {isPending ? (
            <>
              <FormField
                label="Catatan tinjauan"
                name="resolution_note"
                as="textarea"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tuliskan alasan dan hasil pemeriksaan laporan (minimal 5 karakter)..."
                error={noteError}
                required
              />

              <div className="space-y-2.5 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Jika pelanggaran tidak terbukti
                </p>
                <Button
                  variant="tonal"
                  onClick={() => openConfirmation('dismiss')}
                  className="w-full"
                >
                  Tandai Ditolak
                </Button>
              </div>

              <div className="space-y-3 border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-soft">
                  Jika pelanggaran terbukti
                </p>
                <div className="space-y-1.5">
                  <Button
                    variant="primary"
                    onClick={() => openConfirmation('hide')}
                    className="w-full"
                  >
                    Sembunyikan &amp; selesaikan
                  </Button>
                  <p className="text-xs text-ink-mute">
                    Karya tidak lagi ditampilkan ke publik.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Button
                    variant="crimson"
                    onClick={() => openConfirmation('remove')}
                    className="w-full"
                  >
                    Hapus karya…
                  </Button>
                  <p className="text-xs text-[#FCA5A5]">
                    Penghapusan permanen memerlukan konfirmasi.
                  </p>
                </div>
              </div>

              <p className="border-t border-line pt-4 text-xs text-ink-mute">
                Moderasi tidak mengubah isi karya dan tidak menentukan pemenang.
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Laporan ini sudah berstatus final dan tercatat dalam riwayat moderasi.
            </p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={Boolean(modalAction)}
        title={
          modalAction === 'remove'
            ? 'Hapus karya ini secara permanen?'
            : modalAction === 'hide'
              ? 'Sembunyikan karya ini?'
              : 'Tolak laporan ini?'
        }
        description={
          modalAction === 'dismiss'
            ? 'Laporan akan ditutup sebagai Ditolak dan karya tetap tampil di galeri publik.'
            : 'Karya tidak lagi tampil di publik, submission aktif pada tantangan yang belum diumumkan ditarik otomatis, dan laporan pending lain pada karya ini ikut ditutup.'
        }
        infoBox={note}
        confirmLabel={
          modalAction === 'remove'
            ? 'Ya, hapus karya'
            : modalAction === 'hide'
              ? 'Ya, sembunyikan'
              : 'Ya, tolak laporan'
        }
        cancelLabel="Batal"
        variant={modalAction === 'remove' ? 'crimson' : 'primary'}
        loading={busy}
        onConfirm={handleConfirmDecision}
        onClose={() => setModalAction(null)}
      />
    </div>
  );
}
