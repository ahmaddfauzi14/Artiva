'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Award01Icon,
  Flag01Icon,
  SentIcon,
  Shield01Icon,
  Tag01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import MagicBento from '@/components/effects/MagicBento';
import { formatNumberId } from '@/lib/shared/format';

export default function AdminDashboardBento({ stats }) {
  const totalArtworks =
    (stats.artworks.published || 0) +
    (stats.artworks.hidden || 0) +
    (stats.artworks.removed || 0);

  const items = [
    {
      id: 'admin-reports',
      label: 'Prioritas moderasi',
      title: 'Moderasi laporan karya',
      description: `${formatNumberId(stats.pending_reports)} laporan pelanggaran karya menunggu keputusan.`,
      icon: <HugeiconsIcon icon={Flag01Icon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/admin/reports',
      colSpan: 2,
      rowSpan: 2,
      visual: (
        <div className="flex h-full flex-col justify-between gap-3 rounded-[14px] border border-[#233B69] bg-[#0B1730]/70 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="tabular-nums text-3xl font-semibold text-brand-700">
              {formatNumberId(stats.pending_reports)}
            </span>
            <span className="text-xs font-semibold text-ink-soft">
              laporan menunggu
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-ink-soft">
            <p className="font-semibold uppercase tracking-[0.06em] text-ink-mute">
              Status karya ekosistem
            </p>
            <p className="tabular-nums text-sm font-semibold text-ink">
              {stats.artworks.published} Dipublikasikan · {stats.artworks.hidden}{' '}
              Disembunyikan · {stats.artworks.removed} Dihapus
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#162950]">
              <div
                className="h-full rounded-full bg-[#F2C94C]"
                style={{
                  width: `${totalArtworks ? Math.round((stats.artworks.published / totalArtworks) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'admin-verifications',
      label: 'Otorisasi kurator',
      title: 'Verifikasi kurator',
      description: `${formatNumberId(stats.pending_verifications)} pengajuan Kurator menunggu tinjauan Admin.`,
      icon: <HugeiconsIcon icon={Shield01Icon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/admin/curators',
      colSpan: 2,
      visual: 'security',
    },
    {
      id: 'admin-users',
      label: 'Pengguna',
      title: `${formatNumberId(stats.users.total)} Akun`,
      description: `${stats.users.member} Member · ${stats.users.curator} Kurator · ${stats.users.admin} Admin`,
      icon: <HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/admin/users',
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3 py-2">
          <span className="tabular-nums text-2xl font-semibold text-ink">
            {formatNumberId(stats.users.total)}
          </span>
          <span className="text-xs text-ink-soft">terdaftar</span>
        </div>
      ),
    },
    {
      id: 'admin-categories',
      label: 'Taksonomi',
      title: `${formatNumberId(stats.categories.active)} Kategori Aktif`,
      description: 'Tambah, ubah, atau atur status kategori karya.',
      icon: <HugeiconsIcon icon={Tag01Icon} size={16} strokeWidth={1.8} />,
      href: '/dashboard/admin/categories',
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3 py-2">
          <span className="tabular-nums text-2xl font-semibold text-brand-700">
            {formatNumberId(stats.categories.active)}
          </span>
          <span className="text-xs text-ink-soft">kategori aktif</span>
        </div>
      ),
    },
    {
      id: 'admin-challenges',
      label: 'Status tantangan',
      title: `${stats.challenges.open} Terbuka · ${stats.challenges.closed} Ditutup`,
      description: `${stats.challenges.announced} tantangan telah diumumkan pemenangnya.`,
      icon: <HugeiconsIcon icon={Award01Icon} size={16} strokeWidth={1.8} />,
      colSpan: 2,
      visual: (
        <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3.5 py-2.5">
          <div className="flex items-baseline gap-2">
            <span className="tabular-nums text-2xl font-semibold text-ink">
              {stats.challenges.open + stats.challenges.closed + stats.challenges.announced}
            </span>
            <span className="text-xs text-ink-soft">total tantangan</span>
          </div>
          <span className="tabular-nums text-xs font-semibold text-brand-700">
            {stats.challenges.announced} diumumkan
          </span>
        </div>
      ),
    },
    {
      id: 'admin-submissions',
      label: 'Partisipasi submission',
      title: `${formatNumberId(stats.submissions.active_submissions)} Submission Aktif`,
      description: `Dari ${formatNumberId(stats.submissions.total_submissions)} total riwayat pengiriman karya.`,
      icon: <HugeiconsIcon icon={SentIcon} size={16} strokeWidth={1.8} />,
      colSpan: 2,
      visual: (
        <div className="flex items-baseline justify-between gap-2 rounded-[12px] border border-[#233B69] bg-[#0B1730]/60 px-3.5 py-2.5">
          <span className="tabular-nums text-2xl font-semibold text-ink">
            {formatNumberId(stats.submissions.active_submissions)}
          </span>
          <span className="tabular-nums text-xs font-semibold text-brand-700">
            / {formatNumberId(stats.submissions.total_submissions)} total
          </span>
        </div>
      ),
    },
  ];

  return (
    <MagicBento
      items={items}
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
  );
}
