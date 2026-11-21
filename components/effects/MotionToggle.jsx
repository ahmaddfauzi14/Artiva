'use client';

import { useMotion } from '@/components/effects/MotionContext';

export default function MotionToggle({ className = '', fullWidth = false }) {
  const { motionPaused, reducedMotion, isMotionActive, toggleMotion } =
    useMotion();

  return (
    <button
      type="button"
      onClick={toggleMotion}
      disabled={reducedMotion}
      aria-pressed={motionPaused}
      title={
        reducedMotion
          ? 'Gerak latar dimatikan oleh pengaturan aksesibilitas perangkat.'
          : isMotionActive
            ? 'Jeda animasi latar aurora'
            : 'Aktifkan kembali animasi latar aurora'
      }
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 shrink-0 rounded-full ${
          isMotionActive ? 'bg-[#2FA862]' : 'bg-[#8B8A9B]'
        }`}
      />
      <span>
        {reducedMotion
          ? 'Gerak dikurangi (sistem)'
          : isMotionActive
            ? 'Jeda gerak latar'
            : 'Aktifkan gerak latar'}
      </span>
    </button>
  );
}
