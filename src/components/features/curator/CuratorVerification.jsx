'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateTimeId } from '@/lib/shared/format';

export default function CuratorVerification({ verification: initialVerification }) {
  const router = useRouter();
  const { showToast } = useToast();
  const historyListId = useId();
  const [verification, setVerification] = useState(initialVerification);
  const [checking, setChecking] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [appealOpen, setAppealOpen] = useState(false);
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [appealError, setAppealError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [appealForm, setAppealForm] = useState({
    display_name: initialVerification?.display_name || '',
    bio: initialVerification?.bio || '',
    website: initialVerification?.website || '',
    appeal_note: '',
  });

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await apiFetch('/api/curator/verification');
      const nextVer = res.data?.verification;
      if (nextVer) {
        setVerification(nextVer);
        if (nextVer.status === 'approved') {
          showToast({
            tone: 'success',
            title: 'Pengajuan disetujui!',
            message: 'Akun Kuratormu sudah aktif. Mengarahkan ke beranda ARTIVA...',
          });
          router.push('/');
          router.refresh();
          return;
        }
        showToast({
          tone: 'info',
          title: 'Status diperiksa',
          message:
            nextVer.status === 'rejected'
              ? 'Pengajuan Kurator belum disetujui. Periksa catatan dari Admin.'
              : 'Pengajuan masih dalam antrean peninjauan Admin.',
        });
      }
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setChecking(false);
    }
  };

  const handleOpenAppeal = () => {
    setAppealForm({
      display_name: verification?.display_name || '',
      bio: verification?.bio || '',
      website: verification?.website || '',
      appeal_note: '',
    });
    setAppealError('');
    setFieldErrors({});
    setAppealOpen(true);
  };

  const handleAppealChange = (field) => (e) => {
    const val = e.target.value;
    setAppealForm((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    setAppealError('');

    const nextFieldErrors = {};
    const displayName = appealForm.display_name.trim();
    const bio = appealForm.bio.trim();
    const website = appealForm.website.trim();
    const appealNote = appealForm.appeal_note.trim();

    if (displayName.length < 2) {
      nextFieldErrors.display_name = 'Nama tampilan minimal 2 karakter.';
    }
    if (bio.length < 10) {
      nextFieldErrors.bio =
        'Bio minimal 10 karakter agar Admin dapat meninjau pengajuanmu.';
    }
    if (website && !/^https?:\/\/.+/i.test(website)) {
      nextFieldErrors.website =
        'Tautan situs harus diawali http:// atau https://.';
    }
    if (appealNote.length < 10) {
      nextFieldErrors.appeal_note =
        'Catatan banding minimal 10 karakter agar Admin memahami perbaikan yang kamu lakukan.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setAppealError('Periksa kembali data banding yang kamu masukkan.');
      return;
    }

    setFieldErrors({});
    setSubmittingAppeal(true);
    try {
      const res = await apiFetch('/api/curator/verification', {
        method: 'POST',
        body: {
          display_name: displayName,
          bio,
          website,
          appeal_note: appealNote,
        },
      });
      if (res.data?.verification) {
        setVerification(res.data.verification);
      }
      setAppealOpen(false);
      showToast({
        tone: 'success',
        title: 'Pengajuan banding terkirim',
        message: 'Bandingmu telah masuk ke antrean peninjauan Admin.',
      });
      router.refresh();
    } catch (err) {
      setAppealError(err.message);
      if (err.fields) setFieldErrors(err.fields);
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiFetch('/api/curator/account', { method: 'DELETE' });
      setDeleteOpen(false);
      setDeleted(true);
      showToast({
        tone: 'info',
        title: 'Akun dihapus',
        message: 'Akun Kurator telah dihapus dan sesi berakhir.',
      });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  if (deleted) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-line bg-surface p-8 shadow-card space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
          AKUN DIHAPUS
        </p>
        <h1 className="text-3xl font-semibold text-ink">
          Setiap akhir, ruang untuk awal baru.
        </h1>
        <Alert tone="neutral">
          Akun Kurator telah dihapus dan sesi berakhir. Jika suatu saat kamu ingin mengajukan kembali sebagai Kurator, kamu dapat mendaftar ulang dengan data terbaru.
        </Alert>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" href="/">
            Kembali ke Beranda
          </Button>
          <Button variant="secondary" href="/register/curator">
            Daftar ulang sebagai Kurator
          </Button>
        </div>
      </div>
    );
  }

  const status = verification?.status || 'pending';
  const maxAppeals = verification?.max_appeals ?? 3;
  const appealCount = verification?.appeal_count ?? 0;
  const appealNumber = verification?.appeal_number ?? 0;
  const remainingAppeals =
    verification?.remaining_appeals ?? Math.max(0, maxAppeals - appealCount);
  const canAppeal = Boolean(
    verification?.can_appeal ?? (status === 'rejected' && remainingAppeals > 0)
  );
  const history = Array.isArray(verification?.history) ? verification.history : [];
  const safeWebsite =
    verification?.website && /^https?:\/\//i.test(verification.website)
      ? verification.website
      : null;

  return (
    <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
      {/* Panel Kiri */}
      <div className="edge-glow rounded-[28px] bg-grad-hero p-6 shadow-glass space-y-5 sm:p-8 lg:sticky lg:top-24 lg:col-span-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            VERIFIKASI KURATOR
          </p>
          <h1 className="text-[1.75rem] font-semibold leading-tight text-ink sm:text-[2rem]">
            Verifikasi membantu membangun ruang yang aman.
          </h1>
          <p className="text-base text-ink-soft">
            Setiap penyelenggara tantangan ditinjau oleh Admin untuk memastikan kompetisi berjalan kredibel, adil, dan terstruktur bagi seluruh kreator.
          </p>
        </div>

        <ol className="space-y-2.5 border-t border-line/80 pt-4 text-sm text-ink-soft">
          <li className="flex items-center gap-2.5">
            <span className="tabular-nums inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-brand-700">
              01
            </span>
            <span>Peninjauan profil &amp; latar belakang kurasi</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="tabular-nums inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-brand-700">
              02
            </span>
            <span>Perbaikan melalui aju banding (maks. {maxAppeals} kali) bila ditolak</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="tabular-nums inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-brand-700">
              03
            </span>
            <span>Persetujuan &amp; aktivasi ruang Kurator</span>
          </li>
        </ol>
      </div>

      {/* Kartu Status Kanan */}
      <div className="rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 space-y-6 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-mute">
              STATUS PENGAJUAN
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              {status === 'approved'
                ? 'Pengajuan Kurator disetujui!'
                : status === 'rejected'
                  ? 'Pengajuan belum disetujui.'
                  : appealNumber > 0
                    ? `Banding ke-${appealNumber} sedang ditinjau.`
                    : 'Pengajuan sedang ditinjau.'}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {appealNumber > 0 ? (
              <StatusBadge tone="info" label={`Banding ke-${appealNumber}`} />
            ) : null}
            <StatusBadge domain="verification" status={status} />
          </div>
        </div>

        {status === 'pending' ? (
          <Alert
            tone="info"
            title={
              appealNumber > 0
                ? `Menunggu keputusan Admin (Banding ke-${appealNumber})`
                : 'Menunggu keputusan Admin'
            }
          >
            {appealNumber > 0
              ? 'Terima kasih telah memperbarui profil dan mengirimkan catatan banding. Tim Admin akan meninjau kembali pengajuanmu.'
              : 'Terima kasih telah mengajukan diri sebagai Kurator. Tim Admin akan meninjau profil dan latar belakang organisasimu sebelum mengaktifkan fitur manajemen tantangan.'}
          </Alert>
        ) : status === 'rejected' ? (
          <div className="space-y-3">
            <Alert tone="danger" title="Catatan peninjauan dari Admin">
              {verification?.note || 'Pengajuan belum memenuhi kriteria kurator saat ini.'}
            </Alert>

            {canAppeal ? (
              <Alert tone="info" title="Kesempatan aju banding tersedia">
                Kamu masih memiliki{' '}
                <strong className="tabular-nums">
                  {remainingAppeals} dari {maxAppeals}
                </strong>{' '}
                kesempatan aju banding. Perbarui data profil atau tautan portofolio sesuai catatan Admin, lalu kirim pengajuan banding.
              </Alert>
            ) : (
              <Alert tone="warning" title="Batas aju banding telah tercapai">
                Kamu telah menggunakan seluruh{' '}
                <strong className="tabular-nums">{maxAppeals}</strong> kesempatan aju banding. Keputusan penolakan saat ini bersifat final; kamu dapat menghapus akun ini bila ingin mendaftar ulang di kemudian hari.
              </Alert>
            )}
          </div>
        ) : (
          <Alert tone="success" title="Akun Kurator aktif">
            Akunmu sudah aktif. Kamu dapat membuat tantangan baru, melihat karya peserta, dan menetapkan pemenang.
          </Alert>
        )}

        {/* Form Aju Banding */}
        {status === 'rejected' && canAppeal && appealOpen ? (
          <form
            onSubmit={handleSubmitAppeal}
            noValidate
            className="space-y-4 rounded-[22px] border border-[#264E91] bg-canvas p-5"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9BC4FF]">
                FORMULIR AJU BANDING ({appealCount + 1} DARI {maxAppeals})
              </p>
              <h3 className="text-lg font-semibold text-ink">
                Perbaiki profil &amp; kirim banding ke-{appealCount + 1}
              </h3>
              <p className="text-sm text-ink-soft">
                Sesuaikan informasi di bawah ini dengan catatan penolakan Admin agar pengajuan ulangmu lebih mudah diverifikasi.
              </p>
            </div>

            {appealError ? (
              <Alert tone="danger" title="Gagal mengirim banding">
                {appealError}
              </Alert>
            ) : null}

            <FormField
              label="Nama Kurator / Organisasi"
              name="display_name"
              value={appealForm.display_name}
              onChange={handleAppealChange('display_name')}
              placeholder="Nama studio, komunitas, atau organisasi"
              error={fieldErrors.display_name}
              required
            />

            <FormField
              label="Profil singkat & latar belakang kurasi"
              name="bio"
              as="textarea"
              rows={4}
              value={appealForm.bio}
              onChange={handleAppealChange('bio')}
              placeholder="Ceritakan pengalaman pameran, spesialisasi kurasi, atau komunitas kreatifmu..."
              helperText="Minimal 10 karakter; akan memperbarui profil Kuratormu."
              error={fieldErrors.bio}
              required
            />

            <FormField
              label="Situs web / portofolio (opsional)"
              name="website"
              type="url"
              value={appealForm.website}
              onChange={handleAppealChange('website')}
              placeholder="https://example.com"
              helperText="Gunakan tautan yang diawali http:// atau https:// agar dapat diverifikasi Admin."
              error={fieldErrors.website}
            />

            <FormField
              label="Catatan banding & perbaikan yang dilakukan"
              name="appeal_note"
              as="textarea"
              rows={3}
              value={appealForm.appeal_note}
              onChange={handleAppealChange('appeal_note')}
              placeholder="Jelaskan pembaruan yang kamu lakukan menanggapi catatan penolakan Admin..."
              helperText="Minimal 10 karakter; dibaca khusus oleh Admin saat meninjau ulang pengajuan."
              error={fieldErrors.appeal_note}
              required
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="submit"
                variant="primary"
                loading={submittingAppeal}
              >
                Kirim banding ke-{appealCount + 1}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={submittingAppeal}
                onClick={() => setAppealOpen(false)}
              >
                Batal
              </Button>
            </div>
          </form>
        ) : null}

        {/* Ringkasan Profil Pengajuan */}
        {verification ? (
          <div className="space-y-3 rounded-[18px] border border-line bg-canvas p-5 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-ink-mute">
                  Nama Kurator / Organisasi
                </p>
                <p className="mt-0.5 font-semibold text-ink">
                  {verification.display_name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink-mute">
                  Username
                </p>
                <p className="mt-0.5 font-semibold text-ink">
                  @{verification.username}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink-mute">
                  Waktu Pengajuan Terakhir
                </p>
                <p className="mt-0.5 text-ink-soft">
                  {formatDateTimeId(verification.submitted_at)}
                </p>
              </div>
              {verification.reviewed_at ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-ink-mute">
                    Waktu Peninjauan
                  </p>
                  <p className="mt-0.5 text-ink-soft">
                    {formatDateTimeId(verification.reviewed_at)}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase text-ink-mute">
                  Kuota Aju Banding
                </p>
                <p className="mt-0.5 tabular-nums text-ink-soft">
                  {appealCount} / {maxAppeals} digunakan (sisa {remainingAppeals})
                </p>
              </div>
              {safeWebsite ? (
                <div>
                  <p className="text-xs font-semibold uppercase text-ink-mute">
                    Situs Web / Portofolio
                  </p>
                  <a
                    href={safeWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block break-all font-semibold text-brand-700 hover:underline"
                  >
                    {safeWebsite}
                  </a>
                </div>
              ) : null}
            </div>

            {verification.bio ? (
              <div className="border-t border-line pt-3">
                <p className="text-xs font-semibold uppercase text-ink-mute">
                  Profil Singkat
                </p>
                <p className="mt-1 whitespace-pre-line text-ink-soft">
                  {verification.bio}
                </p>
              </div>
            ) : null}

            {verification.appeal_note ? (
              <div className="border-t border-line pt-3">
                <p className="text-xs font-semibold uppercase text-[#9BC4FF]">
                  Catatan Banding Terkirim
                </p>
                <p className="mt-1 whitespace-pre-line text-ink-soft">
                  {verification.appeal_note}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {status === 'approved' ? (
            <Button variant="primary" href="/curator/challenges">
              Kelola tantangan →
            </Button>
          ) : status === 'pending' ? (
            <Button
              variant="primary"
              loading={checking}
              onClick={handleCheckStatus}
            >
              Periksa status
            </Button>
          ) : null}

          {status === 'rejected' && canAppeal && !appealOpen ? (
            <Button variant="primary" onClick={handleOpenAppeal}>
              Ajukan banding ({remainingAppeals} sisa)
            </Button>
          ) : null}

          {status === 'rejected' ? (
            <Button
              variant="danger"
              onClick={() => setDeleteOpen(true)}
            >
              Hapus akun
            </Button>
          ) : null}

          <Button
            variant="secondary"
            loading={loggingOut}
            onClick={handleLogout}
          >
            Keluar akun
          </Button>
        </div>

        {/* Riwayat Pengajuan */}
        {history.length > 1 ? (
          <div className="space-y-3 border-t border-line pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-ink-mute">
                Riwayat Pengajuan ({history.length})
              </h3>
              <button
                type="button"
                aria-expanded={showHistory}
                aria-controls={historyListId}
                onClick={() => setShowHistory((prev) => !prev)}
                className="inline-flex min-h-[44px] -my-2 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50/50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
              >
                <span>{showHistory ? 'Sembunyikan' : 'Lihat semua'}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-4 w-4 motion-safe:transition-transform ${
                    showHistory ? 'rotate-180' : ''
                  }`}
                >
                  <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {showHistory ? (
              <ol id={historyListId} className="space-y-3">
                {history.map((item) => (
                  <li
                    key={item.verification_id}
                    className="rounded-[16px] border border-line bg-canvas p-4 text-sm space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">
                          {item.is_appeal
                            ? `Banding ke-${item.appeal_number}`
                            : 'Pengajuan awal'}
                        </span>
                        <span className="text-xs text-ink-mute">
                          {formatDateTimeId(item.submitted_at)}
                        </span>
                      </div>
                      <StatusBadge domain="verification" status={item.status} />
                    </div>

                    {item.appeal_note ? (
                      <p className="text-ink-soft">
                        <span className="font-semibold text-ink">Catatan banding:</span>{' '}
                        {item.appeal_note}
                      </p>
                    ) : null}

                    {item.note ? (
                      <p className="text-ink-soft">
                        <span className="font-semibold text-ink">Catatan Admin:</span>{' '}
                        {item.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : null}
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Hapus akun Kurator?"
        description="Akun Kurator beserta seluruh riwayat pengajuan verifikasi akan dihapus permanen. Setelah itu kamu dapat mendaftar ulang bila ingin mengajukan kembali."
        confirmLabel="Ya, hapus akun"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
