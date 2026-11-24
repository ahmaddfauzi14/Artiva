const TZ = process.env.APP_TIMEZONE || 'Asia/Makassar';

export function todayInTz(tz = TZ) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function toUploadUrl(relativePath) {
  if (!relativePath) return null;
  const normalized = String(relativePath).replace(/\\/g, '/').replace(/^\/+/, '');
  return `/api/uploads/${normalized}`;
}

export function formatDateId(value) {
  if (!value) return '-';
  const str = String(value);
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);
  const date = isDateOnly ? new Date(`${str}T12:00:00Z`) : new Date(str);
  if (Number.isNaN(date.getTime())) return str;

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: isDateOnly ? 'UTC' : TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeId(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateRangeId(startStr, endStr) {
  if (!startStr || !endStr) return '-';
  const s = String(startStr).slice(0, 10);
  const e = String(endStr).slice(0, 10);
  const [sy, sm, sd] = s.split('-').map(Number);
  const [ey, em, ed] = e.split('-').map(Number);

  const sDate = new Date(Date.UTC(sy, sm - 1, sd, 12));
  const eDate = new Date(Date.UTC(ey, em - 1, ed, 12));

  if (sy === ey && sm === em) {
    const monthYear = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    }).format(eDate);
    return `${sd}–${ed} ${monthYear}`;
  }

  if (sy === ey) {
    const sPart = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
    }).format(sDate);
    const ePart = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(eDate);
    return `${sPart} – ${ePart}`;
  }

  return `${formatDateId(s)} – ${formatDateId(e)}`;
}

export function formatNumberId(num) {
  return new Intl.NumberFormat('id-ID').format(Number(num || 0));
}

export function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function getInitials(name) {
  const parts = String(name || 'A').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
