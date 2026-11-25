'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Select } from '@base-ui/react/select';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Flag, ShieldCheck, Tag, Users } from 'lucide-react';
import { useMotion } from '@/components/effects/MotionContext';
import { formatNumberId } from '@/lib/shared/format';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const ROLE_OPTIONS = [
  { value: 'all', label: 'Semua jenis akun' },
  { value: 'member', label: 'Member' },
  { value: 'curator', label: 'Kurator' },
  { value: 'admin', label: 'Admin' },
];

function useCanAnimate() {
  const prefersReduced = useReducedMotion();
  const { isMotionActive } = useMotion();
  return !prefersReduced && isMotionActive;
}

function OverviewCard({ stats, canAnimate }) {
  const items = [
    {
      id: 'curators',
      label: 'Verifikasi kurator',
      value: formatNumberId(stats.pending_verifications),
      note:
        (stats.pending_verifications || 0) > 0
          ? 'pengajuan menunggu'
          : 'antrean terkendali',
      href: '/dashboard/admin/curators',
      icon: ShieldCheck,
      toneClass:
        (stats.pending_verifications || 0) > 0
          ? 'border-[#614A1B] bg-[#332811] text-[#F2C94C]'
          : 'border-[#225941] bg-[#123326] text-[#8CE6B4]',
    },
    {
      id: 'users',
      label: 'Pengguna',
      value: formatNumberId(stats.users.total),
      note: `${formatNumberId(stats.users.member)} member · ${formatNumberId(stats.users.curator)} kurator`,
      href: '/dashboard/admin/users',
      icon: Users,
      toneClass: 'border-[#264E91] bg-[#142C4A] text-[#699EE8]',
    },
    {
      id: 'categories',
      label: 'Kategori',
      value: formatNumberId(stats.categories.active),
      note: `dari ${formatNumberId(stats.categories.total)} kategori`,
      href: '/dashboard/admin/categories',
      icon: Tag,
      toneClass: 'border-[#335AA3] bg-[#162950] text-[#F2C94C]',
    },
    {
      id: 'reports',
      label: 'Moderasi laporan',
      value: formatNumberId(stats.pending_reports),
      note:
        (stats.pending_reports || 0) > 0
          ? 'laporan menunggu'
          : 'tidak ada laporan baru',
      href: '/dashboard/admin/reports',
      icon: Flag,
      toneClass:
        (stats.pending_reports || 0) > 0
          ? 'border-[#6E2734] bg-[#38171E] text-[#FCA5A5]'
          : 'border-[#225941] bg-[#123326] text-[#8CE6B4]',
    },
  ];

  return (
    <motion.section
      aria-labelledby="admin-overview-heading"
      initial={canAnimate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      className="rounded-[22px] border border-line bg-surface/90 p-4 shadow-card-sm sm:p-5"
    >
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="admin-overview-heading"
          className="text-lg font-semibold text-ink"
        >
          Overview
        </h2>
        <span className="text-xs font-medium text-ink-mute">
          Menu pengelolaan admin
        </span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-line/70 sm:grid-cols-2 sm:gap-4 sm:divide-y-0 lg:grid-cols-4 lg:gap-0 lg:divide-x">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const padClass =
            idx === 0
              ? 'lg:pr-5'
              : idx === items.length - 1
                ? 'lg:pl-5'
                : 'lg:px-5';

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-3.5 rounded-xl py-3.5 transition-colors hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 sm:p-3 lg:py-1 ${padClass}`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${item.toneClass}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-ink-soft">
                  {item.label}
                </p>
                <p className="tabular-nums mt-0.5 text-2xl font-bold leading-tight text-ink">
                  {item.value}
                </p>
                <p className="truncate text-[0.6875rem] text-ink-mute group-hover:text-ink-soft">
                  {item.note}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

function AccountStatusDonutCard({ stats, canAnimate }) {
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeKey, setActiveKey] = useState(null);

  const currentCounts = useMemo(() => {
    const byRole = stats.user_status_by_role;
    if (byRole && byRole[roleFilter]) {
      return byRole[roleFilter];
    }
    return {
      total: stats.users.total || 0,
      active: stats.users.active || 0,
      suspended: stats.users.suspended || 0,
      pending: stats.users.pending || 0,
    };
  }, [stats, roleFilter]);

  const segments = useMemo(
    () => [
      {
        key: 'active',
        label: 'Aktif',
        description: 'Akun aktif dan dapat mengakses platform.',
        value: currentCounts.active || 0,
        color: '#34D399',
      },
      {
        key: 'suspended',
        label: 'Ditangguhkan',
        description: 'Akses akun dibekukan sementara oleh Admin.',
        value: currentCounts.suspended || 0,
        color: '#F87171',
      },
      {
        key: 'pending',
        label: 'Menunggu verifikasi',
        description: 'Akun menunggu tinjauan verifikasi dari Admin.',
        value: currentCounts.pending || 0,
        color: '#F2C94C',
      },
    ],
    [currentCounts]
  );

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const nonZeroCount = segments.filter((s) => s.value > 0).length;

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const gapPx = nonZeroCount > 1 ? 6 : 0;

  const arcs = useMemo(() => {
    if (total === 0) return [];
    let offset = 0;
    return segments
      .filter((s) => s.value > 0)
      .map((seg) => {
        const rawLen = (seg.value / total) * circumference;
        const dashLen = Math.max(2, rawLen - gapPx);
        const arc = {
          ...seg,
          dashArray: `${dashLen} ${circumference - dashLen}`,
          dashOffset: -offset,
        };
        offset += rawLen;
        return arc;
      });
  }, [segments, total, circumference, gapPx]);

  const activeSeg = segments.find((s) => s.key === activeKey) || null;
  const roleLabel =
    ROLE_OPTIONS.find((opt) => opt.value === roleFilter)?.label ||
    'Semua jenis akun';

  const centerValue = activeSeg ? activeSeg.value : total;
  const centerLabel = activeSeg ? activeSeg.label : roleLabel;

  return (
    <motion.section
      aria-labelledby="account-status-heading"
      initial={canAnimate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: canAnimate ? 0.06 : 0, ease: EASE_OUT_EXPO }}
      className="rounded-[22px] border border-line bg-surface/90 p-4 shadow-card-sm sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="account-status-heading"
            className="text-lg font-semibold text-ink"
          >
            Status Akun Pengguna
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            Distribusi akun aktif, ditangguhkan, dan menunggu verifikasi berdasarkan jenis akun.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            id="account-role-filter-label"
            className="text-xs font-medium text-ink-mute"
          >
            Jenis akun
          </span>
          <Select.Root
            items={ROLE_OPTIONS}
            value={roleFilter}
            modal={false}
            onValueChange={(nextValue) => {
              if (nextValue) {
                setRoleFilter(nextValue);
                setActiveKey(null);
              }
            }}
          >
            <Select.Trigger
              aria-labelledby="account-role-filter-label"
              className="inline-flex h-10 min-w-[185px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-canvas/90 px-3.5 text-xs font-semibold text-ink transition-colors hover:border-brand-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 data-[popup-open]:border-brand-700"
            >
              <Select.Value />
              <Select.Icon className="text-ink-soft transition-transform duration-150 [[data-popup-open]_&]:rotate-180">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Positioner
                sideOffset={6}
                align="end"
                alignItemWithTrigger={false}
                className="z-50 outline-none"
              >
                <Select.Popup className="min-w-[185px] origin-[var(--transform-origin)] rounded-xl border border-line bg-surface p-1.5 shadow-modal outline-none">
                  <Select.List className="space-y-0.5 outline-none">
                    {ROLE_OPTIONS.map((opt) => (
                      <Select.Item
                        key={opt.value}
                        value={opt.value}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium text-ink-soft outline-none transition-colors select-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-ink data-[selected]:bg-brand-700/15 data-[selected]:font-semibold data-[selected]:text-brand-700"
                      >
                        <Select.ItemText>{opt.label}</Select.ItemText>
                        <Select.ItemIndicator className="text-brand-700">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-12">
        <div className="flex items-center justify-center md:col-span-5">
          <div className="relative h-52 w-52 sm:h-56 sm:w-56">
            <svg
              viewBox="0 0 240 240"
              className="h-full w-full"
              role="img"
              aria-label={`Diagram donat status akun (${roleLabel}): ${segments
                .map((s) => `${s.label} ${s.value}`)
                .join(', ')}`}
            >
              <circle
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke="var(--color-brand-50)"
                strokeWidth="26"
              />
              {arcs.map((arc) => {
                const isDimmed = activeKey && activeKey !== arc.key;
                return (
                  <circle
                    key={arc.key}
                    cx="120"
                    cy="120"
                    r={radius}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={activeKey === arc.key ? '30' : '26'}
                    strokeDasharray={arc.dashArray}
                    strokeDashoffset={arc.dashOffset}
                    transform="rotate(-90 120 120)"
                    opacity={isDimmed ? 0.35 : 1}
                    className="cursor-pointer transition-opacity duration-200"
                    onMouseEnter={() => setActiveKey(arc.key)}
                    onMouseLeave={() => setActiveKey(null)}
                  />
                );
              })}
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
              <span className="tabular-nums text-3xl font-bold leading-none text-ink sm:text-4xl">
                {formatNumberId(centerValue)}
              </span>
              <span className="mt-1.5 max-w-[130px] text-xs font-medium leading-snug text-ink-soft">
                {centerLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 md:col-span-7">
          {segments.map((seg) => {
            const percent = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            const isActive = activeKey === seg.key;

            return (
              <button
                key={seg.key}
                type="button"
                onMouseEnter={() => setActiveKey(seg.key)}
                onMouseLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(seg.key)}
                onBlur={() => setActiveKey(null)}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 ${
                  isActive
                    ? 'border-brand-400/60 bg-brand-50/75'
                    : 'border-line/70 bg-canvas/45 hover:bg-brand-50/45'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-3.5 shrink-0 rounded-full border-[3px]"
                      style={{ borderColor: seg.color }}
                    />
                    <span className="text-sm font-semibold text-ink">
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="tabular-nums text-base font-bold text-ink">
                      {formatNumberId(seg.value)}
                    </span>
                    <span className="tabular-nums text-xs font-medium text-ink-mute">
                      ({percent}%)
                    </span>
                  </div>
                </div>

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-50">
                  <div
                    className="h-full w-full rounded-full motion-safe:transition-transform motion-safe:duration-300"
                    style={{
                      transform: `scaleX(${percent / 100})`,
                      transformOrigin: 'left',
                      backgroundColor: seg.color,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-mute">{seg.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export default function AdminDashboardBento({ stats }) {
  const canAnimate = useCanAnimate();

  return (
    <div className="space-y-5">
      <OverviewCard stats={stats} canAnimate={canAnimate} />
      <AccountStatusDonutCard stats={stats} canAnimate={canAnimate} />
    </div>
  );
}
