# Prompt — Build Authentication System

## Context for LLM

```
Implement a session-based auth system with JWT in httpOnly cookies. Files to create:

**1. src/lib/auth/jwt.ts**
- JwtPayload type: { sub: string, email: string, role: "ADMIN"|"USER", iat, exp }
- signToken(payload): string — HS256, 8h expiration, uses JWT_SECRET env
- verifyToken(token): JwtPayload | null — returns null on any error

**2. src/lib/auth/session.ts**
- getSession(): reads "token" cookie via Next.js cookies() helper, verifies, returns payload or null
- requireAdmin(): calls getSession(), throws "Unauthorized" if null or role !== "ADMIN"

**3. src/lib/api-response.ts**
- success<T>(data, status = 200): NextResponse
- error(message, status = 400): NextResponse

**4. src/lib/crypto.ts**
AES-256-GCM encryption for API keys stored in DB.
See SNAPSHOT/07-security/02-encryption.md for full implementation.
Key functions:
- encrypt(plaintext): "enc:iv:tag:ciphertext"
- decrypt(ciphertext): plaintext
- isEncrypted(val): boolean
- maskSecret(val): "sk-a••••••xyz"
- encryptSensitiveFields(key, data)
- decryptSensitiveFields(key, data)
- maskSensitiveFields(key, data)

SENSITIVE_FIELDS = { ai: ["openaiApiKey"], email: ["resendApiKey"] }

**5. src/middleware.ts**
PUBLIC_PATHS = ["/", "/login", "/privacy", "/cookies", "/terms", "/blog", "/book",
  "/event", "/gallery", "/api/auth/login", "/api/auth/logout", "/api/contacts",
  "/api/gallery", "/api/analytics/track", "/api/uploads/", "/api/newsletter/subscribe",
  "/api/newsletter/unsubscribe", "/api/bookings/public", "/api/availability",
  "/api/event-leads"]

Logic:
- If pathname === "/login" and session exists → redirect to /dashboard
- If path is public → pass through
- If not public and no session → redirect to /login?callbackUrl=<original>
- Otherwise pass through

matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"]

**6. src/app/api/auth/login/route.ts**
POST handler:
- Parse body with loginSchema (email + password min 8)
- Fetch user by email
- bcrypt.compare password
- If valid: signToken, set "token" httpOnly cookie (secure in prod, sameSite: lax, maxAge: 28800)
- Return { name, email, role }
- Errors: 400 invalid body, 401 wrong credentials, 403 inactive user

**7. src/app/api/auth/logout/route.ts**
POST: clear cookie (set empty with maxAge: 0), return { success: true }

**8. src/app/api/auth/me/route.ts**
GET: returns current user from session, or 401

**9. src/app/login/page.tsx**
Client component with email + password form.
- On submit: POST /api/auth/login
- On success: router.push(searchParams.get("callbackUrl") || "/dashboard")
- Show errors inline

**10. src/lib/validations/auth.ts**
```typescript
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
```

All admin API routes start with: `await requireAdmin();` in the try block.
```

## Validation

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kikovargass.com","password":"changeme12345678"}' \
  -c cookies.txt

# Should return { success: true, data: { name, email, role } }
# And set httpOnly cookie "token"

# Verify session
curl http://localhost:3000/api/auth/me -b cookies.txt

# Should return { success: true, data: { id, email, name, role } }

# Test admin endpoint
curl http://localhost:3000/api/posts -b cookies.txt

# Should return all posts (including DRAFT)
```
