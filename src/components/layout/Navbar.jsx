'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import ArtivaLogo from '@/components/layout/ArtivaLogo';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import GooeyNav from '@/components/effects/GooeyNav';
import { CURATOR_NAV_ITEMS } from '@/components/features/curator/curator-nav';
import { MEMBER_NAV_ITEMS } from '@/components/features/member/member-nav';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { getStatusMeta } from '@/lib/shared/status-styles';

const CURATOR_VERIFICATION_ITEMS = [
  {
    key: 'verification',
    label: 'Status verifikasi',
    href: '/curator/verification',
    icon: Shield01Icon,
    match: (pathname) => pathname.startsWith('/curator/verification'),
  },
];

const ROLE_TITLE = {
  member: 'Member',
  curator: 'Kurator',
};

const PUBLIC_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jelajahi', href: '/artworks' },
  { label: 'Tantangan', href: '/challenges' },
];

const GOOEY_COLORS = ['#F2C94C', '#79A0E8', '#2856B8'];

function getProfileNavItems(user) {
  if (!user) return null;
  if (user.role === 'member') return MEMBER_NAV_ITEMS;
  if (user.role === 'curator') {
    return user.status === 'active'
      ? CURATOR_NAV_ITEMS
      : CURATOR_VERIFICATION_ITEMS;
  }
  return null;
}

function getActivePublicIndex(pathname) {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/artworks')) return 1;
  if (pathname.startsWith('/challenges')) return 2;
  return -1;
}

export default function Navbar({ user = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const menuUid = useId();
  const triggerId = `account-trigger-${menuUid}`;
  const menuId = `account-menu-${menuUid}`;

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountMenuRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const menuPanelRef = useRef(null);
  const focusFirstOnOpenRef = useRef(false);

  const isAuthPage =
    pathname === '/login' || pathname.startsWith('/register');
  const activePublicIndex = getActivePublicIndex(pathname);
  const isAccountRoute =
    pathname.startsWith('/me') || pathname.startsWith('/curator');
  const profileNavItems = getProfileNavItems(user);

  const getMenuItems = () => {
    if (!menuPanelRef.current) return [];
    return Array.from(
      menuPanelRef.current.querySelectorAll(
        'a[role="menuitem"], button[role="menuitem"]:not(:disabled)'
      )
    );
  };

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    if (focusFirstOnOpenRef.current) {
      focusFirstOnOpenRef.current = false;
      const items = getMenuItems();
      items[0]?.focus({ preventScroll: true });
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setAccountMenuOpen(false);
        avatarBtnRef.current?.focus();
        return;
      }
      if (e.key === 'Tab') {
        setAccountMenuOpen(false);
      }
    };

    const handlePointerDown = (e) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleFocusIn = (e) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [accountMenuOpen]);

  const handleTriggerClick = (e) => {
    const openedByKeyboard = e.detail === 0;
    setAccountMenuOpen((prev) => {
      const next = !prev;
      if (next && openedByKeyboard) {
        focusFirstOnOpenRef.current = true;
      }
      return next;
    });
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (!accountMenuOpen) {
        focusFirstOnOpenRef.current = true;
        setAccountMenuOpen(true);
      } else {
        getMenuItems()[0]?.focus({ preventScroll: true });
      }
    }
  };

  const handleMenuKeyDown = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const items = getMenuItems();
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement);
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Home') {
      items[0].focus({ preventScroll: true });
      return;
    }
    if (e.key === 'End') {
      items[items.length - 1].focus({ preventScroll: true });
      return;
    }
    const delta = e.key === 'ArrowUp' ? -1 : 1;
    const nextIndex =
      current < 0
        ? e.key === 'ArrowUp'
          ? items.length - 1
          : 0
        : (current + delta + items.length) % items.length;
    items[nextIndex].focus({ preventScroll: true });
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      setAccountMenuOpen(false);
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

  const displayName = user?.display_name || user?.username || 'Pengguna';
  const statusMeta = user ? getStatusMeta('user', user.status) : null;

  const sharedGooeyProps = {
    items: PUBLIC_ITEMS,
    linkComponent: Link,
    activeIndex: activePublicIndex,
    theme: 'dark',
    color: '#F2C94C',
    activeTextColor: '#091326',
    colors: GOOEY_COLORS,
    frame: true,
    particleCount: 15,
    spread: 56,
    animationTime: 600,
    timeVariance: 300,
    gooeyness: 0.5,
    wobble: 0.5,
    hoverEffect: true,
  };

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0 border-b border-line">
      <div className="relative z-20 mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center"
        >
          <ArtivaLogo size="sm" />
        </Link>

        {/* Desktop GooeyNav */}
        {!isAuthPage ? (
          <div className="hidden md:flex md:items-center">
            <GooeyNav
              {...sharedGooeyProps}
              size="md"
              ariaLabel="Navigasi utama"
            />
          </div>
        ) : null}

        {/* Right Actions (Desktop & Mobile) */}
        <div className="flex items-center gap-3">
          {isAuthPage ? (
            pathname === '/login' ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-ink-soft sm:inline">
                  Baru di ARTIVA?
                </span>
                <Button variant="secondary" size="sm" href="/register/member">
                  Buat akun →
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-ink-soft sm:inline">
                  Sudah punya akun?
                </span>
                <Button variant="secondary" size="sm" href="/login">
                  Masuk →
                </Button>
              </div>
            )
          ) : user ? (
            <div ref={accountMenuRef} className="relative z-50">
              <button
                id={triggerId}
                ref={avatarBtnRef}
                type="button"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls={menuId}
                aria-label={`Menu akun ${displayName}`}
                onClick={handleTriggerClick}
                onKeyDown={handleTriggerKeyDown}
                className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border p-1 pr-2.5 shadow-card-sm transition-all hover:-translate-y-px hover:border-brand-400 ${
                  accountMenuOpen || isAccountRoute
                    ? 'border-brand-700 bg-brand-50/90'
                    : 'border-line bg-surface/90'
                }`}
              >
                <Avatar
                  name={displayName}
                  avatarUrl={user.avatar_url}
                  size="sm"
                />
                <svg
                  className={`h-4 w-4 text-ink-soft transition-transform duration-150 ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {accountMenuOpen ? (
                <div
                  id={menuId}
                  ref={menuPanelRef}
                  role="menu"
                  aria-labelledby={triggerId}
                  onKeyDown={handleMenuKeyDown}
                  className="modal-in absolute right-0 z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-[18px] border border-line bg-surface p-2 shadow-modal"
                >
                  <div className="rounded-[14px] bg-brand-50 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {user.role === 'member' ||
                      (user.role === 'curator' && user.status === 'active')
                        ? `@${user.username}`
                        : `${ROLE_TITLE[user.role] || user.role} · ${statusMeta?.label}`}
                    </p>
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {profileNavItems?.map((item) => {
                      const active = item.match(pathname);
                      return (
                        <Link
                          key={item.key}
                          role="menuitem"
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setAccountMenuOpen(false)}
                          className={`flex min-h-[44px] items-center gap-2.5 rounded-[12px] px-3 text-sm font-semibold transition-colors ${
                            active
                              ? 'border border-brand-200 bg-brand-100 text-brand-700'
                              : 'text-ink hover:bg-brand-50 hover:text-brand-700'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
                          >
                            <HugeiconsIcon
                              icon={item.icon}
                              size={17}
                              strokeWidth={1.85}
                            />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}

                    <hr className="my-1.5 border-line" />

                    <button
                      role="menuitem"
                      type="button"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex min-h-[44px] w-full items-center gap-2.5 rounded-[12px] px-3 text-left text-sm font-semibold text-[#FCA5A5] hover:bg-[#38171E] disabled:opacity-50"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
                      >
                        <HugeiconsIcon
                          icon={Logout01Icon}
                          size={17}
                          strokeWidth={1.85}
                        />
                      </span>
                      <span>{loggingOut ? 'Memproses…' : 'Keluar akun'}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <Button variant="primary" size="sm" href="/login">
              Masuk
            </Button>
          )}
        </div>
      </div>

      {/* Mobile GooeyNav */}
      {!isAuthPage ? (
        <div className="relative z-10 flex justify-center border-t border-line/60 px-3 py-2 sm:px-4 md:hidden">
          <GooeyNav
            {...sharedGooeyProps}
            size="sm"
            ariaLabel="Navigasi seluler"
          />
        </div>
      ) : null}
    </header>
  );
}
