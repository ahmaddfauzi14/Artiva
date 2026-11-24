'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ArtivaLogo from '@/components/layout/ArtivaLogo';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import GooeyNav from '@/components/effects/GooeyNav';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { getStatusMeta } from '@/lib/shared/status-styles';

const DASHBOARD_HOME = {
  member: '/dashboard/member',
  curator: '/dashboard/curator',
  admin: '/dashboard/admin',
};

const ROLE_TITLE = {
  member: 'Member',
  curator: 'Kurator',
  admin: 'Admin',
};

const PUBLIC_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jelajahi', href: '/artworks' },
  { label: 'Tantangan', href: '/challenges' },
];

const GOOEY_COLORS = ['#F2C94C', '#79A0E8', '#2856B8'];

function getDashboardDestination(user) {
  if (!user) return '/login';
  if (user.role === 'curator' && user.status !== 'active') {
    return '/dashboard/curator/verification';
  }
  return DASHBOARD_HOME[user.role] || '/';
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

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountMenuRef = useRef(null);
  const avatarBtnRef = useRef(null);

  const isAuthPage =
    pathname === '/login' || pathname.startsWith('/register');
  const activePublicIndex = getActivePublicIndex(pathname);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAccountMenuOpen(false);
        avatarBtnRef.current?.focus();
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [accountMenuOpen]);

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
  const workspaceHref = getDashboardDestination(user);

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
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
            <div ref={accountMenuRef} className="relative">
              <button
                ref={avatarBtnRef}
                type="button"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-label={`Menu akun ${displayName}`}
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-surface/90 p-1 pr-2.5 shadow-card-sm transition-transform hover:-translate-y-px hover:border-brand-400"
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
                  role="menu"
                  aria-label="Menu pengguna"
                  className="modal-in absolute right-0 mt-2 w-60 rounded-[18px] border border-line bg-surface p-2 shadow-modal"
                >
                  <div className="rounded-[14px] bg-brand-50 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink">
                      {displayName}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {ROLE_TITLE[user.role] || user.role} · {statusMeta?.label}
                    </p>
                  </div>

                  <div className="mt-1.5 space-y-1">
                    <Link
                      role="menuitem"
                      href={workspaceHref}
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex min-h-[44px] items-center justify-between rounded-[12px] px-3 text-sm font-semibold text-ink hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span>Ruang saya</span>
                      <span aria-hidden="true">→</span>
                    </Link>

                    {user.role === 'member' ? (
                      <Link
                        role="menuitem"
                        href="/dashboard/member/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex min-h-[44px] items-center justify-between rounded-[12px] px-3 text-sm font-semibold text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                      >
                        <span>Profil &amp; akun</span>
                      </Link>
                    ) : null}

                    <button
                      role="menuitem"
                      type="button"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex min-h-[44px] w-full items-center rounded-[12px] px-3 text-left text-sm font-semibold text-[#FCA5A5] hover:bg-[#38171E] disabled:opacity-50"
                    >
                      {loggingOut ? 'Memproses…' : 'Keluar akun'}
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
        <div className="flex justify-center border-t border-line/60 px-4 py-2 md:hidden">
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
