import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CONFIG, type LandingConfig, type ConfigKey } from "./landing-defaults";

/* ─── In-memory cache (per-request in serverless, longer in Node) ── */

let _cache: LandingConfig | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

/* ─── Get full landing config (merged with defaults) ─────────── */

export async function getLandingConfig(): Promise<LandingConfig> {
  const now = Date.now();

  // Return cache if fresh
  if (_cache && now - _cacheTime < CACHE_TTL) {
    return _cache;
  }

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
    };

    _cache = config;
    _cacheTime = now;

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

  // Invalidate cache
  _cache = null;
  _cacheTime = 0;
}

/* ─── Invalidate cache (useful after admin updates) ───────────── */

export function invalidateConfigCache(): void {
  _cache = null;
  _cacheTime = 0;
}
