# Security — Encryption

## Purpose

The application stores third-party API keys (OpenAI, Resend) in the database. These must be encrypted at rest so they're useless if the database is compromised.

**File:** `src/lib/crypto.ts`

## Algorithm

**AES-256-GCM** (authenticated encryption with 256-bit key).

- Key derivation: **scrypt** from `ENCRYPTION_KEY` env var (or `JWT_SECRET` fallback)
- Salt: `"kikovargas-config-salt"` (static — rotate key to invalidate)
- IV: Random 16-byte per encryption
- Auth tag: Built-in GCM authentication tag

## Ciphertext Format

```
enc:<iv-hex>:<authTag-hex>:<ciphertext-hex>
```

Example:
```
enc:a4f3b8c92d01...:7e8f9a0b1c2d...:3f4a5b6c7d8e...
```

## Functions

### encrypt
```typescript
import crypto from "crypto";

const SALT = "kikovargas-config-salt";
const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:";

function deriveKey(): Buffer {
  const password = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET!;
  return crypto.scryptSync(password, SALT, 32);
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const key = deriveKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}
```

### decrypt
```typescript
export function decrypt(ciphertext: string): string {
  if (!ciphertext || !ciphertext.startsWith(PREFIX)) return ciphertext;
  const [, ivHex, tagHex, dataHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const key = deriveKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
```

### isEncrypted
```typescript
export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}
```

### maskSecret
```typescript
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  const first = value.slice(0, 4);
  const last = value.slice(-4);
  return `${first}${"•".repeat(6)}${last}`;
}
// "sk-proj-abc123xyz" → "sk-p••••••3xyz"
```

## Sensitive Fields Configuration

```typescript
export const SENSITIVE_FIELDS: Record<string, string[]> = {
  ai: ["openaiApiKey"],
  email: ["resendApiKey"],
};
```

Only these fields are encrypted. Other config data (theme, text, etc.) is stored as plaintext JSON.

## Helper: encrypt sensitive fields

```typescript
export function encryptSensitiveFields(
  sectionKey: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const fields = SENSITIVE_FIELDS[sectionKey] || [];
  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val && !isEncrypted(val)) {
      result[field] = encrypt(val);
    }
  }
  return result;
}
```

## Helper: decrypt sensitive fields

```typescript
export function decryptSensitiveFields(
  sectionKey: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const fields = SENSITIVE_FIELDS[sectionKey] || [];
  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && isEncrypted(val)) {
      try {
        result[field] = decrypt(val);
      } catch {
        result[field] = "";  // Key rotated, field is now garbage
      }
    }
  }
  return result;
}
```

## Helper: mask sensitive fields

```typescript
export function maskSensitiveFields(
  sectionKey: string,
  data: Record<string, unknown>
): Record<string, unknown> {
  const fields = SENSITIVE_FIELDS[sectionKey] || [];
  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val) {
      result[field] = isEncrypted(val)
        ? maskSecret(decrypt(val))
        : maskSecret(val);
    }
  }
  return result;
}
```

## Usage in API

### GET /api/config
```typescript
const configs = await prisma.siteConfig.findMany();
const result = {};
for (const cfg of configs) {
  result[cfg.key] = maskSensitiveFields(cfg.key, cfg.value as object);
}
return success(result);
```

### PATCH /api/config
```typescript
const { key, value } = body;

// Check if incoming value has a masked field (user didn't change it)
const existing = await prisma.siteConfig.findUnique({ where: { key } });
const sensitiveFields = SENSITIVE_FIELDS[key] || [];

for (const field of sensitiveFields) {
  if (typeof value[field] === "string" && value[field].includes("••")) {
    // Preserve existing encrypted value
    if (existing?.value) {
      value[field] = (existing.value as Record<string, unknown>)[field];
    }
  }
}

// Encrypt new plaintext values
const encrypted = encryptSensitiveFields(key, value);

await prisma.siteConfig.upsert({
  where: { key },
  create: { key, value: encrypted },
  update: { value: encrypted }
});
```

## When Keys Are Actually Used

In AI generation:
```typescript
// Fetch config
const config = await prisma.siteConfig.findUnique({ where: { key: "ai" } });
const aiConfig = decryptSensitiveFields("ai", config.value);

// Now aiConfig.openaiApiKey is plaintext, usable for OpenAI API calls
const apiKey = aiConfig.openaiApiKey || process.env.OPENAI_API_KEY;
```

**Plaintext never leaves the server.** It's only decrypted:
1. At API call time (to pass to OpenAI/Resend)
2. Immediately used
3. Never returned to the frontend

## Key Rotation

Changing `ENCRYPTION_KEY` invalidates all existing encrypted values. The system gracefully handles this by returning empty string for fields that fail to decrypt:

```typescript
try {
  result[field] = decrypt(val);
} catch {
  result[field] = "";  // User must re-enter
}
```

To rotate keys safely:
1. Read all config, decrypt with old key
2. Update `ENCRYPTION_KEY`
3. Re-save all config (encrypts with new key)

## Environment Variables

```bash
# Required (32+ chars)
JWT_SECRET="<random 48 chars>"

# Optional dedicated encryption key (recommended in production)
ENCRYPTION_KEY="<random 48 chars>"
# If not set, falls back to JWT_SECRET
```

Generate with:
```bash
openssl rand -base64 48
```
