import {
  Award01Icon,
  Bookmark01Icon,
  DashboardSquare01Icon,
  Flag01Icon,
  Image02Icon,
  SecurityCheckIcon,
  SentIcon,
  Shield01Icon,
  Tag01Icon,
  UserIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';

/**
 * Label peran pengguna yang konsisten di seluruh antarmuka.
 */
export const ROLE_LABELS = {
  member: 'Member',
  curator: 'Kurator',
  admin: 'Admin',
};

/**
 * Tautan navigasi utama di bilah atas untuk seluruh pengunjung.
 */
export const PUBLIC_NAV_ITEMS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jelajahi', href: '/artworks' },
  { label: 'Tantangan', href: '/challenges' },
];

/**
 * Navigasi ruang kerja Member (/me/*).
 */
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

/**
 * Navigasi ruang kerja Kurator aktif (/curator/*).
 */
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

/**
 * Navigasi Kurator yang masih menunggu verifikasi atau mengajukan banding.
 */
export const CURATOR_VERIFICATION_NAV_ITEMS = [
  {
    key: 'verification',
    label: 'Status verifikasi',
    href: '/curator/verification',
    icon: Shield01Icon,
    match: (pathname) => pathname.startsWith('/curator/verification'),
  },
];

/**
 * Mengembalikan daftar menu akun sesuai peran dan status pengguna.
 */
export function getProfileNavItems(user) {
  if (!user) return [];
  if (user.role === 'member') return MEMBER_NAV_ITEMS;
  if (user.role === 'curator') {
    return user.status === 'active'
      ? CURATOR_NAV_ITEMS
      : CURATOR_VERIFICATION_NAV_ITEMS;
  }
  return [];
}

/**
 * Menu sidebar untuk Dashboard Admin (/dashboard/admin/*).
 */
export const ADMIN_SIDEBAR_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: DashboardSquare01Icon,
    section: 'Ringkasan',
  },
  {
    key: 'curators',
    label: 'Verifikasi kurator',
    href: '/dashboard/admin/curators',
    icon: SecurityCheckIcon,
    section: 'Pengelolaan',
  },
  {
    key: 'users',
    label: 'Pengguna',
    href: '/dashboard/admin/users',
    icon: UserMultipleIcon,
    section: 'Pengelolaan',
  },
  {
    key: 'categories',
    label: 'Kategori',
    href: '/dashboard/admin/categories',
    icon: Tag01Icon,
    section: 'Pengelolaan',
  },
  {
    key: 'reports',
    label: 'Moderasi laporan',
    href: '/dashboard/admin/reports',
    icon: Flag01Icon,
    section: 'Pengelolaan',
  },
];
