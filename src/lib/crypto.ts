import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * AES-256-GCM encryption for sensitive config values (API keys, etc.)
 *
 * Uses ENCRYPTION_KEY env var (or falls back to JWT_SECRET) to derive
 * a 256-bit key via scrypt. Each encryption produces a unique IV + auth tag,
 * so the same plaintext never produces the same ciphertext.
 *
 * Ciphertext format: "enc:<iv-hex>:<authTag-hex>:<ciphertext-hex>"
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const PREFIX = "enc:";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ENCRYPTION_KEY or JWT_SECRET (32+ chars) required for encryption");
  }
  // Derive a stable 32-byte key from the secret using scrypt
  return scryptSync(secret, "kikovargas-config-salt", 32);
}

/** Encrypt a plaintext string. Returns prefixed ciphertext. */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${PREFIX}${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/** Decrypt a prefixed ciphertext string. Returns plaintext. */
export function decrypt(ciphertext: string): string {
  if (!ciphertext || !ciphertext.startsWith(PREFIX)) return ciphertext;

  const key = getKey();
  const parts = ciphertext.slice(PREFIX.length).split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/** Check if a value is already encrypted */
export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

/** Mask a string for display: "sk-abc123xyz" → "sk-a••••••xyz" */
export function maskSecret(value: string): string {
  if (!value || value.length < 6) return value ? "••••••" : "";
  const show = Math.min(4, Math.floor(value.length / 4));
  return value.slice(0, show) + "••••••" + value.slice(-show);
}

/* ─── Config-level helpers ──────────────────────────── */

/** Fields that must be encrypted in each config section */
export const SENSITIVE_FIELDS: Record<string, string[]> = {
  ai: ["openaiApiKey"],
  email: ["resendApiKey"],
};

/** Encrypt sensitive fields in a config section before saving to DB */
export function encryptSensitiveFields(
  sectionKey: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fields = SENSITIVE_FIELDS[sectionKey];
  if (!fields) return data;

  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val && !isEncrypted(val)) {
      result[field] = encrypt(val);
    }
  }
  return result;
}

/** Decrypt sensitive fields in a config section after reading from DB */
export function decryptSensitiveFields(
  sectionKey: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fields = SENSITIVE_FIELDS[sectionKey];
  if (!fields) return data;

  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && isEncrypted(val)) {
      try {
        result[field] = decrypt(val);
      } catch {
        // If decryption fails (key changed), clear the value
        result[field] = "";
      }
    }
  }
  return result;
}

/** Mask sensitive fields for API responses (never expose raw keys to frontend) */
export function maskSensitiveFields(
  sectionKey: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const fields = SENSITIVE_FIELDS[sectionKey];
  if (!fields) return data;

  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val) {
      result[field] = maskSecret(val);
    }
  }
  return result;
}
