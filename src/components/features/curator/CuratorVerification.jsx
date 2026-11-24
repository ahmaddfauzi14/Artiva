'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateTimeId } from '@/lib/shared/format';

export default function CuratorVerification({ verification: initialVerification }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [verification, setVerification] = useState(initialVerification);
  const [checking, setChecking] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
            message: 'Akun Kuratormu sudah aktif. Mengarahkan ke Dashboard Kurator...',
          });
          router.push('/dashboard/curator');
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
            Kembali ke Beranda →
          </Button>
          <Button variant="secondary" href="/register/curator">
            Daftar ulang sebagai Kurator →
          </Button>
        </div>
      </div>
    );
  }

  const status = verification?.status || 'pending';

  return (
    <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
      {/* Panel Kiri */}
      <div className="edge-glow rounded-[28px] bg-grad-hero p-6 shadow-glass space-y-5 sm:p-8 lg:sticky lg:top-24 lg:col-span-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
            VERIFIKASI KURATOR
          </p>
          <h1 className="text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">
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
            <span>Persetujuan &amp; aktivasi ruang Kurator</span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="tabular-nums inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-brand-700">
              03
            </span>
            <span>Buat tantangan &amp; umumkan pemenang</span>
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
                  : 'Pengajuan sedang ditinjau.'}
            </h2>
          </div>
          <StatusBadge domain="verification" status={status} />
        </div>

        {status === 'pending' ? (
          <Alert tone="info" title="Menunggu keputusan Admin">
            Terima kasih telah mengajukan diri sebagai Kurator. Tim Admin akan meninjau profil dan latar belakang organisasimu sebelum mengaktifkan fitur manajemen tantangan.
          </Alert>
        ) : status === 'rejected' ? (
          <Alert tone="danger" title="Catatan peninjauan dari Admin">
            {verification.note || 'Pengajuan belum memenuhi kriteria kurator saat ini.'}
          </Alert>
        ) : (
          <Alert tone="success" title="Akun Kurator aktif">
            Akunmu sudah aktif. Kamu dapat membuat tantangan baru, melihat karya peserta, dan menetapkan pemenang.
          </Alert>
        )}

        {/* Ringkasan Profil Pengajuan */}
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
                Waktu Pengajuan
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
          </div>

          {verification.bio ? (
            <div className="pt-2 border-t border-line">
              <p className="text-xs font-semibold uppercase text-ink-mute">
                Profil Singkat
              </p>
              <p className="mt-1 whitespace-pre-line text-ink-soft">
                {verification.bio}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {status === 'approved' ? (
            <Button variant="primary" href="/dashboard/curator">
              Buka Dashboard Kurator →
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
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Hapus akun Kurator?"
        description="Akun Kurator beserta data pengajuan verifikasi akan dihapus permanen. Setelah itu kamu dapat mendaftar ulang bila ingin mengajukan kembali."
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
