"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/components/admin/ui/toast";

/**
 * Hook to copy text to clipboard with native-like feedback.
 *
 * Features:
 * - Haptic-like feedback via `navigator.vibrate()` when available.
 * - Toast confirmation.
 * - Fallback for environments without Clipboard API.
 * - Per-key copied state (UI can highlight the copied button for 2s).
 */
export function useCopy() {
  const toast = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, opts: { label?: string; key?: string } = {}) => {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }

        // Light haptic feedback on supported devices
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try { navigator.vibrate(12); } catch {}
        }

        const key = opts.key ?? text;
        setCopiedKey(key);
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);

        toast.success(opts.label ?? "Copiado al portapapeles");
      } catch {
        toast.error("No se pudo copiar");
      }
    },
    [toast]
  );

  return { copy, copiedKey };
}
