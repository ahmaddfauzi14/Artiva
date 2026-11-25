'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CURATOR_NAV_ITEMS, MEMBER_NAV_ITEMS } from '@/lib/shared/navigation';

const NAV_BY_ROLE = {
  member: { items: MEMBER_NAV_ITEMS, label: 'Navigasi halaman member' },
  curator: { items: CURATOR_NAV_ITEMS, label: 'Navigasi halaman kurator' },
};

/**
 * Deretan tombol pill navigasi untuk ruang kerja Member dan Kurator.
 */
export default function AccountNavPills({ role, items, ariaLabel }) {
  const pathname = usePathname();
  const activeLinkRef = useRef(null);

  const preset = role ? NAV_BY_ROLE[role] : null;
  const navItems = items || preset?.items || [];
  const navLabel = ariaLabel || preset?.label || 'Navigasi akun';

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [pathname]);

  return (
    <nav
      aria-label={navLabel}
      className="member-nav-scroller -mx-1 flex items-center gap-2.5 overflow-x-auto px-1 py-1 scroll-smooth"
    >
      {navItems.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.key}
            ref={active ? activeLinkRef : undefined}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="member-nav-cta group relative inline-flex min-h-[42px] shrink-0 items-center gap-2 overflow-hidden rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-card-sm motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] hover:border-brand-400 hover:bg-brand-50 hover:shadow-card motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px"
          >
            {active ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="relative z-10 inline-flex h-4 w-4 shrink-0 items-center justify-center"
            >
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.9} />
            </span>
            <span className="relative z-10 whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
