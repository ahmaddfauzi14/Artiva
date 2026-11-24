'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';

const MotionContext = createContext({
  reducedMotion: false,
  isMotionActive: true,
});

const LEGACY_STORAGE_KEY = 'artiva_motion_paused';

function subscribeReducedMotion(callback) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerReducedSnapshot() {
  return false;
}

export function MotionProvider({ children }) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedSnapshot,
    getServerReducedSnapshot
  );

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion
      ? 'paused'
      : 'active';
  }, [reducedMotion]);

  const isMotionActive = !reducedMotion;

  return (
    <MotionContext.Provider value={{ reducedMotion, isMotionActive }}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  return useContext(MotionContext);
}
