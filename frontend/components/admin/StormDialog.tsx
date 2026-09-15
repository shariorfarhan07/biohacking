"use client";

/*
 * Focus-trapped dialog. Rounded white card lifted off a dimmed field with a
 * real shadow — the console's one moment of genuine elevation.
 */

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { StormButton } from "./StormButton";
import { StormIcon } from "./StormIcon";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function StormDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusable?.[0] ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      clearTimeout(timer);
      restoreTo.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="storm-scrim-in absolute inset-0 bg-scrim backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storm-dialog-title"
        aria-describedby={description ? "storm-dialog-description" : undefined}
        tabIndex={-1}
        className={cn(
          "storm-modal-in relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-xl border border-mist bg-elevated p-6 shadow-storm-lg sm:max-w-lg sm:rounded-xl sm:p-7",
          className
        )}
      >
        <div className="flex items-start justify-between gap-6">
          <h2 id="storm-dialog-title" className="storm-title pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-quiet transition-colors hover:bg-paper-lift hover:text-ink"
          >
            <StormIcon name="close" size={18} />
          </button>
        </div>
        {description && (
          <p id="storm-dialog-description" className="storm-prose mt-3 text-rain">
            {description}
          </p>
        )}
        {children && <div className="mt-7 flex flex-col gap-6">{children}</div>}
        {footer && <div className="mt-8 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function StormConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  loading = false,
  confirmDisabled = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <StormDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <StormButton variant="quiet" onClick={onClose} disabled={loading}>
            Cancel
          </StormButton>
          <StormButton
            variant={destructive ? "destructive" : "solid"}
            onClick={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </StormButton>
        </>
      }
    >
      {children}
    </StormDialog>
  );
}
