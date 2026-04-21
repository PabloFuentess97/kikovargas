"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════
   Mobile-native toast system with queue
   ═══════════════════════════════════════════════════ */

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, opts: { variant?: ToastVariant; duration?: number } = {}) => {
      const id = nextId++;
      const newToast: Toast = {
        id,
        message,
        variant: opts.variant ?? "success",
        duration: opts.duration ?? 2800,
      };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => remove(id), newToast.duration);
    },
    [remove]
  );

  const success = useCallback((m: string) => toast(m, { variant: "success" }), [toast]);
  const error = useCallback((m: string) => toast(m, { variant: "error" }), [toast]);
  const info = useCallback((m: string) => toast(m, { variant: "info" }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[100] flex flex-col items-center gap-2 px-3"
      style={{
        top: "calc(env(safe-area-inset-top, 0px) + 12px)",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const colors: Record<ToastVariant, { bg: string; border: string; icon: ReactNode }> = {
    success: {
      bg: "bg-gradient-to-r from-[#0f0f12]/95 to-[#141418]/95",
      border: "border-success/40",
      icon: (
        <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
    },
    error: {
      bg: "bg-gradient-to-r from-[#1a0f10]/95 to-[#140f10]/95",
      border: "border-danger/40",
      icon: (
        <svg className="h-4 w-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    info: {
      bg: "bg-gradient-to-r from-[#0f0f12]/95 to-[#141418]/95",
      border: "border-a-accent/40",
      icon: (
        <svg className="h-4 w-4 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
    },
    warning: {
      bg: "bg-gradient-to-r from-[#1a1610]/95 to-[#141210]/95",
      border: "border-warning/40",
      icon: (
        <svg className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  };

  const c = colors[toast.variant];

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border ${c.border} ${c.bg} backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        entered ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
      }`}
    >
      <button
        onClick={onDismiss}
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:scale-[0.98] transition-transform"
      >
        <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-black/40">
          {c.icon}
        </div>
        <p className="flex-1 text-[0.85rem] font-medium text-foreground leading-tight">{toast.message}</p>
      </button>
    </div>
  );
}
