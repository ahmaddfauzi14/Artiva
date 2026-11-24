'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ArtivaLogo from '@/components/layout/ArtivaLogo';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import MotionToggle from '@/components/effects/MotionToggle';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { getStatusMeta } from '@/lib/shared/status-styles';

const ROLE_SPACE_LABEL = {
  curator: 'RUANG KURATOR',
  admin: 'RUANG ADMIN',
};

const ROLE_TITLE = {
  curator: 'Kurator',
  admin: 'Admin',
};

function MenuGlyph({ name }) {
  const props = {
    className: 'h-4 w-4 shrink-0',
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'grid':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" />
        </svg>
      );
    case 'frame':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="14" height="12" rx="2" />
          <path d="M6 13l3-3 2.5 2.5L14 10l2 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          <path d="M6 4h8v4a4 4 0 01-8 0V4z" />
          <path d="M10 12v4M7 16h6M4 5h2v3a2 2 0 01-2-2V5zM14 5h2v1a2 2 0 01-2 2V5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'send':
      return (
        <svg {...props}>
          <path d="M17 3L9 11M17 3l-5 14-3-6-6-3 14-5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M10 16.5s-6-3.8-6-8.2A3.3 3.3 0 019.5 5.6L10 6.2l.5-.6A3.3 3.3 0 0116 8.3c0 4.4-6 8.2-6 8.2z" strokeLinejoin="round" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <circle cx="10" cy="7" r="3" />
          <path d="M4.5 16.5a5.5 5.5 0 0111 0" strokeLinecap="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M10 2.5l6 2.5v4.5c0 4-2.5 6.8-6 8-3.5-1.2-6-4-6-8V5l6-2.5z" strokeLinejoin="round" />
          <path d="M7.5 10l1.8 1.8L12.8 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <circle cx="7.5" cy="7" r="2.5" />
          <path d="M3 16a4.5 4.5 0 019 0" strokeLinecap="round" />
          <circle cx="14" cy="8" r="2" />
          <path d="M14 12.5a3.5 3.5 0 013.5 3.5" strokeLinecap="round" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...props}>
          <path d="M3.5 10.5V4.5a1 1 0 011-1h6l6 6-6 6-7-5z" strokeLinejoin="round" />
          <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'flag':
      return (
        <svg {...props}>
          <path d="M5 3v14M5 4h9l-1.5 3.5L14 11H5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="10" cy="10" r="6" />
        </svg>
      );
  }
}

export function getSidebarMenu(role) {
  if (role === 'curator') {
    return [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard/curator', icon: 'grid' },
      { key: 'challenges', label: 'Tantangan saya', href: '/dashboard/curator/challenges', icon: 'trophy' },
      { key: 'submissions', label: 'Submission aktif', href: '/dashboard/curator?view=submissions', icon: 'send' },
      { key: 'winners', label: 'Tentukan pemenang', href: '/dashboard/curator?view=winners', icon: 'shield' },
      { key: 'announcements', label: 'Pengumuman', href: '/dashboard/curator?view=announcements', icon: 'frame' },
    ];
  }

  if (role === 'admin') {
    return [
      { key: 'dashboard', label: 'Dashboard', href: '/dashboard/admin', icon: 'grid' },
      { key: 'curators', label: 'Verifikasi kurator', href: '/dashboard/admin/curators', icon: 'shield' },
      { key: 'users', label: 'Pengguna', href: '/dashboard/admin/users', icon: 'users' },
      { key: 'categories', label: 'Kategori', href: '/dashboard/admin/categories', icon: 'tag' },
      { key: 'reports', label: 'Moderasi laporan', href: '/dashboard/admin/reports', icon: 'flag' },
    ];
  }

  return [];
}

export default function Sidebar({
  user,
  mobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
  triggerRef,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);

  const drawerRef = useRef(null);
  const currentQuery = searchParams.get('tab') || searchParams.get('view') || '';

  const menuItems = getSidebarMenu(user.role);
  const statusMeta = getStatusMeta('user', user.status);
  const displayName = user.display_name || user.username;

  const isItemActive = (item) => {
    if (item.href.includes('?')) {
      const [base, qs] = item.href.split('?');
      const val = qs.split('=')[1];
      return pathname === base && currentQuery === val;
    }
    if (item.key === 'dashboard') {
      return (
        pathname === item.href &&
        (!currentQuery || currentQuery === 'overview' || currentQuery === 'dashboard')
      );
    }
    if (
      user.role === 'curator' &&
      item.key === 'challenges' &&
      pathname.startsWith('/dashboard/curator/challenges')
    ) {
      return !pathname.endsWith('/submissions') && !pathname.endsWith('/winners');
    }
    if (
      user.role === 'curator' &&
      item.key === 'submissions' &&
      pathname.endsWith('/submissions')
    ) {
      return true;
    }
    if (
      user.role === 'curator' &&
      item.key === 'winners' &&
      pathname.endsWith('/winners')
    ) {
      return true;
    }
    if (pathname === item.href) return true;
    if (item.href !== '/challenges' && pathname.startsWith(`${item.href}/`)) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      const firstFocusable = drawerRef.current?.querySelector(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 10);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseMobile?.();
        triggerRef?.current?.focus();
        return;
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, onCloseMobile, triggerRef]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      showToast({
        tone: 'info',
        title: 'Sesi berakhir',
        message: 'Kamu telah keluar dari akun ARTIVA.',
      });
      router.push('/login');
      router.refresh();
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
    } finally {
      setLoggingOut(false);
    }
  };

  const renderSidebarBody = (isMobileDrawer = false) => {
    const isCompact = !isMobileDrawer && collapsed;

    return (
      <div className="flex h-full flex-col justify-between gap-6 p-4">
        <div className="space-y-6">
          {/* Header Sidebar */}
          <div className="flex items-start justify-between gap-2 px-1">
            <Link
              href={`/dashboard/${user.role}`}
              onClick={isMobileDrawer ? onCloseMobile : undefined}
              className="min-w-0"
              aria-label={isCompact ? `ARTIVA ${ROLE_SPACE_LABEL[user.role]}` : undefined}
            >
              <ArtivaLogo size="sm" showWordmark={!isCompact} />
              {!isCompact ? (
                <span className="mt-1.5 block text-xs font-semibold tracking-[0.08em] text-brand-700 uppercase">
                  {ROLE_SPACE_LABEL[user.role]}
                </span>
              ) : null}
            </Link>

            {isMobileDrawer ? (
              <button
                type="button"
                aria-label="Tutup menu ruang"
                onClick={() => {
                  onCloseMobile?.();
                  triggerRef?.current?.focus();
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink hover:bg-brand-50"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                aria-expanded={!collapsed}
                aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
                onClick={onToggleCollapse}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface/85 text-ink-soft shadow-card-sm transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${
                    collapsed ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5l-5 5 5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Menu Navigasi */}
          <div className="space-y-2">
            {!isCompact ? (
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
                PENGELOLAAN
              </p>
            ) : null}

            <nav aria-label="Menu ruang" className="space-y-1.5">
              {menuItems.map((item) => {
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    aria-label={isCompact ? item.label : undefined}
                    title={isCompact ? item.label : undefined}
                    onClick={isMobileDrawer ? onCloseMobile : undefined}
                    className={`group relative flex min-h-[44px] items-center gap-3 rounded-[18px] px-3 py-2 text-sm transition-all duration-150 ${
                      active
                        ? 'bg-brand-100 font-semibold text-brand-700 shadow-card-sm'
                        : 'font-medium text-ink-soft hover:bg-brand-50 hover:text-ink motion-safe:hover:translate-x-0.5'
                    } ${isCompact ? 'justify-center px-2' : ''}`}
                  >
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute top-2.5 bottom-2.5 left-1 w-1 rounded-full bg-brand-700"
                      />
                    ) : null}
                    <MenuGlyph name={item.icon} />
                    {!isCompact ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Identitas Sidebar */}
        <div className="space-y-3 border-t border-line pt-4">
          <div
            className={`flex items-center gap-3 rounded-[18px] bg-surface/80 p-2.5 ${
              isCompact ? 'justify-center p-1.5' : ''
            }`}
          >
            <Avatar name={displayName} avatarUrl={user.avatar_url} size="sm" />
            {!isCompact ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {displayName}
                </p>
                <p className="truncate text-xs text-ink-soft">
                  {ROLE_TITLE[user.role] || user.role} · {statusMeta?.label}
                </p>
              </div>
            ) : null}
          </div>

          {!isCompact ? <MotionToggle fullWidth /> : null}

          <Button
            variant="secondary"
            size="sm"
            loading={loggingOut}
            onClick={handleLogout}
            className="w-full"
            aria-label={isCompact ? 'Keluar akun' : undefined}
            title={isCompact ? 'Keluar akun' : undefined}
          >
            {isCompact ? 'Keluar' : 'Keluar akun'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`glass hidden shrink-0 self-start sticky top-0 h-screen overflow-y-auto border-y-0 border-l-0 border-r border-line transition-[width] duration-200 lg:block ${
          collapsed ? 'w-[84px]' : 'w-64'
        }`}
      >
        {renderSidebarBody(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex bg-brand-900/40 lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onCloseMobile?.();
              triggerRef?.current?.focus();
            }
          }}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi ruang pengguna"
            className="h-full w-72 max-w-[85vw] overflow-y-auto bg-surface shadow-modal"
          >
            {renderSidebarBody(true)}
          </div>
        </div>
      ) : null}
    </>
  );
}
