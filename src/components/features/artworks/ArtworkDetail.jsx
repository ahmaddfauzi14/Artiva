'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import PulseHeart from '@/components/effects/PulseHeart';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateId, formatDateTimeId } from '@/lib/shared/format';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam atau promosi berlebihan' },
  { value: 'plagiarism', label: 'Plagiarisme / meniru karya orang lain' },
  { value: 'inappropriate', label: 'Konten tidak pantas' },
  { value: 'copyright', label: 'Pelanggaran hak cipta' },
  { value: 'other', label: 'Alasan lainnya' },
];

export default function ArtworkDetail({
  artwork: initialArtwork,
  initialComments = [],
  initialCommentsMeta = { page: 1, limit: 20, total: 0 },
  viewer = null,
  canInteract = false,
  canReport = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(Boolean(initialArtwork.viewer?.liked));
  const [favorited, setFavorited] = useState(
    Boolean(initialArtwork.viewer?.favorited)
  );
  const [likeCount, setLikeCount] = useState(initialArtwork.like_count || 0);
  const [favoriteCount, setFavoriteCount] = useState(
    initialArtwork.favorite_count || 0
  );
  const [likeBusy, setLikeBusy] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  // Interactive Zoom & Pan Artwork Inspector
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const panStartRef = useRef(null);
  const lightboxRef = useRef(null);

  const [comments, setComments] = useState(initialComments);
  const [commentsMeta, setCommentsMeta] = useState(initialCommentsMeta);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const isOwnArtwork =
    viewer && viewer.user_id === initialArtwork.creator?.user_id;

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) {
      dialog.showModal();
    } else if (!lightboxOpen && dialog.open) {
      dialog.close();
    }
  }, [lightboxOpen]);

  const changeZoom = (nextZoom) => {
    setZoom(nextZoom);
    if (nextZoom === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleImagePointerDown = (e) => {
    if (zoom <= 1) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    panStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
    setPanning(true);
  };

  const handleImagePointerMove = (e) => {
    if (!panning || !panStartRef.current || zoom <= 1) return;
    const maxOffset = (zoom - 1) * 180;
    const nx = Math.max(
      -maxOffset,
      Math.min(maxOffset, e.clientX - panStartRef.current.x)
    );
    const ny = Math.max(
      -maxOffset,
      Math.min(maxOffset, e.clientY - panStartRef.current.y)
    );
    setPan({ x: nx, y: ny });
  };

  const handleImagePointerUp = () => {
    setPanning(false);
    panStartRef.current = null;
  };

  const handleImageKeyDown = (e) => {
    if (zoom <= 1) return;
    const step = 32;
    const maxOffset = (zoom - 1) * 180;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPan((p) => ({ ...p, x: Math.min(maxOffset, p.x + step) }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPan((p) => ({ ...p, x: Math.max(-maxOffset, p.x - step) }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPan((p) => ({ ...p, y: Math.min(maxOffset, p.y + step) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPan((p) => ({ ...p, y: Math.max(-maxOffset, p.y - step) }));
    }
  };

  const toggleLike = async () => {
    if (!canInteract || likeBusy) return;
    setLikeBusy(true);
    try {
      const method = liked ? 'DELETE' : 'PUT';
      const res = await apiFetch(
        `/api/artworks/${initialArtwork.artwork_id}/like`,
        { method }
      );
      setLiked(res.data.liked);
      setLikeCount(res.data.like_count);
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setLikeBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (!canInteract || favBusy) return;
    setFavBusy(true);
    try {
      const method = favorited ? 'DELETE' : 'PUT';
      const res = await apiFetch(
        `/api/artworks/${initialArtwork.artwork_id}/favorite`,
        { method }
      );
      setFavorited(res.data.favorited);
      setFavoriteCount(res.data.favorite_count);
      showToast({
        tone: 'success',
        message: res.data.favorited
          ? 'Karya disimpan ke daftar favoritmu.'
          : 'Karya dihapus dari daftar favorit.',
      });
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setFavBusy(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const res = await apiFetch(
        `/api/artworks/${initialArtwork.artwork_id}/comments`,
        {
          method: 'POST',
          body: { content: commentText.trim() },
        }
      );
      setComments((prev) => [res.data.comment, ...prev]);
      setCommentsMeta((prev) => ({ ...prev, total: (prev.total || 0) + 1 }));
      setCommentText('');
      showToast({ tone: 'success', message: 'Komentar berhasil dikirim.' });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await apiFetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
      setCommentsMeta((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
      }));
      showToast({ tone: 'info', message: 'Komentar berhasil dihapus.' });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleSubmitReport = async () => {
    setReportLoading(true);
    try {
      await apiFetch(`/api/artworks/${initialArtwork.artwork_id}/reports`, {
        method: 'POST',
        body: { reason: reportReason, description: reportDesc.trim() },
      });
      setReportOpen(false);
      setReportDesc('');
      showToast({
        tone: 'success',
        title: 'Laporan terkirim',
        message: 'Terima kasih, laporanmu akan ditinjau oleh Admin.',
      });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Kiri: Bingkai Karya + Inspektur Zoom & Geser Interaktif */}
        <div className="flex flex-col justify-between gap-3 rounded-[24px] border border-line bg-surface p-4 shadow-card lg:col-span-7">
          <div
            tabIndex={zoom > 1 ? 0 : undefined}
            aria-label={
              zoom > 1
                ? 'Area pratinjau karya diperbesar. Seret atau gunakan tombol panah untuk menggeser gambar.'
                : undefined
            }
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={handleImagePointerUp}
            onPointerCancel={handleImagePointerUp}
            onKeyDown={handleImageKeyDown}
            className={`relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-[14px] bg-canvas sm:min-h-[340px] ${
              zoom > 1
                ? panning
                  ? 'cursor-grabbing touch-none'
                  : 'cursor-grab touch-none'
                : ''
            }`}
          >
            <img
              src={initialArtwork.image_url}
              alt={initialArtwork.title}
              draggable={false}
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transition: panning
                  ? 'none'
                  : 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="max-h-[540px] w-full select-none object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {[1, 1.75, 2.5].map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-pressed={zoom === level}
                  onClick={() => changeZoom(level)}
                  className={`tabular-nums min-h-[42px] rounded-full px-3.5 text-xs font-semibold transition-colors ${
                    zoom === level
                      ? 'bg-brand-600 text-white shadow-btn'
                      : 'border border-line bg-canvas text-ink-soft hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {level === 1 ? 'Normal 1x' : `Perbesar ${level}x`}
                </button>
              ))}
              {zoom > 1 ? (
                <button
                  type="button"
                  onClick={() => setPan({ x: 0, y: 0 })}
                  className="min-h-[42px] rounded-full border border-line bg-surface px-3.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Pusatkan posisi
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="min-h-[42px] rounded-full border border-line bg-surface px-4 text-xs font-semibold text-ink hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              Layar penuh
            </button>
          </div>
        </div>

        {/* Kanan: Info Karya + Tombol Apresiasi (mengisi ruang kolom secara seimbang) */}
        <div className="flex flex-col justify-between gap-5 rounded-[24px] border border-line bg-surface p-5 shadow-card sm:p-6 lg:col-span-5">
          <div className="space-y-4">
            <Link
              href={`/creators/${initialArtwork.creator.username}`}
              className="flex items-center justify-between gap-3 rounded-[16px] bg-brand-50/75 p-3 transition-colors hover:bg-brand-100/80"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  name={initialArtwork.creator.display_name}
                  avatarUrl={initialArtwork.creator.avatar_url}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-ink">
                    {initialArtwork.creator.display_name}
                  </p>
                  <p className="truncate text-sm text-ink-soft">
                    @{initialArtwork.creator.username}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-brand-700">
                Kontak
              </span>
            </Link>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/artworks?category=${initialArtwork.category.slug}`}
                  className="rounded-full bg-tint-lavender px-3 py-1 text-xs font-semibold text-brand-700"
                >
                  {initialArtwork.category.name}
                </Link>
                <span className="text-xs text-ink-mute sm:text-sm">
                  Dipublikasikan {formatDateId(initialArtwork.created_at)}
                </span>
              </div>
              <h1 className="text-[1.625rem] font-semibold leading-tight text-ink sm:text-[1.875rem]">
                {initialArtwork.title}
              </h1>
            </div>

            {initialArtwork.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft sm:text-base">
                {initialArtwork.description}
              </p>
            ) : (
              <p className="text-sm italic text-ink-mute">
                Kreator tidak menambahkan deskripsi tambahan.
              </p>
            )}
          </div>

          {/* Aksi Apresiasi (Suka, Favorit, Laporkan) */}
          <div className="border-t border-line pt-4">
            {canInteract ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <PulseHeart
                    liked={liked}
                    count={likeCount}
                    onChange={toggleLike}
                    icon="heart"
                    size={26}
                    corner={999}
                    likedColor="#ff4d6d"
                    idleColor="#8FA4C7"
                    pillColor="#162950"
                    textColor="#F7F3E6"
                    idleText="Suka"
                    likedText="Suka"
                    label={liked ? 'Batal sukai karya' : 'Sukai karya'}
                  />
                  <PulseHeart
                    liked={favorited}
                    count={favoriteCount}
                    onChange={toggleFavorite}
                    icon="bookmark"
                    size={26}
                    corner={999}
                    likedColor="#F2C94C"
                    idleColor="#8FA4C7"
                    pillColor="#162950"
                    textColor="#F7F3E6"
                    idleText="Favorit"
                    likedText="Favorit"
                    label={favorited ? 'Hapus dari simpanan' : 'Simpan karya'}
                  />
                </div>
                {canReport && !isOwnArtwork ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReportOpen(true)}
                    className="text-[#FCA5A5]"
                  >
                    Laporkan karya
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="tabular-nums text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{likeCount}</span> suka ·{' '}
                  <span className="font-semibold text-ink">{favoriteCount}</span> favorit ·{' '}
                  <span className="font-semibold text-ink">
                    {commentsMeta.total || comments.length}
                  </span>{' '}
                  komentar
                </p>
                {!viewer ? (
                  <Alert tone="info">
                    <span>
                      Ingin menyukai, menyimpan favorit, atau memberi komentar?{' '}
                      <Link
                        href={`/login?next=${encodeURIComponent(pathname || `/artworks/${initialArtwork.artwork_id}`)}`}
                        className="font-semibold underline"
                      >
                        Masuk sebagai Member →
                      </Link>
                    </span>
                  </Alert>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bawah: Percakapan di Balik Karya */}
      <section className="space-y-4 rounded-[24px] border border-line bg-surface p-5 shadow-card sm:p-6">
        <h2 className="tabular-nums text-xl font-semibold text-ink">
          Percakapan di balik karya ({commentsMeta.total || comments.length})
        </h2>

        {canInteract ? (
          <form onSubmit={handleAddComment} className="space-y-3">
            <FormField
              label="Tulis komentar"
              name="comment_content"
              as="textarea"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Bagikan apresiasi atau masukan yang membangun..."
              helperText="Maksimal 1000 karakter."
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={commentLoading}
              disabled={!commentText.trim()}
            >
              Kirim komentar
            </Button>
          </form>
        ) : null}

        {comments.length === 0 ? (
          <p className="rounded-[16px] bg-brand-50/75 p-4 text-sm text-ink-soft">
            Belum ada komentar pada karya ini.
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.comment_id}
                className="rounded-[16px] border border-line bg-canvas p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/creators/${c.author.username}`}
                      className="text-sm font-semibold text-ink hover:text-brand-700"
                    >
                      {c.author.display_name}
                    </Link>
                    <span className="ml-2 text-xs text-ink-mute">
                      {formatDateTimeId(c.created_at)}
                    </span>
                  </div>
                  {viewer && viewer.user_id === c.author.user_id ? (
                    <button
                      type="button"
                      disabled={deletingCommentId === c.comment_id}
                      onClick={() => handleDeleteComment(c.comment_id)}
                      className="text-xs font-semibold text-[#FCA5A5] hover:underline disabled:opacity-50"
                    >
                      {deletingCommentId === c.comment_id ? 'Menghapus…' : 'Hapus'}
                    </button>
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {c.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal Layar Penuh */}
      <dialog
        ref={lightboxRef}
        aria-label={`Tampilan penuh ${initialArtwork.title}`}
        onCancel={(e) => {
          e.preventDefault();
          setLightboxOpen(false);
        }}
        onClick={(e) => {
          if (e.target === lightboxRef.current) setLightboxOpen(false);
        }}
        className="m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-5xl bg-transparent p-0 text-white backdrop:bg-brand-900/85"
      >
        <div className="mb-3 flex w-full items-center justify-between gap-4 text-white">
          <p className="truncate text-base font-semibold">
            {initialArtwork.title}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLightboxOpen(false)}
          >
            Tutup
          </Button>
        </div>
        <div className="modal-in max-h-[82vh] overflow-hidden rounded-[28px] bg-surface p-3 shadow-modal">
          <img
            src={initialArtwork.image_url}
            alt={initialArtwork.title}
            className="mx-auto max-h-[76vh] w-auto rounded-[14px] object-contain"
          />
        </div>
      </dialog>

      {/* Modal Laporkan Karya */}
      <ConfirmModal
        open={reportOpen}
        title="Laporkan karya"
        description="Bantu kami menjaga ruang kreatif tetap aman dan menghormati hak cipta."
        infoBox="Laporan tidak langsung menyatakan karya melanggar. Tim Admin akan meninjau laporanmu terlebih dahulu."
        confirmLabel="Kirim laporan"
        cancelLabel="Batal"
        loading={reportLoading}
        onConfirm={handleSubmitReport}
        onClose={() => setReportOpen(false)}
      >
        <div className="space-y-4">
          <FormField
            label="Alasan pelaporan"
            name="report_reason"
            as="select"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            required
          >
            {REPORT_REASONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </FormField>

          <FormField
            label="Keterangan tambahan (opsional)"
            name="report_description"
            as="textarea"
            rows={3}
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            placeholder="Jelaskan detail atau tautan referensi bila perlu..."
          />
        </div>
      </ConfirmModal>
    </div>
  );
}
