'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Award01Icon,
  FavouriteIcon,
  Image02Icon,
  SentIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import Alert from '@/components/ui/Alert';
import ArtworkCard from '@/components/cards/ArtworkCard';
import Button from '@/components/ui/Button';
import ChipRow from '@/components/ui/Chip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import GlassPanel from '@/components/ui/GlassPanel';
import MagicBento from '@/components/effects/MagicBento';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { formatDateRangeId, formatDateTimeId } from '@/lib/shared/format';

const TABS = [
  { label: 'Ringkasan', value: 'overview' },
  { label: 'Karya saya', value: 'artworks' },
  { label: 'Submission saya', value: 'submissions' },
  { label: 'Favorit', value: 'favorites' },
];

export default function MemberDashboard({
  user,
  initialTab = 'overview',
  initialArtworks = [],
  initialFavorites = [],
  initialSubmissions = [],
  communityArtworks = [],
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const validTab = ['overview', 'artworks', 'submissions', 'favorites'].includes(
    initialTab
  )
    ? initialTab
    : 'overview';

  const [tab, setTab] = useState(validTab);
  const [artworks, setArtworks] = useState(initialArtworks);
  const [favorites] = useState(initialFavorites);
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const switchTab = (nextTab) => {
    setTab(nextTab);
    const url =
      nextTab === 'overview'
        ? '/dashboard/member'
        : `/dashboard/member?tab=${nextTab}`;
    router.replace(url, { scroll: false });
  };

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

  const handleConfirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      const res = await apiFetch(
        `/api/submissions/${withdrawTarget.submission_id}/withdraw`,
        { method: 'POST' }
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          s.submission_id === withdrawTarget.submission_id
            ? {
                ...s,
                status: res.data.submission.status,
                withdrawn_at: res.data.submission.withdrawn_at,
              }
            : s
        )
      );
      showToast({
        tone: 'info',
        title: 'Submission ditarik',
        message: `Submission "${withdrawTarget.artwork.title}" berhasil ditarik.`,
      });
      setWithdrawTarget(null);
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setWithdrawing(false);
    }
  };

  const bannerPreview = artworks[0] || communityArtworks[0] || null;
  const publishedCount = artworks.filter((a) => a.status === 'published').length;
  const hiddenCount = artworks.filter((a) => a.status === 'hidden').length;
  const activeSubmissionsCount = submissions.filter(
    (s) => s.status === 'submitted'
  ).length;

  const bentoItems = [
    {
      id: 'member-artworks',
      label: 'Portofolio',
      title: 'Karya saya',
      description: `${artworks.length} karya tersimpan (${publishedCount} dipublikasikan, ${hiddenCount} disembunyikan).`,
      icon: <HugeiconsIcon icon={Image02Icon} size={16} strokeWidth={1.8} />,
      colSpan: 2,
      rowSpan: 2,
      onClick: () => switchTab('artworks'),
      visual: (
        <div className="flex h-full flex-col justify-between gap-3 rounded-[14px] border border-[#233B69] bg-[#0B1730]/70 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="tabular-nums text-3xl font-semibold text-ink">
              {artworks.length}
            </span>
            <span className="text-xs font-semibold text-brand-700">
              {publishedCount} publik · {hiddenCount} tersembunyi
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#162950]">
              <div
                className="h-full rounded-full bg-[#F2C94C] transition-all duration-300"
                style={{
                  width: `${artworks.length ? Math.round((publishedCount / artworks.length) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-ink-soft">
              Klik untuk mengelola status publikasi atau memperbarui karya.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'member-submissions',
      label: 'Kompetisi',
      title: 'Submission saya',
      description: `${submissions.length} riwayat keikutsertaan (${activeSubmissionsCount} aktif).`,
      icon: <HugeiconsIcon icon={SentIcon} size={16} strokeWidth={1.8} />,
      colSpan: 2,
      onClick: () => switchTab('submissions'),
      visual: 'collaboration',
    },
    {
      id: 'member-challenges',
      label: 'Eksplorasi',
      title: 'Cari tantangan',
      description: 'Ikut kompetisi kurasi tanpa unggah ulang file.',
      icon: <HugeiconsIcon icon={Award01Icon} size={16} strokeWidth={1.8} />,
      href: '/challenges',
      visual: (
        <div className="flex items-center justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3 py-2">
          <span className="text-xs font-semibold text-brand-700">Terbuka</span>
          <span className="text-xs text-ink-soft">1 klik kirim →</span>
        </div>
      ),
    },
    {
      id: 'member-favorites',
      label: 'Inspirasi',
      title: 'Koleksi favorit',
      description: `${favorites.length} karya tersimpan sebagai referensi.`,
      icon: <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.8} />,
      onClick: () => switchTab('favorites'),
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3 py-2">
          <span className="tabular-nums text-2xl font-semibold text-brand-700">
            {favorites.length}
          </span>
          <span className="text-xs text-ink-soft">tersimpan</span>
        </div>
      ),
    },
    {
      id: 'member-new-artwork',
      label: 'Aksi cepat',
      title: 'Tambah karya baru',
      description: 'Unggah karya terbarumu sekali saja ke galeri ARTIVA.',
      icon: <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/member/artworks/new',
      colSpan: 2,
      visual: (
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <span className="rounded-full bg-[#162950] px-2.5 py-1 text-brand-700">
              JPEG / PNG / WEBP
            </span>
            <span className="text-ink-soft">Maks. 5 MB</span>
          </div>
          <span className="text-xs font-semibold text-brand-700">Unggah →</span>
        </div>
      ),
    },
    {
      id: 'member-profile',
      label: 'Identitas',
      title: user.display_name || user.username,
      description: 'Kelola bio kreator, foto profil, dan informasi akun.',
      icon: <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/member/profile',
      colSpan: 2,
      visual: 'security',
    },
  ];

  return (
    <div className="space-y-8">
      <GlassPanel
        eyebrow="RUANG MEMBER"
        title={`Selamat datang, ${user.display_name || user.username}.`}
        subtitle="Kelola karya portofoliomu, pantau partisipasi tantangan, dan simpan inspirasi dari sesama kreator."
        previewArtwork={bannerPreview}
        actions={
          <>
            <Button variant="primary" href="/dashboard/member/artworks/new">
              Tambah karya →
            </Button>
            <Button variant="secondary" href="/challenges">
              Cari tantangan →
            </Button>
          </>
        }
      />

      {/* Navigasi Bagian */}
      <ChipRow
        items={TABS.map((t) => ({
          ...t,
          count:
            t.value === 'artworks'
              ? artworks.length
              : t.value === 'submissions'
                ? submissions.length
                : t.value === 'favorites'
                  ? favorites.length
                  : undefined,
        }))}
        activeValue={tab}
        onSelect={switchTab}
      />

      {/* Tab Ringkasan */}
      {tab === 'overview' ? (
        <div className="space-y-12">
          <MagicBento
            items={bentoItems}
            columns={4}
            rowHeight={190}
            gap={14}
            radius={22}
            theme="dark"
            glowColor="#F2C94C"
            enableBorderGlow
            enableSpotlight
            spotlightRadius={320}
            enableStars
            clickEffect
          />

          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  GALERI TERBARU
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-ink">
                  Inspirasi dari komunitas
                </h2>
              </div>
              <Link
                href="/artworks"
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                Jelajahi semua →
              </Link>
            </div>

            {communityArtworks.length === 0 ? (
              <EmptyState
                title="Belum ada karya komunitas"
                description="Jadilah kreator pertama yang mempublikasikan karya hari ini."
                actionLabel="Tambah karya →"
                actionHref="/dashboard/member/artworks/new"
              />
            ) : (
              <div
                className={`auto-grid-cards gap-6 ${
                  communityArtworks.length === 1 ? 'max-w-sm' : ''
                }`}
              >
                {communityArtworks.map((art, idx) => (
                  <ArtworkCard key={art.artwork_id} artwork={art} index={idx} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* Tab Karya Saya (Kartu Horizontal Pastel per DESIGN §7.2 & §8.2) */}
      {tab === 'artworks' ? (
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Karya saya</h2>
              <p className="text-base text-ink-soft">
                Kelola karya, dari sketsa pertama sampai siap dipublikasikan.
              </p>
            </div>
            <Button variant="primary" href="/dashboard/member/artworks/new">
              Tambah karya →
            </Button>
          </div>

          <Alert tone="info">
            Hanya karya milikmu berstatus Dipublikasikan yang tampil di galeri publik dan dapat diajukan ke tantangan.
          </Alert>

          {artworks.length === 0 ? (
            <EmptyState
              title="Belum ada karya yang diunggah"
              description="Unggah karya pertamamu sekarang agar bisa tampil di galeri dan mengikuti tantangan."
              actionLabel="Tambah karya →"
              actionHref="/dashboard/member/artworks/new"
            />
          ) : (
            <div className="space-y-4">
              {artworks.map((art, idx) => (
                <ArtworkCard
                  key={art.artwork_id}
                  artwork={art}
                  index={idx}
                  mode="horizontal"
                  togglingId={togglingId}
                  onToggleStatus={handleToggleArtworkStatus}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          <div className="rounded-[28px] border border-line bg-surface p-6 shadow-card-sm">
            <h3 className="text-base font-semibold text-ink">
              Tentang status karya
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              <strong>Dipublikasikan</strong> berarti karya dapat dilihat publik, disukai, dikomentari, dan didaftarkan ke tantangan.{' '}
              <strong>Disembunyikan</strong> menyembunyikan karya dari publik serta otomatis menarik submission aktif pada tantangan yang belum diumumkan.
            </p>
          </div>
        </section>
      ) : null}

      {/* Tab Favorit */}
      {tab === 'favorites' ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Karya favorit</h2>
            <p className="text-base text-ink-soft">
              Kumpulan karya komunitas yang kamu tandai sebagai favorit.
            </p>
          </div>

          {favorites.length === 0 ? (
            <EmptyState
              title="Simpan yang menginspirasimu."
              description="Belum ada karya favorit tersimpan. Jelajahi galeri dan tandai karya yang paling berkesan."
              actionLabel="Jelajahi karya →"
              actionHref="/artworks"
            />
          ) : (
            <div
              className={`auto-grid-cards gap-6 ${
                favorites.length === 1 ? 'max-w-sm' : ''
              }`}
            >
              {favorites.map((art, idx) => (
                <ArtworkCard key={art.artwork_id} artwork={art} index={idx} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Tab Submission Saya */}
      {tab === 'submissions' ? (
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-ink">
                Submission saya
              </h2>
              <p className="text-base text-ink-soft">
                Pantau seluruh karya yang telah kamu ajukan ke tantangan.
              </p>
            </div>
            <Button variant="secondary" href="/challenges">
              Lihat tantangan terbuka →
            </Button>
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              title="Saatnya mencoba tantangan pertamamu."
              description="Kamu belum mengirimkan karya ke tantangan mana pun. Pilih tantangan terbuka dan kirim karyamu."
              actionLabel="Jelajahi tantangan →"
              actionHref="/challenges"
            />
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => {
                const canWithdraw =
                  sub.status === 'submitted' && sub.challenge.status === 'open';
                return (
                  <article
                    key={sub.submission_id}
                    className="flex flex-col justify-between gap-4 rounded-[28px] border border-line bg-surface p-5 shadow-card-sm transition-transform duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-brand-50">
                        {sub.artwork.image_url ? (
                          <img
                            src={sub.artwork.image_url}
                            alt={sub.artwork.title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge domain="submission" status={sub.status} />
                          <StatusBadge
                            domain="challenge"
                            status={sub.challenge.status}
                          />
                        </div>
                        <h3 className="truncate text-lg font-semibold text-ink">
                          {sub.artwork.title}
                        </h3>
                        <p className="text-sm text-ink-soft">
                          Tantangan:{' '}
                          <Link
                            href={`/challenges/${sub.challenge.challenge_id}`}
                            className="font-semibold text-brand-700 hover:underline"
                          >
                            {sub.challenge.title}
                          </Link>{' '}
                          · {formatDateRangeId(sub.challenge.start_date, sub.challenge.end_date)}
                        </p>
                        <p className="text-xs text-ink-mute">
                          Dikirim {formatDateTimeId(sub.submitted_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="tonal"
                        size="sm"
                        href={`/challenges/${sub.challenge.challenge_id}`}
                      >
                        Lihat tantangan →
                      </Button>
                      {canWithdraw ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setWithdrawTarget(sub)}
                          className="text-[#FCA5A5]"
                        >
                          Tarik
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* Modal Hapus Karya */}
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

      {/* Modal Tarik Submission */}
      <ConfirmModal
        open={Boolean(withdrawTarget)}
        title="Tarik submission?"
        description={`Submission karya "${withdrawTarget?.artwork?.title || ''}" akan ditarik dari tantangan "${withdrawTarget?.challenge?.title || ''}".`}
        infoBox="Status setelah konfirmasi: Ditarik. Penarikan hanya dapat dilakukan selama tantangan masih berstatus Terbuka."
        confirmLabel="Ya, tarik submission"
        cancelLabel="Batal"
        variant="danger"
        loading={withdrawing}
        onConfirm={handleConfirmWithdraw}
        onClose={() => setWithdrawTarget(null)}
      />
    </div>
  );
}
