'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateId, getInitials } from '@/lib/shared/format';

export default function AdminUserDetail({
  initialUser,
  currentAdminId,
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [target, setTarget] = useState(initialUser);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSelfOrAdmin =
    target.user_id === currentAdminId || target.role === 'admin';
  const nextStatus = target.status === 'suspended' ? 'active' : 'suspended';
  const isPendingCurator =
    target.role === 'curator' && target.status === 'pending';

  const handleToggleStatus = async () => {
    setBusy(true);
    try {
      const res = await apiFetch(`/api/admin/users/${target.user_id}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      setTarget(res.data.user);
      setStatusModalOpen(false);
      showToast({
        tone: 'success',
        title: 'Status akun diperbarui',
        message:
          nextStatus === 'suspended'
            ? `Akun @${target.username} telah ditangguhkan.`
            : `Akun @${target.username} telah diaktifkan kembali.`,
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteUser = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/users/${target.user_id}`, {
        method: 'DELETE',
      });
      setDeleteModalOpen(false);
      showToast({
        tone: 'info',
        title: 'Akun dihapus',
        message: `Akun @${target.username} telah dihapus permanen.`,
      });
      router.push('/dashboard/admin/users');
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
          href="/dashboard/admin/users"
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Kembali ke daftar pengguna
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Kartu Identitas */}
        <div className="space-y-6 rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-200 text-lg font-bold text-brand-700">
                {target.avatar_url ? (
                  <img
                    src={target.avatar_url}
                    alt={target.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(target.display_name)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-ink">
                  {target.display_name}
                </h2>
                <p className="text-sm text-ink-soft">
                  @{target.username} · {target.email}
                </p>
              </div>
            </div>
            <StatusBadge domain="user" status={target.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-[18px] bg-canvas p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-ink-mute">
                Peran
              </p>
              <p className="mt-0.5 font-semibold text-ink uppercase">
                {target.role}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-mute">
                Terdaftar Sejak
              </p>
              <p className="mt-0.5 text-ink-soft">
                {formatDateId(target.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-mute">
                Riwayat Relasi Data
              </p>
              <p className="mt-0.5 text-ink-soft">
                {target.relation_count} aktivitas tercatat
              </p>
            </div>
          </div>

          {target.bio ? (
            <div>
              <p className="text-xs font-semibold uppercase text-ink-mute">
                Bio Profil
              </p>
              <p className="mt-1 whitespace-pre-line text-base text-ink-soft">
                {target.bio}
              </p>
            </div>
          ) : null}
        </div>

        {/* Panel Tindakan */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-[28px] border border-line bg-surface p-6 shadow-card space-y-4">
            <h3 className="text-xl font-semibold text-ink">Status akun</h3>

            {isSelfOrAdmin ? (
              <Alert tone="info">
                Akun Administrator tidak dapat ditangguhkan atau dihapus melalui halaman ini.
              </Alert>
            ) : isPendingCurator ? (
              <Alert tone="warning" title="Menunggu verifikasi">
                Akun Kurator ini masih berstatus Menunggu. Gunakan halaman{' '}
                <Link
                  href="/dashboard/admin/curators"
                  className="font-semibold underline"
                >
                  Verifikasi Kurator
                </Link>{' '}
                untuk menyetujui atau menolaknya, atau tangguhkan akun bila melanggar.
              </Alert>
            ) : null}

            {!isSelfOrAdmin ? (
              <Button
                variant={nextStatus === 'suspended' ? 'danger' : 'primary'}
                disabled={isPendingCurator && nextStatus === 'active'}
                onClick={() => setStatusModalOpen(true)}
                className="w-full"
              >
                {nextStatus === 'suspended'
                  ? 'Tangguhkan akun'
                  : 'Aktifkan kembali akun'}
              </Button>
            ) : null}
          </div>

          {!isSelfOrAdmin ? (
            <div className="rounded-[28px] border border-[#6E2734] bg-[#38171E]/60 p-6 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#FCA5A5]">
                TINDAKAN PERMANEN
              </p>
              <h3 className="text-base font-semibold text-[#FCA5A5]">
                Hapus akun pengguna
              </h3>
              <p className="text-sm text-[#FECACA]">
                {target.has_relations
                  ? 'Pengguna memiliki riwayat karya, komentar, laporan, atau aktivitas lainnya sehingga tidak dapat dihapus permanen. Gunakan fitur Tangguhkan akun sebagai gantinya (D-11).'
                  : 'Akun ini belum memiliki relasi aktivitas sehingga dapat dihapus permanen.'}
              </p>
              <Button
                variant="crimson"
                size="sm"
                disabled={target.has_relations}
                onClick={() => setDeleteModalOpen(true)}
              >
                Hapus akun permanen
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        open={statusModalOpen}
        title={
          nextStatus === 'suspended'
            ? 'Tangguhkan akun pengguna?'
            : 'Aktifkan kembali akun?'
        }
        description={
          nextStatus === 'suspended'
            ? `Pengguna @${target.username} tidak akan dapat masuk atau mengakses API selama berstatus Ditangguhkan.`
            : `Pengguna @${target.username} akan kembali berstatus Aktif dan dapat masuk ke platform.`
        }
        confirmLabel={
          nextStatus === 'suspended' ? 'Ya, tangguhkan' : 'Ya, aktifkan'
        }
        cancelLabel="Batal"
        variant={nextStatus === 'suspended' ? 'danger' : 'primary'}
        loading={busy}
        onConfirm={handleToggleStatus}
        onClose={() => setStatusModalOpen(false)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="Hapus akun permanen?"
        description={`Akun @${target.username} akan dihapus secara permanen dari sistem.`}
        confirmLabel="Ya, hapus permanen"
        cancelLabel="Batal"
        variant="crimson"
        loading={busy}
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
