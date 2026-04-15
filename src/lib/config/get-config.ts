import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CONFIG, type LandingConfig, type ConfigKey } from "./landing-defaults";

/* ─── Get full landing config (merged with defaults) ─────────── */

export async function getLandingConfig(): Promise<LandingConfig> {
  try {
    const rows = await prisma.siteConfig.findMany();

    const dbConfig: Partial<Record<string, unknown>> = {};
    for (const row of rows) {
      dbConfig[row.key] = row.value;
    }

    // Deep merge each section with defaults
    const config: LandingConfig = {
      theme:    { ...DEFAULT_CONFIG.theme, ...(dbConfig.theme as object ?? {}) },
      sections: { ...DEFAULT_CONFIG.sections, ...(dbConfig.sections as object ?? {}) },
      hero:     { ...DEFAULT_CONFIG.hero, ...(dbConfig.hero as object ?? {}) },
      about:    { ...DEFAULT_CONFIG.about, ...(dbConfig.about as object ?? {}) },
      stats:    { ...DEFAULT_CONFIG.stats, ...(dbConfig.stats as object ?? {}) },
      contact:  { ...DEFAULT_CONFIG.contact, ...(dbConfig.contact as object ?? {}) },
      social:   { ...DEFAULT_CONFIG.social, ...(dbConfig.social as object ?? {}) },
      navbar:   { ...DEFAULT_CONFIG.navbar, ...(dbConfig.navbar as object ?? {}) },
      ai:       { ...DEFAULT_CONFIG.ai, ...(dbConfig.ai as object ?? {}) },
    };

    return config;
  } catch {
    // If DB isn't ready yet, return defaults
    return DEFAULT_CONFIG;
  }
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
  await prisma.siteConfig.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  });
}
