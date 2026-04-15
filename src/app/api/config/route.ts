import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getLandingConfig, updateConfigSection } from "@/lib/config/get-config";
import { CONFIG_KEYS, type ConfigKey } from "@/lib/config/landing-defaults";
import { success, error } from "@/lib/api-response";

/* ─── GET /api/config — Get full config ───────────── */

export async function GET() {
  try {
    await requireAdmin();
    const config = await getLandingConfig();
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
    const { key, value } = body as { key: string; value: unknown };

    if (!key || !CONFIG_KEYS.includes(key as ConfigKey)) {
      return error(`Invalid config key: ${key}. Valid keys: ${CONFIG_KEYS.join(", ")}`, 400);
    }

    if (value === undefined || value === null) {
      return error("Value is required", 400);
    }

    await updateConfigSection(key as ConfigKey, value);

    return success({ key, updated: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return error("Unauthorized", 401);
    }
    return error("Error interno del servidor", 500);
  }
}
