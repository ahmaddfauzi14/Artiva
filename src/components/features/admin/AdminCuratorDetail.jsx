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
import VerificationHistoryList from '@/components/features/curator/VerificationHistoryList';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateTimeId, getInitials } from '@/lib/shared/format';

export default function AdminCuratorDetail({ initialVerification }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [verification, setVerification] = useState(initialVerification);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isPending = verification.status === 'pending';

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await apiFetch(
        `/api/admin/curator-verifications/${verification.verification_id}/approve`,
        { method: 'POST' }
      );
      setVerification(res.data.verification);
      setApproveOpen(false);
      showToast({
        tone: 'success',
        title: 'Kurator disetujui',
        message: `${verification.display_name} kini aktif sebagai Kurator.`,
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (rejectNote.trim().length < 5) {
      setRejectError('Catatan penolakan minimal 5 karakter.');
      return;
    }
    setRejectError('');
    setBusy(true);
    try {
      const res = await apiFetch(
        `/api/admin/curator-verifications/${verification.verification_id}/reject`,
        {
          method: 'POST',
          body: { note: rejectNote.trim() },
        }
      );
      setVerification(res.data.verification);
      setRejectOpen(false);
      showToast({
        tone: 'info',
        title: 'Pengajuan ditolak',
        message: 'Alasan penolakan telah dicatat dan dapat dilihat oleh calon Kurator.',
      });
      router.refresh();
    } catch (err) {
      setRejectError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const safeWebsite =
    verification.website && /^https?:\/\//i.test(verification.website)
      ? verification.website
      : null;

  const maxAppeals = verification.max_appeals ?? 3;
  const appealNumber = verification.appeal_number ?? 0;
  const remainingAfterReject = Math.max(0, maxAppeals - appealNumber);
  const history = Array.isArray(verification.history) ? verification.history : [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/curators"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar verifikasi
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Kiri: Profil Calon */}
        <div className="space-y-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-600">
                RG-{String(verification.verification_id).padStart(3, '0')}
                {appealNumber > 0
                  ? ` · Banding ke-${appealNumber} dari ${maxAppeals}`
                  : ' · Pengajuan awal'}
                {' · Diajukan '}
                {formatDateTimeId(verification.submitted_at)}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-ink">
                {appealNumber > 0
                  ? `Detail banding kurator ke-${appealNumber}`
                  : 'Detail pengajuan kurator'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {appealNumber > 0 ? (
                <StatusBadge tone="info" label={`Banding ke-${appealNumber}`} />
              ) : null}
              <StatusBadge domain="verification" status={verification.status} />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-[18px] bg-brand-50/70 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-200 text-lg font-bold text-brand-700">
              {verification.avatar_url ? (
                <img
                  src={verification.avatar_url}
                  alt={verification.display_name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(verification.display_name || verification.username)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-ink">
                {verification.display_name || verification.username}
              </p>
              <p className="text-sm text-ink-soft">
                @{verification.username} · {verification.email}
              </p>
            </div>
          </div>

          {verification.appeal_note ? (
            <div className="rounded-[18px] border border-[#264E91] bg-[#142B52]/70 p-4 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#9BC4FF]">
                Catatan Banding dari Calon Kurator
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                {verification.appeal_note}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
                Profil &amp; Latar Belakang
              </p>
              <p className="mt-1 whitespace-pre-line text-base text-ink-soft">
                {verification.bio || 'Tidak ada bio.'}
              </p>
            </div>

            {safeWebsite ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-mute">
                  Situs Web / Portofolio
                </p>
                <a
                  href={safeWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block break-all text-sm font-semibold text-brand-700 hover:underline"
                >
                  {safeWebsite}
                </a>
              </div>
            ) : null}
          </div>

          <VerificationHistoryList
            history={history}
            title="Riwayat Pengajuan & Peninjauan"
            currentVerificationId={verification.verification_id}
            showReviewerMeta
            buildDetailHref={(item) =>
              `/dashboard/admin/curators/${item.verification_id}`
            }
          />
        </div>

        {/* Kanan: Panel Keputusan */}
        <div className="space-y-5 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-5">
          <h3 className="text-xl font-semibold text-ink">
            Keputusan verifikasi
          </h3>

          {isPending ? (
            <>
              <p className="text-sm text-ink-soft">
                Pastikan identitas dan latar belakang penyelenggara dapat dipercaya sebelum menyetujui pengajuan ini.
              </p>

              <FormField
                label="Catatan penolakan (wajib diisi jika menolak)"
                name="reject_note"
                as="textarea"
                rows={4}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Minimal 5 karakter bila pengajuan ditolak..."
                error={rejectError}
              />

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Button
                  variant="primary"
                  onClick={() => setApproveOpen(true)}
                  className="flex-1"
                >
                  Setujui Kurator
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (rejectNote.trim().length < 5) {
                      setRejectError('Catatan penolakan minimal 5 karakter.');
                      return;
                    }
                    setRejectError('');
                    setRejectOpen(true);
                  }}
                  className="flex-1"
                >
                  Tolak pengajuan
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Alert
                tone={verification.status === 'approved' ? 'success' : 'danger'}
                title={
                  verification.status === 'approved'
                    ? 'Pengajuan sudah disetujui'
                    : 'Pengajuan ditolak'
                }
              >
                {verification.status === 'approved'
                  ? 'Akun Kurator telah diaktifkan dan dapat menyelenggarakan tantangan.'
                  : verification.note || 'Tidak ada catatan tambahan.'}
              </Alert>

              <div className="rounded-[18px] bg-canvas p-4 text-sm text-ink-soft space-y-1">
                <p>
                  Tahap pengajuan:{' '}
                  <strong className="text-ink">
                    {appealNumber > 0
                      ? `Banding ke-${appealNumber} dari ${maxAppeals}`
                      : 'Pengajuan awal'}
                  </strong>
                </p>
                <p>
                  Ditinjau oleh:{' '}
                  <strong className="text-ink">
                    {verification.reviewer_display_name ||
                      verification.reviewer_username ||
                      'Admin'}
                  </strong>
                </p>
                <p>
                  Waktu keputusan: {formatDateTimeId(verification.reviewed_at)}
                </p>
                {verification.status === 'rejected' ? (
                  <p>
                    Sisa kuota banding akun:{' '}
                    <strong className="tabular-nums text-ink">
                      {verification.remaining_appeals ?? 0} dari {maxAppeals}
                    </strong>
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={approveOpen}
        title="Setujui pengajuan Kurator?"
        description={`Akun @${verification.username} (${verification.display_name}) akan diaktifkan dan dapat langsung membuat tantangan.`}
        confirmLabel="Ya, setujui"
        cancelLabel="Batal"
        variant="primary"
        loading={busy}
        onConfirm={handleApprove}
        onClose={() => setApproveOpen(false)}
      />

      <ConfirmModal
        open={rejectOpen}
        title="Tolak pengajuan Kurator?"
        description={
          remainingAfterReject > 0
            ? `Calon Kurator akan melihat catatan penolakan ini dan masih memiliki ${remainingAfterReject} kesempatan aju banding (atau dapat menghapus akunnya sendiri).`
            : `Ini adalah kesempatan banding terakhir (ke-${maxAppeals}). Setelah ditolak, calon Kurator tidak dapat mengajukan banding lagi dan hanya dapat menghapus akunnya sendiri.`
        }
        infoBox={rejectNote}
        confirmLabel="Ya, tolak pengajuan"
        cancelLabel="Batal"
        variant="danger"
        loading={busy}
        onConfirm={handleReject}
        onClose={() => setRejectOpen(false)}
      />
    </div>
  );
}
