"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BottomSheet } from "@/components/admin/ui/bottom-sheet";

/* ═══════════════════════════════════════════════════════
   Icon primitives
   ═══════════════════════════════════════════════════════ */

const I = {
  dashboard: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
  ),
  analytics: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  posts: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  ideas: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  gallery: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  ),
  bookings: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  events: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  mail: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  users: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  link: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
  clock: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  contact: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  book: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  settings: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  grid: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  logout: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  more: (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  chevronRight: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════
   Full navigation (desktop + sheet)
   ═══════════════════════════════════════════════════════ */

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: I.dashboard },
      { href: "/dashboard/analytics", label: "Analytics", icon: I.analytics },
    ],
  },
  {
    label: "Contenido",
    items: [
      { href: "/dashboard/posts", label: "Posts", icon: I.posts },
      { href: "/dashboard/ideas", label: "Ideas IA", icon: I.ideas },
      { href: "/dashboard/gallery", label: "Galeria", icon: I.gallery },
    ],
  },
  {
    label: "Newsletter",
    items: [
      { href: "/dashboard/newsletter", label: "Campanas", icon: I.mail },
      { href: "/dashboard/subscribers", label: "Suscriptores", icon: I.users },
    ],
  },
  {
    label: "Reservas",
    items: [
      { href: "/dashboard/booking-links", label: "Enlaces", icon: I.link },
      { href: "/dashboard/bookings", label: "Reservas", icon: I.bookings },
      { href: "/dashboard/availability", label: "Disponibilidad", icon: I.clock },
    ],
  },
  {
    label: "Clientes",
    items: [
      { href: "/dashboard/clients", label: "Clientes", icon: I.contact },
    ],
  },
  {
    label: "Eventos",
    items: [
      { href: "/dashboard/event-pages", label: "Landing Pages", icon: I.events },
    ],
  },
  {
    label: "Ayuda",
    items: [
      { href: "/dashboard/knowledge", label: "Guia de uso", icon: I.book },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/dashboard/contacts", label: "Contactos", icon: I.contact },
      { href: "/dashboard/users", label: "Usuarios", icon: I.users },
      { href: "/dashboard/settings", label: "Configuracion", icon: I.settings },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   Bottom tabs (mobile only — 5 principal + "Más")
   ═══════════════════════════════════════════════════════ */

const MOBILE_TABS: { href: string; label: string; icon: ReactNode; matches: string[] }[] = [
  { href: "/dashboard", label: "Inicio", icon: I.dashboard, matches: ["/dashboard"] },
  { href: "/dashboard/clients", label: "Clientes", icon: I.contact, matches: ["/dashboard/clients"] },
  { href: "/dashboard/posts", label: "Posts", icon: I.posts, matches: ["/dashboard/posts", "/dashboard/ideas"] },
  { href: "/dashboard/bookings", label: "Reservas", icon: I.bookings, matches: ["/dashboard/bookings", "/dashboard/booking-links", "/dashboard/availability"] },
  // 5th tab = "Más" (sheet)
];

/* ═══════════════════════════════════════════════════════
   Page title resolver (contextual mobile header)
   ═══════════════════════════════════════════════════════ */

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/posts": "Posts",
  "/dashboard/posts/new": "Nuevo post",
  "/dashboard/ideas": "Ideas IA",
  "/dashboard/gallery": "Galeria",
  "/dashboard/newsletter": "Newsletter",
  "/dashboard/subscribers": "Suscriptores",
  "/dashboard/booking-links": "Enlaces",
  "/dashboard/bookings": "Reservas",
  "/dashboard/availability": "Disponibilidad",
  "/dashboard/event-pages": "Landing Pages",
  "/dashboard/knowledge": "Guia de uso",
  "/dashboard/contacts": "Contactos",
  "/dashboard/clients": "Clientes",
  "/dashboard/clients/new": "Nuevo cliente",
  "/dashboard/users": "Usuarios",
  "/dashboard/settings": "Configuracion",
};

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Dynamic routes — walk up
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    segments.pop();
    const candidate = "/" + segments.join("/");
    if (PAGE_TITLES[candidate]) {
      // Subpage — add a small hint
      if (pathname.includes("/new")) return PAGE_TITLES[candidate] + " · Nuevo";
      return PAGE_TITLES[candidate];
    }
  }
  return "Admin";
}

function isDetailPage(pathname: string): boolean {
  // true if current path is a subpath of a listing (e.g. /dashboard/posts/abc123)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3) return false;
  if (PAGE_TITLES[pathname]) return false;
  return true;
}

/* ═══════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════ */

export function AdminSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Close sheets on route change
  useEffect(() => {
    setMoreOpen(false);
    setUserOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const isTabActive = (tab: typeof MOBILE_TABS[number]) => {
    return tab.matches.some((m) => (m === "/dashboard" ? pathname === m : pathname.startsWith(m)));
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const pageTitle = resolvePageTitle(pathname);
  const showBack = isDetailPage(pathname);

  /* ───── Desktop sidebar ───── */
  const desktopSidebar = (
    <aside className="hidden md:flex w-[250px] shrink-0 flex-col border-r border-border bg-a-surface">
      {/* Brand */}
      <div className="px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-a-accent/10">
            <span className="text-sm font-bold text-a-accent">KV</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">KikoVargas</p>
            <p className="text-[0.65rem] text-muted">Admin Panel</p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-border" />

      <nav className="flex-1 overflow-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-4 h-px bg-border" />

      <div className="p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-a-accent/10 text-xs font-semibold text-a-accent uppercase">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium capitalize">{userName}</p>
            <p className="truncate text-[0.65rem] text-muted">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] font-medium text-muted transition-colors hover:text-danger hover:bg-danger/5"
        >
          <span className="shrink-0">{I.logout}</span>
          Cerrar sesion
        </button>
      </div>
    </aside>
  );

  /* ───── Mobile top bar ───── */
  const mobileTopBar = (
    <header
      className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-border bg-a-surface/95 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center justify-between h-14 px-3">
        {/* Left: back arrow or brand mark */}
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-card-hover active:scale-90 transition-all"
            aria-label="Volver"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-a-accent/10 active:scale-90 transition-transform"
            aria-label="Dashboard"
          >
            <span className="text-xs font-bold text-a-accent">KV</span>
          </Link>
        )}

        {/* Center: page title */}
        <h1 className="text-[0.95rem] font-semibold text-foreground truncate px-2 flex-1 text-center">
          {pageTitle}
        </h1>

        {/* Right: user avatar button */}
        <button
          onClick={() => setUserOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-a-accent/10 text-[0.7rem] font-semibold text-a-accent uppercase active:scale-90 transition-transform"
          aria-label="Mi cuenta"
        >
          {userName.charAt(0)}
        </button>
      </div>
    </header>
  );

  /* ───── Mobile bottom tab bar ───── */
  const mobileBottomBar = (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-a-surface/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-[58px]">
        {MOBILE_TABS.map((tab) => {
          const active = isTabActive(tab);
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
              <span className="text-[0.58rem] font-medium tracking-tight leading-none mt-0.5">{tab.label}</span>
            </Link>
          );
        })}

        {/* "Más" tab */}
        <button
          onClick={() => setMoreOpen(true)}
          className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 px-1 transition-all active:scale-[0.92] ${
            moreOpen ? "text-a-accent" : "text-muted"
          }`}
        >
          <span>{I.grid}</span>
          <span className="text-[0.58rem] font-medium tracking-tight leading-none mt-0.5">Más</span>
        </button>
      </div>
    </nav>
  );

  /* ───── "Más" sheet — full menu ───── */
  const moreSheet = (
    <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Todas las secciones">
      <div className="px-3 pb-6 pt-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted">
              {section.label}
            </p>
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              {section.items.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 h-[52px] active:bg-card-hover transition-colors ${
                      i !== 0 ? "border-t border-border" : ""
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-a-accent/15 text-a-accent" : "bg-background text-muted"}`}>
                      {item.icon}
                    </span>
                    <span className={`flex-1 text-[0.9rem] font-medium ${active ? "text-a-accent" : "text-foreground"}`}>
                      {item.label}
                    </span>
                    <span className="text-muted">{I.chevronRight}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );

  /* ───── User sheet (avatar tap) ───── */
  const userSheet = (
    <BottomSheet open={userOpen} onClose={() => setUserOpen(false)}>
      <div className="px-5 pt-6 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}>
        {/* User card */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-a-accent/15 text-lg font-semibold text-a-accent uppercase">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold capitalize">{userName}</p>
            <p className="truncate text-xs text-muted">{userEmail}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <Link
            href="/dashboard/settings"
            onClick={() => setUserOpen(false)}
            className="flex items-center gap-3 px-4 h-[52px] rounded-xl bg-card border border-border active:bg-card-hover transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted">
              {I.settings}
            </span>
            <span className="flex-1 text-[0.9rem] font-medium text-foreground">Configuracion</span>
            <span className="text-muted">{I.chevronRight}</span>
          </Link>

          <Link
            href="/dashboard/knowledge"
            onClick={() => setUserOpen(false)}
            className="flex items-center gap-3 px-4 h-[52px] rounded-xl bg-card border border-border active:bg-card-hover transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted">
              {I.book}
            </span>
            <span className="flex-1 text-[0.9rem] font-medium text-foreground">Guia de uso</span>
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
      {moreSheet}
      {userSheet}
    </>
  );
}
