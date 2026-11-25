'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

const ToastContext = createContext({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_STYLES = {
  success: {
    border: 'border-[#225941]',
    dot: 'bg-[#34D399]',
    title: 'text-[#8CE6B4]',
  },
  error: {
    border: 'border-[#6E2734]',
    dot: 'bg-[#F87171]',
    title: 'text-[#FCA5A5]',
  },
  warning: {
    border: 'border-[#614A1B]',
    dot: 'bg-[#F2C94C]',
    title: 'text-[#FCE07A]',
  },
  info: {
    border: 'border-[#264E91]',
    dot: 'bg-[#60A5FA]',
    title: 'text-[#9BC4FF]',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, tone = 'success', duration = 5000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, message, tone }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:top-5 sm:right-5 sm:bottom-auto sm:w-96"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.tone] || TOAST_STYLES.info;
          const isError = toast.tone === 'error';
          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              className={`rise pointer-events-auto flex items-start gap-3 rounded-[18px] border ${style.border} bg-surface p-4 shadow-card`}
            >
              <span
                aria-hidden="true"
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
              />
              <div className="min-w-0 flex-1">
                {toast.title ? (
                  <p className={`text-sm font-semibold ${style.title}`}>
                    {toast.title}
                  </p>
                ) : null}
                <p className="text-sm text-ink-soft">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Tutup pemberitahuan"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-mute hover:bg-brand-50 hover:text-ink"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
