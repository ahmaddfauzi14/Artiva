'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import ArtivaLogo from '@/components/layout/ArtivaLogo';
import Avatar from '@/components/ui/Avatar';
import {
  Sidebar as WensitySidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  SidebarToggle,
  useSidebar,
} from '@/components/ui/SidebarPrimitive';
import { useToast } from '@/components/ui/Toast';
import { apiFetch } from '@/lib/shared/api-client';
import { ADMIN_SIDEBAR_ITEMS, ROLE_LABELS } from '@/lib/shared/navigation';
import { getStatusMeta } from '@/lib/shared/status-styles';

const ROLE_SPACE_LABEL = {
  admin: 'RUANG ADMIN',
};

function renderMenuIcon(icon) {
  return (
    <HugeiconsIcon
      icon={icon || DashboardSquare01Icon}
      size={18}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}

export function getSidebarMenu(role) {
  return role === 'admin' ? ADMIN_SIDEBAR_ITEMS : [];
}

function SidebarBrandMark({ role, onNavigate }) {
  const { collapsed } = useSidebar();

  if (collapsed) {
    return (
      <div className="flex items-center justify-center">
        <ArtivaLogo size="sm" showWordmark={false} />
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/${role}`}
      onClick={onNavigate}
      className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
    >
      <ArtivaLogo size="sm" showWordmark={false} />
      <div className="min-w-0">
        <span className="block truncate py-[1px] text-[0.875rem] font-bold uppercase leading-snug tracking-[0.16em] text-ink">
          ARTIVA
        </span>
        <span className="block truncate py-[1px] text-[0.625rem] font-semibold uppercase leading-snug tracking-[0.08em] text-brand-700">
          {ROLE_SPACE_LABEL[role] || 'RUANG ADMIN'}
        </span>
      </div>
    </Link>
  );
}

function SidebarUserFooter({ user, loggingOut, onLogout }) {
  const { collapsed } = useSidebar();
  const statusMeta = getStatusMeta('user', user.status);
  const displayName = user.display_name || user.username;

  return (
    <div
      className={`flex w-full items-center ${
        collapsed ? 'flex-col gap-2.5' : 'justify-between gap-2.5'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={displayName} avatarUrl={user.avatar_url} size="sm" />
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate py-[1px] text-[0.78125rem] font-semibold leading-snug text-ink">
              {displayName}
            </p>
            <p className="truncate py-[1px] text-[0.6875rem] leading-snug text-ink-mute">
              {ROLE_LABELS[user.role] || user.role} · {statusMeta?.label}
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        disabled={loggingOut}
        onClick={onLogout}
        aria-label="Keluar akun"
        title="Keluar akun"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--primitive-radius-control-sm,0.625rem)] text-ink-mute transition-colors hover:bg-[var(--primitive-surface-hover)] hover:text-crimson focus-visible:ring-2 focus-visible:ring-brand-700 disabled:pointer-events-none disabled:opacity-40"
      >
        <HugeiconsIcon
          icon={Logout01Icon}
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
    </div>
  );
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

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const currentQuery = searchParams.get('tab') || searchParams.get('view') || '';

  const menuItems = getSidebarMenu(user.role);
  const summaryItems = menuItems.filter((item) => item.section === 'Ringkasan');
  const managementItems = menuItems.filter((item) => item.section !== 'Ringkasan');

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
    if (pathname === item.href) return true;
    if (item.href !== '/challenges' && pathname.startsWith(`${item.href}/`)) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (mobileOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!mobileOpen && dialog.open) {
      dialog.close();
      triggerRef?.current?.focus();
    }

    return undefined;
  }, [mobileOpen, triggerRef]);

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

  const handleItemClick = (href, onAfterNavigate) => (e) => {
    if (
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey &&
      e.button === 0
    ) {
      e.preventDefault();
      router.push(href);
      onAfterNavigate?.();
    }
  };

  const renderNavSections = (onAfterNavigate) => (
    <SidebarNav className="sidebar-nav">
      {summaryItems.length > 0 ? (
        <SidebarSection label="Ringkasan">
          {summaryItems.map((item) => (
            <SidebarItem
              key={item.key}
              href={item.href}
              icon={renderMenuIcon(item.icon)}
              active={isItemActive(item)}
              onClick={handleItemClick(item.href, onAfterNavigate)}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarSection>
      ) : null}

      {managementItems.length > 0 ? (
        <SidebarSection label="Pengelolaan">
          {managementItems.map((item) => (
            <SidebarItem
              key={item.key}
              href={item.href}
              icon={renderMenuIcon(item.icon)}
              active={isItemActive(item)}
              onClick={handleItemClick(item.href, onAfterNavigate)}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarSection>
      ) : null}
    </SidebarNav>
  );

  return (
    <>
      {/* Desktop Sticky Collapsible Sidebar */}
      <div className="hidden shrink-0 self-start sticky top-0 h-dvh lg:block">
        <WensitySidebar
          variant="collapsible"
          collapsed={collapsed}
          onCollapsedChange={() => onToggleCollapse?.()}
          width={234}
          collapsedWidth={58}
          aria-label="Navigasi ruang admin"
          className="backdrop-blur-md"
        >
          <SidebarHeader>
            <SidebarBrandMark role={user.role} />
            <SidebarToggle
              className="ml-auto"
              aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            />
          </SidebarHeader>

          {renderNavSections(undefined)}

          <SidebarFooter className={collapsed ? 'px-2' : undefined}>
            <SidebarUserFooter
              user={user}
              loggingOut={loggingOut}
              onLogout={handleLogout}
            />
          </SidebarFooter>
        </WensitySidebar>
      </div>

      {/* Mobile Native Modal Drawer */}
      <dialog
        ref={dialogRef}
        aria-label="Navigasi ruang admin"
        onCancel={(e) => {
          e.preventDefault();
          onCloseMobile?.();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            onCloseMobile?.();
          }
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-[#060D1C]/70 backdrop:backdrop-blur-xs lg:hidden"
      >
        <WensitySidebar
          variant="default"
          width={245}
          aria-label="Menu ruang admin"
          className="h-dvh shadow-modal"
        >
          <SidebarHeader className="justify-between">
            <SidebarBrandMark role={user.role} onNavigate={onCloseMobile} />
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Tutup menu ruang"
              onClick={() => onCloseMobile?.()}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--primitive-radius-control-sm,0.625rem)] border border-[var(--border)] text-ink-soft transition-colors hover:bg-[var(--primitive-surface-hover)] hover:text-ink"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </SidebarHeader>

          {renderNavSections(onCloseMobile)}

          <SidebarFooter>
            <SidebarUserFooter
              user={user}
              loggingOut={loggingOut}
              onLogout={handleLogout}
            />
          </SidebarFooter>
        </WensitySidebar>
      </dialog>
    </>
  );
}
