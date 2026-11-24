'use client';

import AccountNavPills from '@/components/layout/AccountNavPills';
import { MEMBER_NAV_ITEMS } from '@/components/features/member/member-nav';

export default function MemberNavBar() {
  return (
    <AccountNavPills
      items={MEMBER_NAV_ITEMS}
      ariaLabel="Navigasi halaman member"
    />
  );
}
