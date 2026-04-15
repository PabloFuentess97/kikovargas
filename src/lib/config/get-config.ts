import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CONFIG, type LandingConfig, type ConfigKey } from "./landing-defaults";
import {
  encryptSensitiveFields,
  decryptSensitiveFields,
  maskSensitiveFields,
} from "@/lib/crypto";

/* ─── Get full landing config (merged with defaults) ─────────── */

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const rows = await prisma.siteConfig.findMany();

    const dbConfig: Partial<Record<string, unknown>> = {};
    for (const row of rows) {
      dbConfig[row.key] = row.value;
    }

    // Deep merge each section with defaults, decrypting sensitive fields
    const config: LandingConfig = {
      theme:    { ...DEFAULT_CONFIG.theme, ...(dbConfig.theme as object ?? {}) },
      sections: { ...DEFAULT_CONFIG.sections, ...(dbConfig.sections as object ?? {}) },
      hero:     { ...DEFAULT_CONFIG.hero, ...(dbConfig.hero as object ?? {}) },
      about:    { ...DEFAULT_CONFIG.about, ...(dbConfig.about as object ?? {}) },
      stats:    { ...DEFAULT_CONFIG.stats, ...(dbConfig.stats as object ?? {}) },
      contact:  { ...DEFAULT_CONFIG.contact, ...(dbConfig.contact as object ?? {}) },
      social:   { ...DEFAULT_CONFIG.social, ...(dbConfig.social as object ?? {}) },
      navbar:   { ...DEFAULT_CONFIG.navbar, ...(dbConfig.navbar as object ?? {}) },
      ai:       decryptSensitiveFields("ai", { ...DEFAULT_CONFIG.ai, ...(dbConfig.ai as object ?? {}) } as Record<string, unknown>) as unknown as LandingConfig["ai"],
      email:    decryptSensitiveFields("email", { ...DEFAULT_CONFIG.email, ...(dbConfig.email as object ?? {}) } as Record<string, unknown>) as unknown as LandingConfig["email"],
    };

    return config;
  } catch {
    // If DB isn't ready yet, return defaults
    return DEFAULT_CONFIG;
  }
}

/* ─── Get full config with sensitive fields masked (for API responses) ── */

export async function getLandingConfigMasked(): Promise<LandingConfig> {
  const config = await getLandingConfig();
  return {
    ...config,
    ai: maskSensitiveFields("ai", config.ai as unknown as Record<string, unknown>) as unknown as LandingConfig["ai"],
    email: maskSensitiveFields("email", config.email as unknown as Record<string, unknown>) as unknown as LandingConfig["email"],
  };
}

/* ─── Get a single config section ─────────────────────────────── */

export async function getConfigSection<K extends ConfigKey>(
  key: K,
): Promise<LandingConfig[K]> {
  const config = await getLandingConfig();
  return config[key];
}

/* ─── Update a config section ─────────────────────────────────── */

export async function updateConfigSection(
  key: ConfigKey,
  value: unknown,
): Promise<void> {
  // Encrypt sensitive fields before saving
  const processed = encryptSensitiveFields(
    key,
    value as Record<string, unknown>,
  );

  await prisma.siteConfig.upsert({
    where: { key },
    update: { value: processed as object },
    create: { key, value: processed as object },
  });
}
