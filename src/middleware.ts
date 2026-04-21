import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/", "/login", "/privacy", "/cookies", "/terms", "/api/auth/login", "/api/auth/logout", "/api/contacts", "/api/gallery", "/api/analytics/track", "/api/uploads", "/api/newsletter/subscribe", "/api/newsletter/unsubscribe", "/blog", "/book", "/api/bookings/public", "/api/availability", "/event", "/api/event-leads"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname.startsWith("/login");

  // Authenticated user trying to access login → redirect based on role
  if (isAuthPage && token) {
    try {
      const session = verifyToken(token);
      const target = session.role === "ADMIN" ? "/dashboard" : "/panel";
      return NextResponse.redirect(new URL(target, request.url));
    } catch {
      // Token inválido, permitir login
    }
  }

  // Unauthenticated user trying to access protected route → redirect to login
  if (!isPublic && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce role separation:
  //   - Clients (role USER) cannot access /dashboard
  //   - Admins visiting /panel get bounced to /dashboard
  if (token) {
    try {
      const session = verifyToken(token);
      if (pathname.startsWith("/dashboard") && session.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/panel", request.url));
      }
      if (pathname.startsWith("/panel") && session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Token inválido, middleware dejará pasar y el layout server-side hará el redirect
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public assets
     * - API routes except protected ones
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
