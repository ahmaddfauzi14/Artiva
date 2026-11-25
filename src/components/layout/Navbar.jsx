'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  Award01Icon,
  Cancel01Icon,
  CompassIcon,
  Home01Icon,
  Logout01Icon,
  Menu01Icon,
} from '@hugeicons/core-free-icons';
import ArtivaLogo from '@/components/layout/ArtivaLogo';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import GooeyNav from '@/components/effects/GooeyNav';
import './NavbarDrawer.css';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import {
  getProfileNavItems,
  PUBLIC_NAV_ITEMS,
  ROLE_LABELS,
} from '@/lib/shared/navigation';
import { getStatusMeta } from '@/lib/shared/status-styles';

const GOOEY_COLORS = ['#F2C94C', '#79A0E8', '#2856B8'];

const PUBLIC_NAV_ICONS = {
  '/': Home01Icon,
  '/artworks': CompassIcon,
  '/challenges': Award01Icon,
};

function getActivePublicIndex(pathname) {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/artworks')) return 1;
  if (pathname.startsWith('/challenges')) return 2;
  return -1;
}

function DrawerNavLink({ href, icon, label, active, onNavigate }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={`drawer-nav-link flex min-h-[48px] items-center justify-between gap-3 rounded-[14px] border px-3.5 py-2.5 text-[0.9375rem] font-semibold transition-colors ${
        active
          ? 'border-brand-700/75 bg-brand-100 text-brand-700 shadow-card-sm'
          : 'border-transparent text-ink hover:border-brand-400/40 hover:bg-brand-50/80 hover:text-brand-700'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
        >
          <HugeiconsIcon icon={icon} size={19} strokeWidth={1.8} />
        </span>
        <span className="truncate">{label}</span>
      </span>
      {active ? (
        <span
          aria-hidden="true"
          className="h-5 w-1 shrink-0 rounded-full bg-brand-700"
        />
      ) : null}
    </Link>
  );
}

export default function Navbar({ user = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const menuUid = useId();
  const triggerId = `account-trigger-${menuUid}`;
  const menuId = `account-menu-${menuUid}`;
  const mobileDrawerId = `mobile-nav-drawer-${menuUid}`;

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountMenuRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const menuPanelRef = useRef(null);
  const focusFirstOnOpenRef = useRef(false);

  const mobileTriggerRef = useRef(null);
  const mobileDialogRef = useRef(null);
  const mobileScrollerRef = useRef(null);
  const mobileSheetRef = useRef(null);
  const mobileCloseBtnRef = useRef(null);
  const drawerPhaseRef = useRef('closed');
  const restoreFocusOnCloseRef = useRef(true);
  const closeSafetyTimerRef = useRef(null);
  const openRafRef = useRef(0);

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

  const clearDrawerTimers = useCallback(() => {
    if (openRafRef.current) {
      cancelAnimationFrame(openRafRef.current);
      openRafRef.current = 0;
    }
    if (closeSafetyTimerRef.current) {
      clearTimeout(closeSafetyTimerRef.current);
      closeSafetyTimerRef.current = null;
    }
  }, []);

  const finalizeMobileClose = useCallback(
    ({ restoreFocus = restoreFocusOnCloseRef.current } = {}) => {
      clearDrawerTimers();
      const dialog = mobileDialogRef.current;
      drawerPhaseRef.current = 'closed';
      restoreFocusOnCloseRef.current = true;
      setMobileMenuOpen(false);
      if (dialog?.open) {
        dialog.close();
      }
      if (dialog) {
        dialog.style.removeProperty('--drawer-backdrop');
      }
      if (restoreFocus) {
        requestAnimationFrame(() => {
          mobileTriggerRef.current?.focus({ preventScroll: true });
        });
      }
    },
    [clearDrawerTimers]
  );

  const closeMobileDrawer = useCallback(
    ({ restoreFocus = true, immediate = false } = {}) => {
      const dialog = mobileDialogRef.current;
      const scroller = mobileScrollerRef.current;
      restoreFocusOnCloseRef.current = restoreFocus;

      if (!dialog?.open) {
        finalizeMobileClose({ restoreFocus: false });
        return;
      }

      const reduced =
        immediate ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !scroller) {
        finalizeMobileClose({ restoreFocus });
        return;
      }

      if (drawerPhaseRef.current === 'closing') return;
      clearDrawerTimers();
      drawerPhaseRef.current = 'closing';

      if (scroller.scrollLeft <= 1) {
        finalizeMobileClose({ restoreFocus });
        return;
      }

      scroller.scrollTo({ left: 0, behavior: 'auto' });
      closeSafetyTimerRef.current = setTimeout(() => {
        if (drawerPhaseRef.current === 'closing') {
          finalizeMobileClose({ restoreFocus });
        }
      }, 450);
    },
    [clearDrawerTimers, finalizeMobileClose]
  );

  const openMobileDrawer = useCallback(() => {
    const dialog = mobileDialogRef.current;
    const scroller = mobileScrollerRef.current;
    if (!dialog || !scroller || dialog.open) return;

    setAccountMenuOpen(false);
    clearDrawerTimers();
    restoreFocusOnCloseRef.current = true;
    drawerPhaseRef.current = 'opening';
    setMobileMenuOpen(true);

    dialog.showModal();
    scroller.scrollTo({ left: 0, behavior: 'instant' });
    if (!CSS.supports('animation-timeline: scroll()')) {
      dialog.style.setProperty('--drawer-backdrop', '0');
    }
    mobileCloseBtnRef.current?.focus({ preventScroll: true });

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const scrollToOpenStop = () => {
      if (!dialog.open || drawerPhaseRef.current !== 'opening') return;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      scroller.scrollTo({
        left: maxScroll,
        behavior: reduced ? 'instant' : 'auto',
      });
      if (!CSS.supports('animation-timeline: scroll()') && reduced) {
        dialog.style.setProperty('--drawer-backdrop', '1');
      }
      if (reduced || maxScroll <= 0) {
        drawerPhaseRef.current = 'open';
      } else {
        closeSafetyTimerRef.current = setTimeout(() => {
          if (drawerPhaseRef.current === 'opening' && dialog.open) {
            drawerPhaseRef.current = 'open';
          }
        }, 450);
      }
    };

    if (reduced) {
      scrollToOpenStop();
    } else {
      openRafRef.current = requestAnimationFrame(() => {
        openRafRef.current = requestAnimationFrame(scrollToOpenStop);
      });
    }
  }, [clearDrawerTimers]);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    const scroller = mobileScrollerRef.current;
    const sheet = mobileSheetRef.current;
    if (!dialog || !scroller || !sheet) return undefined;

    const visibleThreshold = Math.min(
      0.05,
      1 / Math.max(window.innerWidth, 1)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry || !dialog.open) return;

        if (
          entry.intersectionRatio >= 0.95 &&
          drawerPhaseRef.current === 'opening'
        ) {
          drawerPhaseRef.current = 'open';
          return;
        }

        if (
          entry.intersectionRatio < visibleThreshold &&
          (drawerPhaseRef.current === 'open' ||
            drawerPhaseRef.current === 'closing')
        ) {
          finalizeMobileClose();
        }
      },
      { root: dialog, threshold: [visibleThreshold, 0.95] }
    );
    observer.observe(sheet);

    const handleScrollerScroll = () => {
      if (CSS.supports('animation-timeline: scroll()')) return;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const ratio =
        maxScroll > 0
          ? Math.min(1, Math.max(0, scroller.scrollLeft / maxScroll))
          : 0;
      dialog.style.setProperty('--drawer-backdrop', String(ratio));
    };

    if (!CSS.supports('animation-timeline: scroll()')) {
      scroller.addEventListener('scroll', handleScrollerScroll, {
        passive: true,
      });
    }

    const desktopMedia = window.matchMedia('(min-width: 1024px)');
    const handleDesktopChange = (e) => {
      if (e.matches && dialog.open) {
        finalizeMobileClose({ restoreFocus: false });
      }
    };
    const handlePopState = () => {
      if (dialog.open) {
        finalizeMobileClose({ restoreFocus: false });
      }
    };

    desktopMedia.addEventListener('change', handleDesktopChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearDrawerTimers();
      observer.disconnect();
      scroller.removeEventListener('scroll', handleScrollerScroll);
      desktopMedia.removeEventListener('change', handleDesktopChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [clearDrawerTimers, finalizeMobileClose, isAuthPage]);

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
    if (loggingOut) return false;
    setLoggingOut(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      setAccountMenuOpen(false);
      showToast({
        tone: 'info',
        title: 'Sesi berakhir',
        message: 'Kamu telah keluar dari akun ARTIVA.',
      });
      router.replace('/');
      router.refresh();
      return true;
    } catch (err) {
      showToast({ tone: 'error', message: err.message });
      return false;
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.display_name || user?.username || 'Pengguna';
  const statusMeta = user ? getStatusMeta('user', user.status) : null;

  const sharedGooeyProps = {
    items: PUBLIC_NAV_ITEMS,
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
    <>
      <header className="glass sticky top-0 z-40 border-x-0 border-t-0 border-b border-line">
        <div className="relative z-20 mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="inline-flex min-h-[44px] shrink-0 items-center"
          >
            <ArtivaLogo size="sm" />
          </Link>

          {/* Desktop GooeyNav (>= 1024px) */}
          {!isAuthPage ? (
            <div className="hidden lg:flex lg:items-center">
              <GooeyNav
                {...sharedGooeyProps}
                size="md"
                ariaLabel="Navigasi utama"
              />
            </div>
          ) : null}

          {/* Right Actions + Mobile/Tablet Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
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
                  className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border p-1 pr-2.5 shadow-card-sm transition-all hover:-translate-y-px hover:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
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
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`text-ink-soft transition-transform duration-150 ${
                      accountMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {accountMenuOpen ? (
                  <div
                    id={menuId}
                    ref={menuPanelRef}
                    role="menu"
                    aria-labelledby={triggerId}
                    onKeyDown={handleMenuKeyDown}
                    className="modal-in absolute right-0 z-50 mt-2 max-h-[calc(100dvh-5.5rem)] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[18px] border border-line bg-surface p-2 shadow-modal"
                  >
                    <div className="rounded-[14px] bg-brand-50 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-ink">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        {user.role === 'member' ||
                        (user.role === 'curator' && user.status === 'active')
                          ? `@${user.username}`
                          : `${ROLE_LABELS[user.role] || user.role} · ${statusMeta?.label}`}
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
                                strokeWidth={1.8}
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
                            strokeWidth={1.8}
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

            {/* Mobile & Tablet Hamburger Trigger (< 1024px) */}
            {!isAuthPage ? (
              <button
                ref={mobileTriggerRef}
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-controls={mobileDrawerId}
                aria-label={
                  mobileMenuOpen ? 'Tutup menu navigasi' : 'Menu navigasi'
                }
                onClick={openMobileDrawer}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-brand-400/60 bg-surface/95 px-2.5 text-sm font-semibold text-ink shadow-card-sm transition-colors hover:border-brand-400 hover:bg-brand-50 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas min-[360px]:px-3.5 lg:hidden"
              >
                <HugeiconsIcon
                  icon={Menu01Icon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="hidden min-[360px]:inline">Menu</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Slide-in Navigation Drawer (< 1024px) */}
      {!isAuthPage ? (
        <dialog
          id={mobileDrawerId}
          ref={mobileDialogRef}
          aria-label="Menu navigasi"
          onClose={() => {
            if (drawerPhaseRef.current !== 'closed') {
              finalizeMobileClose({ restoreFocus: false });
            }
          }}
          onCancel={(e) => {
            if (e.cancelable) {
              e.preventDefault();
              closeMobileDrawer({ restoreFocus: true });
            } else {
              finalizeMobileClose({ restoreFocus: true });
            }
          }}
          onClick={(e) => {
            if (
              mobileSheetRef.current &&
              !mobileSheetRef.current.contains(e.target)
            ) {
              closeMobileDrawer({ restoreFocus: true });
            }
          }}
          className="artiva-nav-drawer lg:hidden"
        >
          <div ref={mobileScrollerRef} className="artiva-nav-drawer__scroller">
            <div
              ref={mobileSheetRef}
              className="artiva-nav-drawer__sheet flex flex-col border-l border-brand-400/40 bg-surface text-ink shadow-modal"
            >
              <div className="flex min-h-[64px] shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
                <Link
                  href="/"
                  onClick={() => closeMobileDrawer({ restoreFocus: false })}
                  className="inline-flex min-h-[44px] items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
                >
                  <ArtivaLogo size="sm" />
                </Link>

                <button
                  ref={mobileCloseBtnRef}
                  type="button"
                  aria-label="Tutup menu navigasi"
                  onClick={() => closeMobileDrawer({ restoreFocus: true })}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-brand-400/55 bg-brand-50/80 text-ink transition-colors hover:border-brand-400 hover:bg-brand-100 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto overscroll-y-contain px-4 py-5">
                <nav aria-label="Navigasi seluler">
                  <p className="px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-mute">
                    Navigasi Utama
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {PUBLIC_NAV_ITEMS.map((item, idx) => (
                      <li key={item.href}>
                        <DrawerNavLink
                          href={item.href}
                          icon={PUBLIC_NAV_ICONS[item.href] || Home01Icon}
                          label={item.label}
                          active={idx === activePublicIndex}
                          onNavigate={() =>
                            closeMobileDrawer({ restoreFocus: false })
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </nav>

                {user && profileNavItems?.length > 0 ? (
                  <nav aria-label="Navigasi akun">
                    <p className="px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-mute">
                      Ruang Akun
                    </p>
                    <ul className="mt-2.5 space-y-1.5">
                      {profileNavItems.map((item) => (
                        <li key={item.key}>
                          <DrawerNavLink
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={item.match(pathname)}
                            onNavigate={() =>
                              closeMobileDrawer({ restoreFocus: false })
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-line bg-brand-900/50 p-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-[14px] bg-brand-50/80 px-3 py-2.5">
                      <Avatar
                        name={displayName}
                        avatarUrl={user.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
                          {user.role === 'member' ||
                          (user.role === 'curator' && user.status === 'active')
                            ? `@${user.username}`
                            : `${ROLE_LABELS[user.role] || user.role} · ${statusMeta?.label}`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={async () => {
                        const loggedOut = await handleLogout();
                        if (loggedOut) {
                          finalizeMobileClose({ restoreFocus: false });
                        }
                      }}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#6E2734] bg-[#38171E]/60 px-4 text-sm font-semibold text-[#FCA5A5] transition-colors hover:bg-[#38171E] active:translate-y-px disabled:opacity-50"
                    >
                      <HugeiconsIcon
                        icon={Logout01Icon}
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span>{loggingOut ? 'Memproses…' : 'Keluar akun'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    <Button
                      variant="primary"
                      href="/login"
                      onClick={() =>
                        closeMobileDrawer({ restoreFocus: false })
                      }
                      className="w-full justify-center"
                    >
                      Masuk
                    </Button>
                    <Button
                      variant="secondary"
                      href="/register/member"
                      onClick={() =>
                        closeMobileDrawer({ restoreFocus: false })
                      }
                      className="w-full justify-center"
                    >
                      Daftar Member
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
