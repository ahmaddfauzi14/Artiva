'use client';

import { useEffect, useId, useRef } from 'react';
import Button from '@/components/ui/Button';

function isPointerOutsideDialog(e, dialog) {
  const rect = dialog.getBoundingClientRect();
  return (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  );
}

export default function ConfirmModal({
  open,
  title,
  description,
  infoBox,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  singleAction = false,
  loading = false,
  onConfirm,
  onClose,
  children,
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      if (
        (variant === 'danger' || variant === 'crimson') &&
        !singleAction &&
        cancelBtnRef.current
      ) {
        cancelBtnRef.current.focus();
      } else {
        confirmBtnRef.current?.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, variant, singleAction]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onClose?.();
      }}
      onPointerDown={(e) => {
        const dialog = dialogRef.current;
        pressedOutsideRef.current = Boolean(
          dialog && isPointerOutsideDialog(e, dialog)
        );
      }}
      onPointerUp={(e) => {
        const dialog = dialogRef.current;
        if (
          !loading &&
          pressedOutsideRef.current &&
          dialog &&
          isPointerOutsideDialog(e, dialog)
        ) {
          onClose?.();
        }
        pressedOutsideRef.current = false;
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-[480px] bg-transparent p-0 text-ink backdrop:bg-brand-900/45"
    >
      <div className="modal-in rounded-[28px] bg-surface p-6 shadow-modal sm:p-8">
        <h2
          id={titleId}
          className="text-[22px] font-semibold leading-snug text-ink"
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-2.5 text-base leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}

        {infoBox ? (
          <div className="mt-4 rounded-[18px] bg-brand-50 p-4 text-sm text-ink-soft">
            {infoBox}
          </div>
        ) : null}

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-start">
          <Button
            ref={confirmBtnRef}
            variant={
              variant === 'crimson'
                ? 'crimson'
                : variant === 'danger'
                  ? 'danger'
                  : 'primary'
            }
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          {!singleAction ? (
            <Button
              ref={cancelBtnRef}
              variant="secondary"
              disabled={loading}
              onClick={onClose}
            >
              {cancelLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
