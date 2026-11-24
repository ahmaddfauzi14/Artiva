import {
  Bookmark01Icon,
  Image02Icon,
  SentIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';

export const MEMBER_NAV_ITEMS = [
  {
    key: 'artworks',
    label: 'Karya saya',
    href: '/me/artworks',
    icon: Image02Icon,
    match: (pathname) => pathname.startsWith('/me/artworks'),
  },
  {
    key: 'submissions',
    label: 'Submission',
    href: '/me/submissions',
    icon: SentIcon,
    match: (pathname) => pathname.startsWith('/me/submissions'),
  },
  {
    key: 'favorites',
    label: 'Favorit',
    href: '/me/favorites',
    icon: Bookmark01Icon,
    match: (pathname) => pathname.startsWith('/me/favorites'),
  },
  {
    key: 'profile',
    label: 'Profil',
    href: '/me/profile',
    icon: UserIcon,
    match: (pathname) => pathname.startsWith('/me/profile'),
  },
];
