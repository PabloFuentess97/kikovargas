"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BottomSheet } from "@/components/admin/ui/bottom-sheet";

/* ═══════════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════════ */

const I = {
  home: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  dumbbell: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18M18 3v18M3 7.5h3m0 9H3m15-9h3m-3 9h3M6 12h12" />
    </svg>
  ),
  check: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  docs: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  diet: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  receipt: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  logout: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  chevronRight: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  arrowLeft: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  ),
};

type ClientArea = "home" | "workouts" | "tasks" | "diet" | "documents" | "invoices";

interface NavItem {
  area: ClientArea;
  href: string;
  label: string;
  shortLabel: string;
  icon: ReactNode;
}

const ALL_NAV: NavItem[] = [
  { area: "home",       href: "/panel",                 label: "Inicio",         shortLabel: "Inicio",   icon: I.home },
  { area: "workouts",   href: "/panel/entrenamientos",  label: "Entrenamientos", shortLabel: "Entreno",  icon: I.dumbbell },
  { area: "tasks",      href: "/panel/checklist",       label: "Checklist",      shortLabel: "Check",    icon: I.check },
  { area: "diet",       href: "/panel/dieta",           label: "Dieta",          shortLabel: "Dieta",    icon: I.diet },
  { area: "documents",  href: "/panel/documentos",      label: "Documentos",     shortLabel: "Docs",     icon: I.docs },
  { area: "invoices",   href: "/panel/facturas",        label: "Facturas",       shortLabel: "Facturas", icon: I.receipt },
];

const PAGE_TITLES: Record<string, string> = Object.fromEntries(ALL_NAV.map((n) => [n.href, n.label]));

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const candidate = "/" + segments.join("/");
    if (PAGE_TITLES[candidate]) return PAGE_TITLES[candidate];
  }
  return "Panel";
}

function isDetailPage(pathname: string): boolean {
  return !PAGE_TITLES[pathname] && pathname !== "/panel";
}

export function ClientSidebar({
  userName,
  userEmail,
  active,
  allowedAreas,
}: {
  userName: string;
  userEmail: string;
  active: boolean;
  allowedAreas: Record<ClientArea, boolean>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userOpen, setUserOpen] = useState(false);

  // Filter nav by what this client can see
  const NAV = ALL_NAV.filter((n) => allowedAreas[n.area]);
  const MOBILE_TABS = NAV.slice(0, 5);

  useEffect(() => {
    setUserOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/panel") return pathname === "/panel";
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const pageTitle = resolvePageTitle(pathname);
  const showBack = isDetailPage(pathname);

  /* Desktop sidebar */
  const desktopSidebar = (
    <aside className="hidden md:flex w-[250px] shrink-0 flex-col border-r border-border bg-a-surface">
      <div className="px-5 py-5">
        <Link href="/panel" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-a-accent/10 border border-a-accent/15">
            <span className="text-[0.65rem] font-bold text-a-accent uppercase">{userName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight truncate capitalize">{userName}</p>
            <p className="text-[0.65rem] text-muted">Mi panel</p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-border" />

      <nav className="flex-1 overflow-auto px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${isActive(item.href) ? "active" : ""}`}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mx-4 h-px bg-border" />

      <div className="p-3">
        <div className="px-3 py-2 mb-1">
          <p className="truncate text-[0.65rem] text-muted">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-muted transition-colors hover:text-danger hover:bg-danger/5"
        >
          <span className="shrink-0">{I.logout}</span>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );

  /* Mobile top bar */
  const mobileTopBar = (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-a-surface/95 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center justify-between h-14 px-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-card-hover active:scale-90 transition-all"
            aria-label="Volver"
          >
            {I.arrowLeft}
          </button>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-a-accent/10">
            <span className="text-[0.65rem] font-bold text-a-accent uppercase">{userName.charAt(0)}</span>
          </div>
        )}

        <h1 className="text-[0.95rem] font-semibold text-foreground truncate px-2 flex-1 text-center">
          {pageTitle}
        </h1>

        <button
          onClick={() => setUserOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-card-hover active:scale-90 transition-all"
          aria-label="Mi cuenta"
        >
          <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>
    </header>
  );

  /* Mobile bottom tabs */
  const mobileBottomBar = (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-a-surface/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-[58px]">
        {MOBILE_TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 px-1 transition-all active:scale-[0.92] ${
                active ? "text-a-accent" : "text-muted"
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-10 bg-a-accent rounded-b-full" />
              )}
              <span className={active ? "scale-105" : ""}>{tab.icon}</span>
              <span className="text-[0.58rem] font-medium tracking-tight leading-none mt-0.5">{tab.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  /* User sheet */
  const userSheet = (
    <BottomSheet open={userOpen} onClose={() => setUserOpen(false)}>
      <div className="px-5 pt-6 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-a-accent/15 text-lg font-semibold text-a-accent uppercase">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold capitalize">{userName}</p>
            <p className="truncate text-xs text-muted">{userEmail}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/panel/facturas"
            onClick={() => setUserOpen(false)}
            className="flex items-center gap-3 px-4 h-[52px] rounded-xl bg-card border border-border active:bg-card-hover transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted">
              {I.receipt}
            </span>
            <span className="flex-1 text-[0.9rem] font-medium text-foreground">Mis facturas</span>
            <span className="text-muted">{I.chevronRight}</span>
          </Link>

          <Link
            href="/panel/documentos"
            onClick={() => setUserOpen(false)}
            className="flex items-center gap-3 px-4 h-[52px] rounded-xl bg-card border border-border active:bg-card-hover transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted">
              {I.docs}
            </span>
            <span className="flex-1 text-[0.9rem] font-medium text-foreground">Mis documentos</span>
            <span className="text-muted">{I.chevronRight}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 h-[52px] rounded-xl bg-danger/5 border border-danger/20 active:bg-danger/10 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">
              {I.logout}
            </span>
            <span className="flex-1 text-left text-[0.9rem] font-medium text-danger">Cerrar sesion</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );

  return (
    <>
      {mobileTopBar}
      {desktopSidebar}
      {mobileBottomBar}
      {userSheet}
    </>
  );
}
