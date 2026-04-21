# Security — Authentication System

## Overview

Session-based auth using **JWT in httpOnly cookies**. Simple, secure, no third-party providers.

## Components

1. **Login endpoint** — POST `/api/auth/login`
2. **Logout endpoint** — POST `/api/auth/logout`
3. **Session reader** — `getSession()` helper (reads cookie, verifies JWT)
4. **Admin guard** — `requireAdmin()` helper (throws if not admin)
5. **Middleware** — `src/middleware.ts` (redirects unauthenticated users)

## Login Flow

```
User submits email + password (/login page)
  ↓
POST /api/auth/login
  ↓
Validate body with Zod (loginSchema)
  ↓
Fetch user by email from DB
  ↓
bcryptjs.compare(password, user.password)
  ↓
If valid, signToken({ sub: user.id, email, role })
  ↓
Set cookie "token":
  - httpOnly: true
  - secure: true (production)
  - sameSite: "lax"
  - maxAge: 28800 (8 hours)
  - path: "/"
  ↓
Return { name, email, role }
```

## JWT Details

**Library:** `jsonwebtoken`
**Algorithm:** HS256
**Secret:** `process.env.JWT_SECRET` (must be 32+ chars)
**Expiration:** 8 hours
**Payload:**
```typescript
{
  sub: string,       // User ID (cuid)
  email: string,
  role: "ADMIN" | "USER",
  iat: number,       // issued at (auto)
  exp: number        // expires (auto)
}
```

### Sign token
```typescript
// src/lib/auth/jwt.ts
import jwt from "jsonwebtoken";

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: "8h"
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}
```

## Session Reader

```typescript
// src/lib/auth/session.ts
import { cookies } from "next/headers";
import { verifyToken, JwtPayload } from "./jwt";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}
```

## Middleware

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/privacy", "/cookies", "/terms",
  "/blog", "/book", "/event", "/gallery",
  "/api/auth/login", "/api/auth/logout",
  "/api/contacts",
  "/api/gallery",
  "/api/analytics/track",
  "/api/uploads/",
  "/api/newsletter/subscribe",
  "/api/newsletter/unsubscribe",
  "/api/bookings/public",
  "/api/availability",
  "/api/event-leads"
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/blog/") || pathname.startsWith("/book/") || pathname.startsWith("/event/"))
    return true;
  if (pathname.startsWith("/api/uploads/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const session = token ? verifyToken(token) : null;

  // Logged-in users visiting /login → redirect to dashboard
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Public routes pass through
  if (isPublic(pathname)) return NextResponse.next();

  // Protected route without session → redirect to login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"]
};
```

## Password Storage

**Algorithm:** bcryptjs
**Rounds:** 12

```typescript
import bcrypt from "bcryptjs";

// Hash on create/change
const hashed = await bcrypt.hash(plaintext, 12);

// Verify on login
const valid = await bcrypt.compare(attempt, user.password);
```

Users are seeded via `prisma/seed.ts` with a hashed default password.

## Cookie Configuration

```typescript
const cookieOptions = {
  httpOnly: true,                 // Not accessible from JS (XSS protection)
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,       // CSRF protection
  maxAge: 60 * 60 * 8,            // 8 hours
  path: "/"
};

// On login:
cookies().set("token", token, cookieOptions);

// On logout:
cookies().set("token", "", { ...cookieOptions, maxAge: 0 });
```

## Login Page (/login)

**File:** `src/app/login/page.tsx`

Simple form:
- Email input (type=email, required)
- Password input (type=password, min=8)
- Submit button

On successful response, redirects to `?callbackUrl` or `/dashboard`.

## Admin API Protection Pattern

Every admin API route starts with:
```typescript
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    // ... business logic
  } catch (err) {
    return error("Unauthorized", 401);
  }
}
```

Or the more common pattern:
```typescript
export async function GET() {
  await requireAdmin();  // Throws if not admin; Next.js converts to 500
  // ... business logic
}
```

## Session Expiration

- JWT includes `exp` claim (8h from issue)
- On request, `verifyToken` returns `null` if expired
- Middleware redirects to `/login?callbackUrl=...`
- After login, user returns to original page

## Potential Improvements (not in current implementation)

- Refresh tokens
- Remember-me (longer expiration)
- Password reset flow
- Rate limiting on login endpoint
- Account lockout after N failed attempts
- 2FA / TOTP
