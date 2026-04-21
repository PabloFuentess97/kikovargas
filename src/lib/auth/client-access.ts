import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireClient } from "@/lib/auth/session";
import type { JwtPayload } from "./jwt";

/**
 * Areas of the /panel a client can access.
 * When active = true, ALL areas are allowed.
 * When active = false, only the ones enabled in SiteConfig.inactiveClientAccess.
 */
export type ClientArea = "home" | "workouts" | "tasks" | "diet" | "documents" | "invoices";

export interface ClientAccess {
  active: boolean;
  name: string;
  email: string;
  allowedAreas: Record<ClientArea, boolean>;
}

/** Full access (active clients) */
const FULL_ACCESS: Record<ClientArea, boolean> = {
  home: true,
  workouts: true,
  tasks: true,
  diet: true,
  documents: true,
  invoices: true,
};

/** Defaults for inactive clients — documents + invoices only */
export const DEFAULT_INACTIVE_ACCESS: Record<ClientArea, boolean> = {
  home: true, // always true so they have a landing page
  workouts: false,
  tasks: false,
  diet: false,
  documents: true,
  invoices: true,
};

/** Routes → area mapping */
const ROUTE_TO_AREA: Record<string, ClientArea> = {
  "/panel": "home",
  "/panel/entrenamientos": "workouts",
  "/panel/checklist": "tasks",
  "/panel/dieta": "diet",
  "/panel/documentos": "documents",
  "/panel/facturas": "invoices",
};

/** Map from area → panel URL */
export const AREA_TO_ROUTE: Record<ClientArea, string> = {
  home: "/panel",
  workouts: "/panel/entrenamientos",
  tasks: "/panel/checklist",
  diet: "/panel/dieta",
  documents: "/panel/documentos",
  invoices: "/panel/facturas",
};

/** Load the client's access state from DB + global config */
export async function getClientAccess(session: JwtPayload): Promise<ClientAccess> {
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true, active: true, role: true },
  });

  if (!user || user.role !== "USER") {
    // Shouldn't happen if requireClient was called, but fail safe
    return {
      active: false,
      name: session.email,
      email: session.email,
      allowedAreas: { home: true, workouts: false, tasks: false, diet: false, documents: false, invoices: false },
    };
  }

  if (user.active) {
    return {
      active: true,
      name: user.name,
      email: user.email,
      allowedAreas: FULL_ACCESS,
    };
  }

  // Inactive → read global config
  const config = await prisma.siteConfig.findUnique({ where: { key: "inactiveClientAccess" } });
  const configured = (config?.value as Partial<Record<ClientArea, boolean>> | null) ?? null;

  const allowedAreas: Record<ClientArea, boolean> = {
    ...DEFAULT_INACTIVE_ACCESS,
    ...(configured || {}),
    home: true, // never hide home — we show them a read-only landing
  };

  return { active: false, name: user.name, email: user.email, allowedAreas };
}

/**
 * Call at the top of a client page. Ensures:
 *  - Session exists (requireClient)
 *  - The given area is allowed for this client
 *  - Returns { session, access } for the caller to use
 *
 * If access is denied, redirects to the first allowed area (home fallback).
 */
export async function requireClientArea(
  area: ClientArea,
): Promise<{ session: JwtPayload; access: ClientAccess }> {
  const session = await requireClient();
  const access = await getClientAccess(session);

  if (!access.allowedAreas[area]) {
    const fallback = firstAllowedRoute(access);
    redirect(fallback);
  }

  return { session, access };
}

/** First area the client IS allowed to see, in display order */
export function firstAllowedRoute(access: ClientAccess): string {
  const order: ClientArea[] = ["home", "invoices", "documents", "workouts", "tasks", "diet"];
  for (const area of order) {
    if (access.allowedAreas[area]) return AREA_TO_ROUTE[area];
  }
  return "/panel"; // home is always true in defaults — safety fallback
}

/** Resolve a pathname → area (for middleware / custom logic) */
export function routeToArea(pathname: string): ClientArea | null {
  if (ROUTE_TO_AREA[pathname]) return ROUTE_TO_AREA[pathname];
  for (const [route, area] of Object.entries(ROUTE_TO_AREA)) {
    if (route !== "/panel" && pathname.startsWith(route)) return area;
  }
  return null;
}
