"use client";

/*
 * A generic trigger + floating panel: the header's notification bell and
 * user menu both build on this. Closes on outside click, Escape, and route
 * change; returns focus to the trigger on close so keyboard users never
 * lose their place.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function StormPopover({
  trigger,
  align = "right",
  panelClassName,
  children,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  align?: "left" | "right";
  panelClassName?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close();
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        rootRef.current?.querySelector<HTMLElement>("[data-storm-trigger]")?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, toggle })}
      {open && (
        <div
          className={cn(
            "storm-dropdown-in absolute top-full z-40 mt-2 rounded-lg border border-mist bg-elevated shadow-storm-lg",
            align === "right" ? "right-0" : "left-0",
            panelClassName
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
