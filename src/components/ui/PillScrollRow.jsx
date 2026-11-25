'use client';

import { useEffect, useRef } from 'react';
import './PillScrollRow.css';

export default function PillScrollRow({
  as: Tag = 'div',
  children,
  className = '',
  activeKey,
  ...rest
}) {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    if (CSS.supports('animation-timeline', 'scroll(self inline)')) {
      return undefined;
    }

    const first = scroller.firstElementChild;
    const last = scroller.lastElementChild;
    if (!first || !last) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, intersectionRatio } of entries) {
          if (target === first) {
            scroller.classList.toggle('more-start', intersectionRatio < 1);
          }
          if (target === last) {
            scroller.classList.toggle('more-end', intersectionRatio < 1);
          }
        }
      },
      { root: scroller, threshold: 1, rootMargin: '1px' }
    );

    observer.observe(first);
    if (last !== first) {
      observer.observe(last);
    }

    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || activeKey == null) return;
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    const activeEl = scroller.querySelector(
      '[aria-selected="true"], [aria-current="page"]'
    );
    if (!activeEl) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const fadePad = 44;
    if (elRect.left < scrollerRect.left + fadePad) {
      scroller.scrollBy({
        left: elRect.left - (scrollerRect.left + fadePad),
        behavior: 'auto',
      });
    } else if (elRect.right > scrollerRect.right - fadePad) {
      scroller.scrollBy({
        left: elRect.right - (scrollerRect.right - fadePad),
        behavior: 'auto',
      });
    }
  }, [activeKey]);

  return (
    <Tag
      ref={scrollerRef}
      className={`pill-scroll-row ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
