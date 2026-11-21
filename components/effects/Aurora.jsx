'use client';

import { useEffect, useMemo, useRef } from 'react';
import GridMotion from '@/components/effects/GridMotion';
import { useMotion } from '@/components/effects/MotionContext';

const FALLBACK_TILES = [
  'ARTIVA',
  'RUANG KARYA',
  'PORTOFOLIO',
  'KURASI',
];

export default function Aurora({ backgroundItems = [] }) {
  const containerRef = useRef(null);
  const { isMotionActive } = useMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMotionActive) {
      if (el) {
        el.style.setProperty('--ax', '0px');
        el.style.setProperty('--ay', '0px');
      }
      return undefined;
    }

    const handlePointerMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const nx = e.clientX / Math.max(window.innerWidth, 1) - 0.5;
      const ny = e.clientY / Math.max(window.innerHeight, 1) - 0.5;
      el.style.setProperty('--ax', `${(nx * 28).toFixed(1)}px`);
      el.style.setProperty('--ay', `${(ny * 22).toFixed(1)}px`);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isMotionActive]);

  const tiles = useMemo(() => {
    if (Array.isArray(backgroundItems) && backgroundItems.length > 0) {
      return backgroundItems.map((item) => ({ src: item.src, alt: '' }));
    }
    return FALLBACK_TILES;
  }, [backgroundItems]);

  return (
    <div ref={containerRef} aria-hidden="true" className="aurora">
      <div className="starry-field" />

      <div className="absolute inset-0 opacity-[0.34]">
        <GridMotion
          items={tiles}
          rows={4}
          aspectRatio={1.33}
          gap={16}
          radius={14}
          angle={-12}
          tilt={8}
          speed={isMotionActive ? 20 : 0}
          direction="alternate"
          parallax={isMotionActive ? 0.45 : 0}
          spotlight={isMotionActive ? 0.65 : 0}
          dim={0.48}
          fade={0.62}
          grayscale={false}
          theme="dark"
          tileColor="#101F3D"
          textColor="rgba(247, 243, 230, 0.8)"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 42%, rgba(9, 19, 38, 0.42) 0%, rgba(9, 19, 38, 0.8) 100%)',
          }}
        />
      </div>

      <div className="aurora-parallax">
        <span className="aurora-blob b1" />
        <span className="aurora-blob b2" />
        <span className="aurora-blob b3" />
        <span className="aurora-blob b4" />
      </div>
    </div>
  );
}
