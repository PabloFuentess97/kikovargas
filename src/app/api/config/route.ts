import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  getLandingConfig,
  getLandingConfigMasked,
  updateConfigSection,
} from "@/lib/config/get-config";
import { CONFIG_KEYS, type ConfigKey } from "@/lib/config/landing-defaults";
import { SENSITIVE_FIELDS } from "@/lib/crypto";
import { success, error } from "@/lib/api-response";

/* ─── GET /api/config — Get full config (masked) ──── */

export async function GET() {
  try {
    await requireAdmin();
    const config = await getLandingConfigMasked();
    return success(config);
  } catch {
    return error("Unauthorized", 401);
  }
}

/* ─── PATCH /api/config — Update a config section ─── */

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { key, value } = body as { key: string; value: Record<string, unknown> };

    if (!key || !CONFIG_KEYS.includes(key as ConfigKey)) {
      return error(`Invalid config key: ${key}. Valid keys: ${CONFIG_KEYS.join(", ")}`, 400);
    }

    if (value === undefined || value === null) {
      return error("Value is required", 400);
    }

    // If the value contains masked sensitive fields (e.g. "sk-a••••••xyz"),
    // preserve the existing encrypted value from the DB instead of overwriting
    const sensitiveKeys = SENSITIVE_FIELDS[key];
    if (sensitiveKeys) {
      const currentConfig = await getLandingConfig();
      const currentSection = currentConfig[key as ConfigKey] as unknown as Record<string, unknown>;

      for (const field of sensitiveKeys) {
        const incoming = value[field];
        // If the incoming value contains mask characters or is empty, keep existing
        if (
          typeof incoming === "string" &&
          (incoming.includes("••") || incoming === "")
        ) {
          value[field] = currentSection[field] as string;
        }
      }
    }

    await updateConfigSection(key as ConfigKey, value);

    // Bust Next.js cache so landing page reflects changes immediately
    revalidatePath("/", "layout");

    // Return fresh config (masked) so the client can sync state
    const freshConfig = await getLandingConfigMasked();

    return success({ key, updated: true, config: freshConfig });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return error("Unauthorized", 401);
    }
    return error("Error interno del servidor", 500);
  }
}
