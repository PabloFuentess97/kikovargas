"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Native-like bottom sheet. Slides up from the bottom, has a drag handle,
 * respects safe-area-inset-bottom, and dismisses on backdrop tap / swipe down.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  if (!mounted && !open) return null;

  return (
    <div className="fixed inset-0 z-[90] md:hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-x border-border bg-a-surface shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          maxHeight: "88vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Title */}
        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card-hover text-muted active:scale-95 transition-transform"
              aria-label="Cerrar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[80vh] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
