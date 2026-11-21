'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';

const MotionContext = createContext({
  motionPaused: false,
  reducedMotion: false,
  isMotionActive: true,
  toggleMotion: () => {},
});

const STORAGE_KEY = 'artiva_motion_paused';
const listeners = new Set();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeStorage(callback) {
  listeners.add(callback);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function getPausedSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function getServerPausedSnapshot() {
  return false;
}

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
  const motionPaused = useSyncExternalStore(
    subscribeStorage,
    getPausedSnapshot,
    getServerPausedSnapshot
  );

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedSnapshot,
    getServerReducedSnapshot
  );

  useEffect(() => {
    const paused = motionPaused || reducedMotion;
    document.documentElement.dataset.motion = paused ? 'paused' : 'active';
  }, [motionPaused, reducedMotion]);

  const toggleMotion = useCallback(() => {
    const current = getPausedSnapshot();
    try {
      window.localStorage.setItem(STORAGE_KEY, current ? '0' : '1');
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    notifyListeners();
  }, []);

  const isMotionActive = !motionPaused && !reducedMotion;

  return (
    <MotionContext.Provider
      value={{ motionPaused, reducedMotion, isMotionActive, toggleMotion }}
    >
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  return useContext(MotionContext);
}
