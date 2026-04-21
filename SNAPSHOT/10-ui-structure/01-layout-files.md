# UI Structure — Layout Files (Exact Code)

Root layouts wire fonts, metadata, and global analytics. All downstream pages inherit this chrome.

## `src/app/layout.tsx` (Root Layout)

```tsx
import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { PageTracker } from "@/components/analytics/page-tracker";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kiko Vargas | Professional Bodybuilder",
    template: "%s | Kiko Vargas",
  },
  description:
    "IFBB Professional Bodybuilder. Competing, coaching, and building a legacy in the sport of bodybuilding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen overflow-x-hidden">
        <PageTracker />
        <CookieBanner />
        {children}
      </body>
    </html>
  );
}
```

**Key points:**
- `lang="es"` for Spanish
- Font variable names (`--font-oswald`, `--font-inter`) injected as `className` on `<html>`
- `display: "swap"` ensures text is visible during font loading
- `PageTracker` fires `/api/analytics/track` on route changes (client component)
- `CookieBanner` appears once, stored preference in `localStorage`
- `overflow-x-hidden` prevents horizontal scroll from hero parallax

## `src/app/(landing)/layout.tsx` (Landing Segment)

Renders the navbar and footer around all public landing/blog/gallery pages. Fetches config once.

```tsx
import { getLandingConfig } from "@/lib/config/get-config";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const config = await getLandingConfig();

  return (
    <>
      <Navbar config={config.navbar} social={config.social} sections={config.sections} />
      <main>{children}</main>
      <Footer social={config.social} navbar={config.navbar} sections={config.sections} />
    </>
  );
}
```

## `src/app/(admin)/layout.tsx` (Admin Segment)

Server-gated by `requireAdmin()`. Activates the admin theme via `data-theme="admin"`.

```tsx
import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div data-theme="admin" className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <AdminSidebar userName={session.email.split("@")[0]} userEmail={session.email} />
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-6 pt-[4.5rem] md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

**Key points:**
- `data-theme="admin"` swaps CSS variables to admin palette (see `01-design-system/01-colors.md`)
- Sidebar + main area use flexbox
- `pt-[4.5rem]` on mobile to clear the fixed top bar
- `min-w-0` on main prevents flex overflow issues with long content

## `src/app/(auth)/layout.tsx` (Login Segment)

Minimalist — no chrome, dark centered.

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      {children}
    </div>
  );
}
```

## Route Groups Summary

```
src/app/
├── (landing)/              Public site: Navbar + Footer wrapper
│   ├── page.tsx            Home
│   ├── blog/
│   ├── gallery/
│   └── privacy|cookies|terms/
├── (admin)/                Admin panel: Sidebar wrapper, requireAdmin()
│   └── dashboard/
├── (auth)/                 Auth pages: no wrapper
│   └── login/
├── book/[slug]/            Public booking (no landing chrome)
├── event/[slug]/           Public event page (own layout)
└── api/                    API routes (no layout)
```

The parenthesized folders are Next.js route groups — they don't affect the URL but provide separate layouts.
