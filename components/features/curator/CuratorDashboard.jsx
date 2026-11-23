'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Award01Icon,
  CheckmarkBadge01Icon,
  DashboardSquare01Icon,
  Image02Icon,
  SentIcon,
} from '@hugeicons/core-free-icons';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import ChallengeCard from '@/components/cards/ChallengeCard';
import ChipRow from '@/components/ui/Chip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import GlassPanel from '@/components/ui/GlassPanel';
import MagicBento from '@/components/effects/MagicBento';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';

const VIEWS = [
  { label: 'Ringkasan', value: 'dashboard' },
  { label: 'Semua tantangan', value: 'challenges' },
  { label: 'Submission aktif', value: 'submissions' },
  { label: 'Tentukan pemenang', value: 'winners' },
  { label: 'Pengumuman', value: 'announcements' },
];

export default function CuratorDashboard({
  user,
  initialView = 'dashboard',
  initialChallenges = [],
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const validView = VIEWS.some((v) => v.value === initialView)
    ? initialView
    : 'dashboard';
  const [view, setView] = useState(validView);
  const [challenges, setChallenges] = useState(initialChallenges);
  const [publishingId, setPublishingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const switchView = (next) => {
    setView(next);
    router.replace(
      next === 'dashboard'
        ? '/dashboard/curator'
        : `/dashboard/curator?view=${next}`,
      { scroll: false }
    );
  };

  const drafts = challenges.filter((c) => c.status === 'draft');
  const opens = challenges.filter((c) => c.status === 'open');
  const closeds = challenges.filter((c) => c.status === 'closed');
  const announceds = challenges.filter((c) => c.status === 'announced');

  const handlePublish = async (ch) => {
    setPublishingId(ch.challenge_id);
    try {
      const res = await apiFetch(
        `/api/curator/challenges/${ch.challenge_id}/publish`,
        { method: 'POST' }
      );
      setChallenges((prev) =>
        prev.map((item) =>
          item.challenge_id === ch.challenge_id ? res.data.challenge : item
        )
      );
      showToast({
        tone: 'success',
        title: 'Tantangan dipublikasikan',
        message: `"${ch.title}" kini terbuka untuk menerima karya.`,
      });
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(
        `/api/curator/challenges/${deleteTarget.challenge_id}`,
        { method: 'DELETE' }
      );
      setChallenges((prev) =>
        prev.filter((c) => c.challenge_id !== deleteTarget.challenge_id)
      );
      showToast({
        tone: 'info',
        title: 'Tantangan dihapus',
        message: `"${deleteTarget.title}" berhasil dihapus.`,
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const renderChallengeActions = (ch) => (
    <>
      {ch.status === 'draft' ? (
        <Button
          variant="primary"
          size="sm"
          loading={publishingId === ch.challenge_id}
          onClick={() => handlePublish(ch)}
        >
          Publikasikan
        </Button>
      ) : null}

      {ch.status !== 'draft' ? (
        <Button
          variant="tonal"
          size="sm"
          href={`/dashboard/curator/challenges/${ch.challenge_id}/submissions`}
        >
          Lihat submission ({ch.submission_count}) →
        </Button>
      ) : null}

      {ch.status === 'closed' ? (
        <Button
          variant="primary"
          size="sm"
          href={`/dashboard/curator/challenges/${ch.challenge_id}/winners`}
        >
          Tentukan pemenang →
        </Button>
      ) : null}

      {ch.status === 'announced' ? (
        <Button
          variant="secondary"
          size="sm"
          href={`/dashboard/curator/challenges/${ch.challenge_id}/winners`}
        >
          Lihat pengumuman →
        </Button>
      ) : null}

      {ch.status === 'draft' || ch.status === 'open' ? (
        <Button
          variant="secondary"
          size="sm"
          href={`/dashboard/curator/challenges/${ch.challenge_id}/edit`}
        >
          Ubah
        </Button>
      ) : null}

      {ch.status === 'draft' || ch.total_submissions === 0 ? (
        <button
          type="button"
          onClick={() => setDeleteTarget(ch)}
          className="min-h-[44px] px-2 text-sm font-semibold text-[#FCA5A5] hover:underline"
        >
          Hapus
        </button>
      ) : null}
    </>
  );

  const visibleList =
    view === 'submissions'
      ? opens
      : view === 'winners'
        ? closeds
        : view === 'announcements'
          ? announceds
          : challenges;

  const coverPreview =
    challenges.find((c) => c.cover_image_url) || null;
  const totalSubmissions = challenges.reduce(
    (sum, item) => sum + (Number(item.submission_count) || 0),
    0
  );

  const curatorBentoItems = [
    {
      id: 'curator-challenges',
      label: 'Kurasi',
      title: 'Tantangan saya',
      description: `${challenges.length} total tantangan (${drafts.length} draft, ${opens.length} terbuka).`,
      icon: (
        <HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={1.8} />
      ),
      colSpan: 2,
      rowSpan: 2,
      onClick: () => switchView('challenges'),
      visual: 'automation',
    },
    {
      id: 'curator-submissions',
      label: 'Tinjauan',
      title: 'Submission aktif',
      description: `${opens.length} tantangan terbuka dengan ${totalSubmissions} karya masuk.`,
      icon: <HugeiconsIcon icon={SentIcon} size={16} strokeWidth={1.8} />,
      colSpan: 2,
      onClick: () => switchView('submissions'),
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3.5 py-2.5">
          <span className="tabular-nums text-2xl font-semibold text-ink">
            {totalSubmissions}
          </span>
          <span className="text-xs font-semibold text-brand-700">
            total karya masuk
          </span>
        </div>
      ),
    },
    {
      id: 'curator-winners',
      label: 'Seleksi',
      title: 'Tentukan pemenang',
      description: `${closeds.length} menunggu penetapan pemenang.`,
      icon: <HugeiconsIcon icon={Award01Icon} size={16} strokeWidth={1.8} />,
      onClick: () => switchView('winners'),
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3 py-2">
          <span className="tabular-nums text-2xl font-semibold text-brand-700">
            {closeds.length}
          </span>
          <span className="text-xs text-ink-soft">menunggu</span>
        </div>
      ),
    },
    {
      id: 'curator-announcements',
      label: 'Arsip',
      title: 'Pengumuman',
      description: `${announceds.length} tantangan telah diumumkan.`,
      icon: (
        <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} strokeWidth={1.8} />
      ),
      onClick: () => switchView('announcements'),
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3 py-2">
          <span className="tabular-nums text-2xl font-semibold text-ink">
            {announceds.length}
          </span>
          <span className="text-xs text-ink-soft">diumumkan</span>
        </div>
      ),
    },
    {
      id: 'curator-new-challenge',
      label: 'Aksi cepat',
      title: 'Buat tantangan baru',
      description: 'Susun tema, kategori, dan periode kompetisi baru.',
      icon: <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/curator/challenges/new',
      colSpan: 2,
      visual: (
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3.5 py-2.5">
          <span className="tabular-nums text-xs font-semibold text-ink">
            {drafts.length} draft · {opens.length} terbuka
          </span>
          <span className="text-xs font-semibold text-brand-700">Buat baru →</span>
        </div>
      ),
    },
    {
      id: 'curator-public-challenges',
      label: 'Etalase',
      title: 'Lihat daftar tantangan publik',
      description: 'Tinjau bagaimana tantangan tampil bagi komunitas kreator.',
      icon: <HugeiconsIcon icon={Image02Icon} size={16} strokeWidth={1.8} />,
      href: '/challenges',
      colSpan: 2,
      visual: 'integration',
    },
  ];

  return (
    <div className="space-y-8">
      <GlassPanel
        eyebrow="RUANG KURATOR"
        badgeSlot={<StatusBadge domain="verification" status="approved" />}
        title="Buka ruang untuk ide yang berani."
        subtitle={`Halo, ${user.display_name}. Kelola tantangan kreatif, tinjau karya masuk, dan umumkan pemenang secara transparan.`}
        previewArtwork={
          coverPreview
            ? {
                title: coverPreview.title,
                image_url: coverPreview.cover_image_url,
              }
            : null
        }
        actions={
          <Button variant="primary" href="/dashboard/curator/challenges/new">
            Buat tantangan →
          </Button>
        }
      />

      <ChipRow
        items={VIEWS.map((v) => ({
          ...v,
          count:
            v.value === 'challenges'
              ? challenges.length
              : v.value === 'submissions'
                ? opens.length
                : v.value === 'winners'
                  ? closeds.length
                  : v.value === 'announcements'
                    ? announceds.length
                    : undefined,
        }))}
        activeValue={view}
        onSelect={switchView}
      />

      {view === 'dashboard' ? (
        <div className="space-y-10">
          <MagicBento
            items={curatorBentoItems}
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

          {closeds.length > 0 ? (
            <Alert tone="warning" title="Menunggu penetapan pemenang">
              Ada {closeds.length} tantangan yang periodenya sudah berakhir dan siap ditetapkan pemenangnya.
            </Alert>
          ) : null}

          <section className="space-y-5">
            <h2 className="text-2xl font-semibold text-ink">
              Lanjutkan kurasi
            </h2>
            {opens.length === 0 && closeds.length === 0 ? (
              <EmptyState
                title="Belum ada tantangan aktif atau menunggu pemenang"
                description="Buat tantangan baru atau publikasikan draft untuk mulai menerima karya dari Member."
                actionLabel="Buat tantangan →"
                actionHref="/dashboard/curator/challenges/new"
              />
            ) : (
              <div className="space-y-4">
                {[...closeds, ...opens].map((ch, idx) => (
                  <ChallengeCard
                    key={ch.challenge_id}
                    challenge={ch}
                    variant="compact"
                    index={idx}
                    actions={renderChallengeActions(ch)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : view === 'challenges' ? (
        <div className="space-y-10">
          {challenges.length === 0 ? (
            <EmptyState
              title="Belum ada tantangan dibuat"
              description="Buat tantangan tematik pertamamu untuk mengajak kreator berpartisipasi."
              actionLabel="Buat tantangan →"
              actionHref="/dashboard/curator/challenges/new"
            />
          ) : (
            [
              { key: 'closed', title: 'Menunggu penetapan pemenang', list: closeds },
              { key: 'open', title: 'Sedang berlangsung (Terbuka)', list: opens },
              { key: 'draft', title: 'Draft', list: drafts },
              { key: 'announced', title: 'Sudah diumumkan', list: announceds },
            ]
              .filter((group) => group.list.length > 0)
              .map((group) => (
                <section key={group.key} className="space-y-4">
                  <h2 className="tabular-nums text-xl font-semibold text-ink">
                    {group.title} ({group.list.length})
                  </h2>
                  <div className="space-y-4">
                    {group.list.map((ch, idx) => (
                      <ChallengeCard
                        key={ch.challenge_id}
                        challenge={ch}
                        variant="compact"
                        index={idx}
                        actions={renderChallengeActions(ch)}
                      />
                    ))}
                  </div>
                </section>
              ))
          )}
        </div>
      ) : (
        <section className="space-y-4">
          {visibleList.length === 0 ? (
            <EmptyState
              title="Tidak ada tantangan pada bagian ini"
              description="Tantangan dengan status terkait akan tampil di sini."
              actionLabel="Lihat semua tantangan"
              onAction={() => switchView('challenges')}
            />
          ) : (
            visibleList.map((ch, idx) => (
              <ChallengeCard
                key={ch.challenge_id}
                challenge={ch}
                variant="compact"
                index={idx}
                actions={renderChallengeActions(ch)}
              />
            ))
          )}
        </section>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus tantangan ini?"
        description={`Tantangan "${deleteTarget?.title || ''}" akan dihapus permanen.`}
        confirmLabel="Ya, hapus tantangan"
        cancelLabel="Batal"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
