'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import ArtworkCard from '@/components/cards/ArtworkCard';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

export default function MemberArtworks({ initialArtworks = [] }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [artworks, setArtworks] = useState(initialArtworks);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleToggleArtworkStatus = async (artwork) => {
    const nextStatus = artwork.status === 'published' ? 'hidden' : 'published';
    setTogglingId(artwork.artwork_id);
    try {
      const res = await apiFetch(`/api/me/artworks/${artwork.artwork_id}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      setArtworks((prev) =>
        prev.map((a) =>
          a.artwork_id === artwork.artwork_id ? res.data.artwork : a
        )
      );
      showToast({
        tone: 'success',
        title: 'Status karya diperbarui',
        message:
          nextStatus === 'published'
            ? `"${artwork.title}" kini tampil di galeri publik.`
            : `"${artwork.title}" disembunyikan dari publik.`,
      });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDeleteArtwork = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/me/artworks/${deleteTarget.artwork_id}`, {
        method: 'DELETE',
      });
      setArtworks((prev) =>
        prev.filter((a) => a.artwork_id !== deleteTarget.artwork_id)
      );
      showToast({
        tone: 'info',
        title: 'Karya dihapus',
        message: `"${deleteTarget.title}" telah dihapus.`,
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert tone="info">
        Hanya karya milikmu berstatus Dipublikasikan yang tampil di galeri publik dan dapat diajukan ke tantangan.
      </Alert>

      {artworks.length === 0 ? (
        <EmptyState
          title="Belum ada karya yang diunggah"
          description="Unggah karya pertamamu sekarang agar bisa tampil di galeri dan mengikuti tantangan."
          actionLabel="Tambah karya →"
          actionHref="/me/artworks/new"
        />
      ) : (
        <div className="space-y-4">
          {artworks.map((art, idx) => (
            <ArtworkCard
              key={art.artwork_id}
              artwork={art}
              index={idx}
              mode="horizontal"
              href={`/me/artworks/${art.artwork_id}`}
              togglingId={togglingId}
              onToggleStatus={handleToggleArtworkStatus}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <div className="rounded-[28px] border border-line bg-surface p-6 shadow-card-sm">
        <h2 className="text-base font-semibold text-ink">
          Tentang status karya
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          <strong>Dipublikasikan</strong> berarti karya dapat dilihat publik, disukai, dikomentari, dan didaftarkan ke tantangan.{' '}
          <strong>Disembunyikan</strong> menyembunyikan karya dari publik serta otomatis menarik submission aktif pada tantangan yang belum diumumkan.
        </p>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus karya ini?"
        description={`"${deleteTarget?.title || ''}" akan dihapus dari karya milikmu. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, hapus karya"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDeleteArtwork}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
