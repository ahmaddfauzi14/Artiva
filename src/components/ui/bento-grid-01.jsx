'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Globe, Lock, Smartphone } from 'lucide-react';
import { useMotion } from '@/components/effects/MotionContext';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

function useCanAnimate() {
  const prefersReduced = useReducedMotion();
  const { isMotionActive } = useMotion();
  return !prefersReduced && isMotionActive;
}

export function TypeTester({ label = 'Aa', className = '' }) {
  const canAnimate = useCanAnimate();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!canAnimate) return undefined;
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.35 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [canAnimate]);

  const displayScale = canAnimate ? scale : 1;

  return (
    <div className={`flex h-full items-center justify-center ${className}`}>
      <motion.span
        className="font-serif text-6xl font-medium text-ink md:text-7xl"
        animate={{ scale: displayScale }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export function LayoutAnimation({ className = '' }) {
  const canAnimate = useCanAnimate();
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    if (!canAnimate) {
      return undefined;
    }
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [canAnimate]);

  const layouts = ['grid-cols-2', 'grid-cols-3', 'grid-cols-1'];

  return (
    <div className={`flex h-full items-center justify-center ${className}`}>
      <motion.div
        className={`grid ${layouts[layout]} h-full w-full max-w-[148px] content-center gap-1.5`}
        layout={canAnimate}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-5 w-full rounded-md bg-brand-400/25 border border-line/60"
            layout={canAnimate}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function SpeedIndicator({
  value = '100ms',
  label = 'Load Time',
  progress = 100,
  className = '',
}) {
  const canAnimate = useCanAnimate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canAnimate) return undefined;
    const timeout = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timeout);
  }, [canAnimate]);

  const loading = canAnimate && !ready;
  const clampedProgress = Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <div className={`flex h-full flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative flex h-10 w-full items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className="h-8 w-24 rounded bg-ink/10"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              exit={{ opacity: 0, y: -20, position: 'absolute' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <motion.span
              key="text"
              initial={canAnimate ? { y: 20, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              className="tabular-nums font-sans text-3xl font-semibold text-ink md:text-4xl"
            >
              {value}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-brand-50">
        <motion.div
          className="h-full rounded-full bg-brand-700"
          initial={canAnimate ? { width: 0 } : false}
          animate={{ width: loading ? 0 : `${clampedProgress}%` }}
          transition={
            canAnimate
              ? { type: 'spring', stiffness: 100, damping: 15, mass: 1 }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
}

export function SecurityBadge({ count = 3, activeCount, className = '' }) {
  const canAnimate = useCanAnimate();
  const [shields, setShields] = useState(() =>
    Array.from({ length: count }, (_, idx) => ({
      id: idx + 1,
      active: typeof activeCount === 'number' ? idx < activeCount : false,
    }))
  );

  useEffect(() => {
    if (!canAnimate) return undefined;

    const interval = setInterval(() => {
      setShields((prev) => {
        const nextIndex = prev.findIndex((s) => !s.active);
        if (nextIndex === -1) {
          return prev.map((s) => ({ ...s, active: false }));
        }
        return prev.map((s, i) => (i === nextIndex ? { ...s, active: true } : s));
      });
    }, 800);
    return () => clearInterval(interval);
  }, [canAnimate]);

  const visibleShields = canAnimate
    ? shields
    : Array.from({ length: count }, (_, idx) => ({
        id: idx + 1,
        active: typeof activeCount === 'number' ? idx < activeCount : true,
      }));

  return (
    <div className={`flex h-full items-center justify-center gap-2.5 ${className}`}>
      {visibleShields.map((shield) => (
        <motion.div
          key={shield.id}
          className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
            shield.active
              ? 'border-brand-700/50 bg-brand-700/20'
              : 'border-line bg-brand-50/70'
          }`}
          animate={canAnimate ? { scale: shield.active ? 1.08 : 1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Lock
            className={`h-5 w-5 ${
              shield.active ? 'text-brand-700' : 'text-ink-mute'
            }`}
            aria-hidden="true"
          />
        </motion.div>
      ))}
    </div>
  );
}

export function GlobalNetwork({ badgeText, className = '' }) {
  const canAnimate = useCanAnimate();
  const [pulses] = useState([0, 1, 2, 3, 4]);

  return (
    <div className={`relative flex h-full items-center justify-center ${className}`}>
      <div className="relative z-10 flex flex-col items-center gap-2">
        <Globe className="h-14 w-14 text-brand-700" aria-hidden="true" />
        {badgeText ? (
          <span className="tabular-nums rounded-full border border-line bg-canvas/85 px-3 py-0.5 text-xs font-semibold text-ink">
            {badgeText}
          </span>
        ) : null}
      </div>
      {canAnimate &&
        pulses.map((pulse) => (
          <motion.div
            key={pulse}
            className="pointer-events-none absolute h-16 w-16 rounded-full border-2 border-brand-400/35"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: pulse * 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
    </div>
  );
}

const DEFAULT_SLOT_CLASSES = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-2',
  'md:col-span-2 md:row-span-2',
  'md:col-span-2',
  'md:col-span-3',
  'md:col-span-3',
];

const DEFAULT_ITEMS = [
  {
    id: 'typography',
    title: 'Typography',
    description: 'Beautiful, responsive type that scales perfectly.',
    spanClass: 'md:col-span-2 md:row-span-2',
    hoverPreset: 'lift',
    visual: <TypeTester />,
  },
  {
    id: 'layouts',
    title: 'Layouts',
    description: 'Flexible grids that adapt.',
    spanClass: 'md:col-span-2',
    hoverPreset: 'press',
    visual: <LayoutAnimation />,
  },
  {
    id: 'global-cdn',
    title: 'Global CDN',
    description: 'Lightning-fast content delivery worldwide with edge locations.',
    icon: <Globe className="h-5 w-5 text-brand-700" aria-hidden="true" />,
    spanClass: 'md:col-span-2 md:row-span-2',
    hoverPreset: 'lift',
    contentBackdrop: true,
    visual: <GlobalNetwork />,
  },
  {
    id: 'speed',
    title: 'Speed',
    description: 'Blazing fast performance.',
    spanClass: 'md:col-span-2',
    hoverPreset: 'press',
    visual: <SpeedIndicator />,
  },
  {
    id: 'security',
    title: 'Security First',
    description: 'Enterprise-grade encryption and data protection built-in.',
    icon: <Lock className="h-5 w-5 text-brand-700" aria-hidden="true" />,
    spanClass: 'md:col-span-3',
    hoverPreset: 'press',
    visual: <SecurityBadge />,
  },
  {
    id: 'mobile',
    title: 'Mobile Ready',
    description: 'Optimized for all devices and screen sizes.',
    spanClass: 'md:col-span-3',
    hoverPreset: 'press',
    visual: (
      <div className="flex h-full items-center justify-center">
        <Smartphone className="h-14 w-14 text-ink" aria-hidden="true" />
      </div>
    ),
  },
];

function BentoCardShell({ item, index, canAnimate }) {
  const spanClass =
    item.spanClass || DEFAULT_SLOT_CLASSES[index % DEFAULT_SLOT_CLASSES.length];
  const hoverMotion = !canAnimate
    ? undefined
    : item.hoverPreset === 'lift'
      ? { scale: 1.015 }
      : { scale: 0.985 };

  const cardInner = (
    <motion.div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-surface/90 p-6 shadow-card-sm transition-colors hover:border-brand-400/55 hover:bg-brand-50/75 ${
        item.href ? 'cursor-pointer' : ''
      } ${item.cardClassName || ''}`}
      initial={canAnimate ? { opacity: 0, y: 24 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: canAnimate ? index * 0.07 : 0, ease: EASE_OUT_EXPO }}
      whileHover={hoverMotion}
    >
      <div className="flex min-h-[104px] flex-1 items-center justify-center">
        {item.visual}
      </div>

      <div
        className={
          item.contentBackdrop
            ? 'relative z-20 mt-4 rounded-xl bg-surface/80 p-2 backdrop-blur-sm'
            : 'relative z-10 mt-4'
        }
      >
        {item.eyebrow ? (
          <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-brand-700">
            {item.eyebrow}
          </p>
        ) : null}
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink sm:text-xl">
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <span>{item.title}</span>
        </h3>
        {item.description ? (
          <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
        ) : null}
      </div>
    </motion.div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`${spanClass} block rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas`}
      >
        {cardInner}
      </Link>
    );
  }

  return <div className={spanClass}>{cardInner}</div>;
}

export function FeaturesSection({
  eyebrow = 'Features',
  items = DEFAULT_ITEMS,
  fullScreen = true,
  className = '',
}) {
  const canAnimate = useCanAnimate();

  return (
    <section
      className={`${
        fullScreen ? 'flex min-h-screen items-center justify-center px-6 py-24' : ''
      } ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">
        {eyebrow ? (
          <motion.p
            className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute"
            initial={canAnimate ? { opacity: 0, y: 16 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            {eyebrow}
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:auto-rows-[minmax(200px,auto)] md:grid-cols-6">
          {items.map((item, index) => (
            <BentoCardShell
              key={item.id || item.title || index}
              item={item}
              index={index}
              canAnimate={canAnimate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
