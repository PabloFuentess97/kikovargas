import { getSession } from "@/lib/auth/session";
import { getClientAccess, type ClientArea } from "@/lib/auth/client-access";
import { success, error } from "@/lib/api-response";
import type { NextResponse } from "next/server";

/**
 * Server helper used by /api/panel/* route handlers.
 *
 * Ensures:
 *  - there is a valid session
 *  - the caller is either the admin OR the logged-in client
 *  - if the caller is a client, the requested area is allowed
 *    (admins bypass all area checks)
 *
 * Returns either `{ session, access }` or a NextResponse error that the
 * caller should return directly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireClientAreaApi(area: ClientArea): Promise<
  | { ok: true; session: Awaited<ReturnType<typeof getSession>>; access: Awaited<ReturnType<typeof getClientAccess>> }
  | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, response: error("Unauthorized", 401) };
  }

  // Admins have full API access
  if (session.role === "ADMIN") {
    const access = await getClientAccess(session);
    return { ok: true, session, access };
  }

  // Clients: enforce area
  const access = await getClientAccess(session);
  if (!access.allowedAreas[area]) {
    return { ok: false, response: error("Sin acceso a esta area", 403) };
  }

  return { ok: true, session, access };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = success; // keep import for co-location
