'use client';

import { useState } from 'react';
import { useMotion } from '@/components/effects/MotionContext';

export default function GlassPanel({
  eyebrow,
  title,
  subtitle,
  badgeSlot,
  actions,
  previewArtwork = null,
  className = '',
}) {
  const { isMotionActive } = useMotion();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handlePointerMove = (e) => {
    if (!isMotionActive || (e.pointerType && e.pointerType !== 'mouse')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
    e.currentTarget.style.setProperty('--mx', `${Math.round(x * 100)}%`);
    e.currentTarget.style.setProperty('--my', `${Math.round(y * 100)}%`);
    setTilt({
      rx: (0.5 - y) * 5,
      ry: (x - 0.5) * 6,
    });
  };

  const resetTilt = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className={`spotlight-surface edge-glow relative overflow-hidden rounded-[28px] bg-grad-hero p-6 shadow-glass sm:p-8 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grad-sheen opacity-80"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-2.5">
          {(eyebrow || badgeSlot) ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-700">
                  {eyebrow}
                </p>
              ) : null}
              {badgeSlot}
            </div>
          ) : null}

          <h1 className="text-[28px] font-semibold leading-tight text-ink sm:text-[36px]">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-base text-ink-soft">{subtitle}</p>
          ) : null}

          {actions ? (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {actions}
            </div>
          ) : null}
        </div>

        {previewArtwork ? (
          <div
            style={
              isMotionActive
                ? {
                    transform: `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotate(2deg)`,
                  }
                : undefined
            }
            className="hidden w-40 shrink-0 rounded-[20px] bg-surface p-2.5 shadow-card lg:block motion-safe:transition-transform motion-safe:duration-200 ease-[var(--ease-spring)]"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[14px] bg-tint-lavender">
              {previewArtwork.image_url ? (
                <img
                  src={previewArtwork.image_url}
                  alt={previewArtwork.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center text-xs font-semibold text-brand-700">
                  {previewArtwork.title}
                </div>
              )}
            </div>
            <p className="mt-2 truncate px-0.5 text-xs font-semibold text-ink">
              {previewArtwork.title}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
