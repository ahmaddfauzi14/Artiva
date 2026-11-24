import { Award01Icon, UserIcon } from '@hugeicons/core-free-icons';

export const CURATOR_NAV_ITEMS = [
  {
    key: 'challenges',
    label: 'Tantangan',
    href: '/curator/challenges',
    icon: Award01Icon,
    match: (pathname) => pathname.startsWith('/curator/challenges'),
  },
  {
    key: 'profile',
    label: 'Profil',
    href: '/curator/profile',
    icon: UserIcon,
    match: (pathname) => pathname.startsWith('/curator/profile'),
  },
];
