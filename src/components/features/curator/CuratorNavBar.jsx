'use client';

import AccountNavPills from '@/components/layout/AccountNavPills';
import { CURATOR_NAV_ITEMS } from '@/components/features/curator/curator-nav';

export default function CuratorNavBar() {
  return (
    <AccountNavPills
      items={CURATOR_NAV_ITEMS}
      ariaLabel="Navigasi halaman kurator"
    />
  );
}
