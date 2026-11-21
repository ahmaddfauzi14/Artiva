'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CodeIcon,
  FigmaIcon,
  File01Icon,
  FileZipIcon,
  Folder01Icon,
  Image01Icon,
  MusicNote01Icon,
  Note01Icon,
  Pdf01Icon,
  Presentation01Icon,
  Table01Icon,
  Video01Icon,
} from '@hugeicons/core-free-icons';
import { useMotion } from '@/components/effects/MotionContext';
import './AnimatedList.css';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const iconFor = (icon) => {
  switch (icon) {
    case 'folder':
      return Folder01Icon;
    case 'image':
      return Image01Icon;
    case 'figma':
      return FigmaIcon;
    case 'pdf':
      return Pdf01Icon;
    case 'sheet':
      return Table01Icon;
    case 'slides':
      return Presentation01Icon;
    case 'video':
      return Video01Icon;
    case 'audio':
      return MusicNote01Icon;
    case 'code':
      return CodeIcon;
    case 'archive':
      return FileZipIcon;
    case 'note':
      return Note01Icon;
    default:
      return File01Icon;
  }
};

const DEFAULT_ITEMS = [
  { icon: 'folder', title: 'Brand assets', description: '24 files', meta: '2m' },
  { icon: 'image', title: 'Launch hero.png', description: '2.4 MB', meta: '18m' },
  { icon: 'video', title: 'Product tour.mp4', description: '148 MB', meta: '1h' },
  { icon: 'note', title: 'Pricing notes', description: '1,240 words', meta: '3h' },
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const springProgress = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.exp(-6 * t) * Math.cos(7.5 * t);
};

function pose(el, progress, animation) {
  if (!el) return;
  if (animation === 'none') {
    el.style.opacity = '1';
    el.style.transform = 'none';
    return;
  }

  const p = clamp01(progress);
  const eased = easeOutCubic(p);

  if (animation === 'fade') {
    el.style.opacity = eased.toFixed(3);
    el.style.transform = 'none';
    return;
  }

  if (animation === 'slide') {
    const y = (1 - eased) * 18;
    el.style.opacity = eased.toFixed(3);
    el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    return;
  }

  // 'pop'
  const s = 0.88 + 0.12 * springProgress(p);
  const y = (1 - eased) * 12;
  el.style.opacity = eased.toFixed(3);
  el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
}

export default function AnimatedList({
  items = DEFAULT_ITEMS,
  onItemSelect,
  renderItem,
  initialSelectedIndex = -1,
  selectOnHover = true,
  enableArrowNavigation = true,
  loop = false,
  animation = 'pop',
  animateOnce = false,
  stagger = 0.05,
  radius = 16,
  gap = 10,
  maxHeight = 460,
  theme = 'dark',
  accentColor,
  showScrollbar = true,
  showGradients = true,
  padding = 12,
  width = '100%',
  className = '',
  ariaLabel = 'Daftar item',
}) {
  const { isMotionActive } = useMotion();
  const effectiveAnimation = isMotionActive ? animation : 'none';

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [fades, setFades] = useState({ top: false, bottom: false });

  const viewportRef = useRef(null);
  const itemRefs = useRef([]);
  const keyNavRef = useRef(false);

  const settings = {
    items,
    animation: effectiveAnimation,
    animateOnce,
    stagger,
    enableArrowNavigation,
    loop,
    onItemSelect,
  };
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  });

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const animState = new WeakMap();
    let rafId = 0;

    const updateFades = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const hasOverflow = scrollHeight > clientHeight + 2;
      const nextTop = hasOverflow && scrollTop > 4;
      const nextBottom = hasOverflow && scrollTop + clientHeight < scrollHeight - 4;
      setFades((prev) =>
        prev.top === nextTop && prev.bottom === nextBottom
          ? prev
          : { top: nextTop, bottom: nextBottom },
      );
    };

    const tick = (now) => {
      const s = settingsRef.current;
      const els = itemRefs.current;
      const vpRect = viewport.getBoundingClientRect();
      const vpHeight = vpRect.height || 1;
      let anyAnimating = false;

      for (let i = 0; i < els.length; i += 1) {
        const el = els[i];
        if (!el) continue;

        if (s.animation === 'none') {
          pose(el, 1, 'none');
          continue;
        }

        const rect = el.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, vpRect.top);
        const visibleBottom = Math.min(rect.bottom, vpRect.bottom);
        const visiblePx = Math.max(0, visibleBottom - visibleTop);
        const ratio = rect.height > 0 ? visiblePx / rect.height : 1;
        const inView = ratio > 0.08 && rect.top < vpRect.bottom && rect.bottom > vpRect.top;

        let state = animState.get(el);
        if (!state) {
          state = { visible: false, startedAt: 0, locked: false };
          animState.set(el, state);
        }

        if (inView) {
          if (!state.visible) {
            state.visible = true;
            if (!state.locked) {
              const distRatio = clamp01((rect.top - vpRect.top) / vpHeight);
              const delayMs = Math.min(i, 12) * s.stagger * 1000 * (0.35 + distRatio * 0.65);
              state.startedAt = now + delayMs;
            }
          }

          if (state.locked) {
            pose(el, 1, s.animation);
          } else {
            const elapsed = (now - state.startedAt) / 380;
            if (elapsed >= 1) {
              pose(el, 1, s.animation);
              if (s.animateOnce) state.locked = true;
            } else if (elapsed <= 0) {
              pose(el, 0, s.animation);
              anyAnimating = true;
            } else {
              pose(el, elapsed, s.animation);
              anyAnimating = true;
            }
          }
        } else if (!s.animateOnce) {
          state.visible = false;
          pose(el, 0, s.animation);
        }
      }

      if (anyAnimating) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      updateFades();
      scheduleTick();
    };

    updateFades();
    scheduleTick();

    viewport.addEventListener('scroll', onScroll, { passive: true });
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateFades();
        scheduleTick();
      });
      ro.observe(viewport);
    }

    return () => {
      cancelAnimationFrame(rafId);
      viewport.removeEventListener('scroll', onScroll);
      if (ro) ro.disconnect();
    };
  }, [items, effectiveAnimation, animateOnce, stagger]);

  useEffect(() => {
    if (!keyNavRef.current || selectedIndex < 0) return;
    keyNavRef.current = false;
    const viewport = viewportRef.current;
    const el = itemRefs.current[selectedIndex];
    if (!viewport || !el) return;

    const vpTop = viewport.scrollTop;
    const vpBottom = vpTop + viewport.clientHeight;
    const elTop = el.offsetTop - padding;
    const elBottom = el.offsetTop + el.offsetHeight + padding;

    if (elTop < vpTop) {
      viewport.scrollTo({ top: Math.max(0, elTop), behavior: 'smooth' });
    } else if (elBottom > vpBottom) {
      viewport.scrollTo({
        top: elBottom - viewport.clientHeight,
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, padding]);

  const choose = (item, index) => {
    setSelectedIndex(index);
    onItemSelect?.(item, index);
  };

  const handleKeyDown = (event) => {
    const s = settingsRef.current;
    if (!s.enableArrowNavigation || s.items.length === 0) return;

    const target = event.target;
    if (
      target !== viewportRef.current &&
      target instanceof Element &&
      target.closest('button, a, input, select, textarea')
    ) {
      return;
    }

    const count = s.items.length;
    let next = selectedIndex;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      next = selectedIndex < 0 ? 0 : selectedIndex + 1;
      if (next >= count) next = s.loop ? 0 : count - 1;
      keyNavRef.current = true;
      setSelectedIndex(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      next = selectedIndex < 0 ? count - 1 : selectedIndex - 1;
      if (next < 0) next = s.loop ? count - 1 : 0;
      keyNavRef.current = true;
      setSelectedIndex(next);
    } else if (event.key === 'Home') {
      event.preventDefault();
      keyNavRef.current = true;
      setSelectedIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      keyNavRef.current = true;
      setSelectedIndex(count - 1);
    } else if (event.key === 'Enter' && selectedIndex >= 0 && selectedIndex < count) {
      event.preventDefault();
      choose(s.items[selectedIndex], selectedIndex);
    }
  };

  const rootStyle = {
    '--al-radius': `${radius}px`,
    '--al-gap': `${gap}px`,
    '--al-pad': `${padding}px`,
    ...(accentColor ? { '--al-accent': accentColor } : {}),
    width: typeof width === 'number' ? `${width}px` : width,
  };

  const viewportStyle =
    maxHeight === 'none' || maxHeight === null
      ? undefined
      : { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight };

  return (
    <div
      className={[
        'animated-list',
        theme === 'light' ? 'animated-list--light' : '',
        !showScrollbar ? 'animated-list--no-scrollbar' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
    >
      {showGradients && (
        <div
          className="animated-list__fade animated-list__fade--top"
          style={{ opacity: fades.top ? 1 : 0 }}
          aria-hidden="true"
        />
      )}

      <div
        ref={viewportRef}
        className="animated-list__viewport"
        style={viewportStyle}
        tabIndex={enableArrowNavigation ? 0 : undefined}
        role="listbox"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        <ul className="animated-list__track">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            const entry =
              typeof item === 'string' ? { title: item } : item || {};
            const key = entry.id ?? entry.key ?? `${entry.title ?? 'row'}-${index}`;
            const isClickable = Boolean(onItemSelect);

            return (
              <li
                key={key}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                role="option"
                aria-selected={isSelected}
                className={[
                  'animated-list__item',
                  isSelected ? 'animated-list__item--selected' : '',
                  isClickable ? 'animated-list__item--interactive' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => {
                  if (selectOnHover) setSelectedIndex(index);
                }}
                onClick={(event) => {
                  const target = event.target;
                  if (
                    target instanceof Element &&
                    target.closest('button, a, input, select, textarea')
                  ) {
                    setSelectedIndex(index);
                    return;
                  }
                  choose(item, index);
                }}
              >
                {renderItem ? (
                  renderItem(item, index, isSelected)
                ) : (
                  <div className="animated-list__row">
                    {(entry.image || entry.icon) && (
                      <span className="animated-list__leading">
                        {entry.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.image}
                            alt=""
                            className="animated-list__thumb"
                          />
                        ) : typeof entry.icon === 'string' ? (
                          <HugeiconsIcon
                            icon={iconFor(entry.icon)}
                            size={18}
                            strokeWidth={1.8}
                          />
                        ) : (
                          entry.icon
                        )}
                      </span>
                    )}
                    <div className="animated-list__body">
                      <p className="animated-list__title">{entry.title}</p>
                      {entry.description && (
                        <p className="animated-list__desc">{entry.description}</p>
                      )}
                    </div>
                    {entry.meta && (
                      <span className="animated-list__meta">{entry.meta}</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {showGradients && (
        <div
          className="animated-list__fade animated-list__fade--bottom"
          style={{ opacity: fades.bottom ? 1 : 0 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
