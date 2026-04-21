import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, type JwtPayload } from "./jwt";

const TOKEN_COOKIE = "token";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require a logged-in client user (role = USER).
 * Redirects to /login if no session; redirects admins to /dashboard.
 * Returns the session payload with the client's user id.
 */
export async function requireClient(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/panel");
  }
  if (session.role === "ADMIN") {
    // Admin accessing client area: send them to their own dashboard
    redirect("/dashboard");
  }
  return session;
}
