'use client';

import { useRouter } from 'next/navigation';

const ROLES = [
  {
    value: 'member',
    href: '/register/member',
    title: 'Member',
    subtitle: 'Bagikan karya & ikut tantangan',
  },
  {
    value: 'curator',
    href: '/register/curator',
    title: 'Kurator',
    subtitle: 'Buat tantangan & pilih pemenang',
  },
];

export default function RoleSelector({ activeRole = 'member', onBeforeSwitch }) {
  const router = useRouter();

  const handleSelect = (role) => {
    if (role.value === activeRole) return;
    onBeforeSwitch?.();
    router.replace(role.href);
  };

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-ink">Pilih peran akun</p>
      <div
        role="radiogroup"
        aria-label="Pilih peran pendaftaran"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {ROLES.map((role) => {
          const selected = role.value === activeRole;
          return (
            <button
              key={role.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelect(role)}
              className={`flex min-h-[72px] items-start gap-3 rounded-[18px] border p-3.5 text-left transition-all duration-150 ${
                selected
                  ? 'border-brand-600 bg-brand-50 shadow-card-sm'
                  : 'border-line bg-surface hover:border-brand-200 hover:bg-brand-50/40'
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected ? 'border-brand-600' : 'border-ink-mute'
                }`}
              >
                {selected ? (
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">
                  {role.title}
                </span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  {role.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-ink-soft">
        {activeRole === 'member'
          ? 'Member dapat berbagi karya dan mengikuti tantangan tanpa pengajuan verifikasi.'
          : 'Pengajuan Kurator akan ditinjau oleh Admin sebelum fitur penyelenggaraan tantangan aktif.'}
      </p>
    </div>
  );
}
