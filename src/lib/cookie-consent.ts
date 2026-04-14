const STORAGE_KEY = "cookie-consent";

export type ConsentStatus = "accepted" | "rejected" | "pending";

export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  const val = localStorage.getItem(STORAGE_KEY);
  if (val === "accepted" || val === "rejected") return val;
  return "pending";
}

export function setConsent(status: "accepted" | "rejected") {
  localStorage.setItem(STORAGE_KEY, status);
  window.dispatchEvent(new CustomEvent("consent-change", { detail: status }));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}
