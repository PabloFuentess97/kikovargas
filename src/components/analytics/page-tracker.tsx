"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    // Small delay to avoid tracking navigations that immediately redirect
    const timeout = setTimeout(() => {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer,
        }),
      }).catch(() => {
        // Silent fail — analytics should never break the app
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
