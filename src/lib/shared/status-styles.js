export const STATUS_MAP = {
  challenge: {
    draft: { label: 'Draft', tone: 'warning' },
    open: { label: 'Terbuka', tone: 'success' },
    closed: { label: 'Ditutup', tone: 'neutral' },
    announced: { label: 'Diumumkan', tone: 'info' },
  },
  artwork: {
    published: { label: 'Dipublikasikan', tone: 'success' },
    hidden: { label: 'Disembunyikan', tone: 'neutral' },
    removed: { label: 'Dihapus', tone: 'danger' },
  },
  submission: {
    submitted: { label: 'Terkirim', tone: 'success' },
    withdrawn: { label: 'Ditarik', tone: 'neutral' },
  },
  report: {
    pending: { label: 'Menunggu', tone: 'warning' },
    resolved: { label: 'Selesai', tone: 'success' },
    dismissed: { label: 'Ditolak', tone: 'neutral' },
  },
  verification: {
    pending: { label: 'Menunggu', tone: 'warning' },
    approved: { label: 'Disetujui', tone: 'success' },
    rejected: { label: 'Ditolak', tone: 'danger' },
  },
  user: {
    active: { label: 'Aktif', tone: 'success' },
    pending: { label: 'Menunggu', tone: 'warning' },
    suspended: { label: 'Ditangguhkan', tone: 'danger' },
  },
};

export const TONE_CLASSES = {
  success: {
    bg: 'bg-[#123326]',
    text: 'text-[#8CE6B4]',
    dot: 'bg-[#34D399]',
    border: 'border-[#225941]',
  },
  warning: {
    bg: 'bg-[#332811]',
    text: 'text-[#FCE07A]',
    dot: 'bg-[#F2C94C]',
    border: 'border-[#614A1B]',
  },
  danger: {
    bg: 'bg-[#38171E]',
    text: 'text-[#FCA5A5]',
    dot: 'bg-[#F87171]',
    border: 'border-[#6E2734]',
  },
  neutral: {
    bg: 'bg-[#1B2945]',
    text: 'text-[#CBD6EA]',
    dot: 'bg-[#94A7C9]',
    border: 'border-[#2E426B]',
  },
  info: {
    bg: 'bg-[#142B52]',
    text: 'text-[#9BC4FF]',
    dot: 'bg-[#60A5FA]',
    border: 'border-[#264E91]',
  },
};

export function getStatusMeta(domain, value) {
  const meta = STATUS_MAP[domain]?.[value];
  if (meta) return meta;
  return { label: value || 'Tidak diketahui', tone: 'neutral' };
}
