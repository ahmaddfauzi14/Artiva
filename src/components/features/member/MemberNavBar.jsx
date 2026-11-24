'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MEMBER_NAV_ITEMS } from '@/components/features/member/member-nav';

export default function MemberNavBar() {
  const pathname = usePathname();
  const activeLinkRef = useRef(null);

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, [pathname]);

  return (
    <nav
      aria-label="Navigasi halaman member"
      className="member-nav-scroller -mx-1 flex items-center gap-3 overflow-x-auto px-1 py-1.5 scroll-smooth"
    >
      {MEMBER_NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.key}
            ref={active ? activeLinkRef : undefined}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="member-nav-cta group relative inline-flex min-h-[44px] shrink-0 items-center gap-2 overflow-hidden rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-card-sm motion-safe:transition-all motion-safe:duration-200 ease-[var(--ease-spring)] hover:border-brand-400 hover:bg-brand-50 hover:shadow-card motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-px"
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
