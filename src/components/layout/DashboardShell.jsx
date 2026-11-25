'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useRef, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ROLE_LABELS } from '@/lib/shared/navigation';

const ROLE_SPACE = {
  admin: { label: 'Ruang Admin', href: '/dashboard/admin' },
};

const ADMIN_SECTION_TITLES = [
  { prefix: '/dashboard/admin/curators/', label: 'Detail pengajuan' },
  { prefix: '/dashboard/admin/curators', label: 'Verifikasi kurator' },
  { prefix: '/dashboard/admin/users/', label: 'Detail pengguna' },
  { prefix: '/dashboard/admin/users', label: 'Pengguna' },
  { prefix: '/dashboard/admin/categories', label: 'Kategori' },
  { prefix: '/dashboard/admin/reports/', label: 'Tinjau laporan' },
  { prefix: '/dashboard/admin/reports', label: 'Moderasi laporan' },
];

function resolveCurrentSection(role, pathname) {
  if (role === 'admin') {
    const matched = ADMIN_SECTION_TITLES.find((item) =>
      pathname.startsWith(item.prefix)
    );
    return matched ? matched.label : 'Dashboard';
  }

  return 'Dashboard';
}

function DashboardTopbar({ user, triggerRef, mobileOpen, onOpenMobile }) {
  const pathname = usePathname();

  const space = ROLE_SPACE[user.role] || {
    label: 'Ruang Admin',
    href: '/dashboard/admin',
  };
  const sectionLabel = resolveCurrentSection(user.role, pathname);

  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0 border-b border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Buka menu ruang"
            onClick={onOpenMobile}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold text-ink lg:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
            <span>Menu</span>
          </button>

          <nav
            aria-label="Breadcrumb ruang"
            className="flex items-center gap-2 text-sm text-ink-soft"
          >
            <Link href={space.href} className="hover:text-brand-700">
              {space.label}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-ink">{sectionLabel}</span>
          </nav>
        </div>

        <p className="text-sm font-semibold text-brand-700">
          {user.display_name || user.username} ·{' '}
          {ROLE_LABELS[user.role] || user.role}
        </p>
      </div>
    </header>
  );
}

function DashboardShellInner({ user, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const triggerRef = useRef(null);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        triggerRef={triggerRef}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar
          user={user}
          triggerRef={triggerRef}
          mobileOpen={mobileOpen}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ user, children }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      }
    >
      <DashboardShellInner user={user}>{children}</DashboardShellInner>
    </Suspense>
  );
}
