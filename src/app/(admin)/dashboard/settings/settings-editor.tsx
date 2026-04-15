"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LandingConfig, ConfigKey } from "@/lib/config/landing-defaults";
import { DEFAULT_CONFIG } from "@/lib/config/landing-defaults";
import { Card, CardHeader, CardContent, Button, FormLabel } from "@/components/admin/ui";

type Tab = "theme" | "sections" | "hero" | "about" | "stats" | "contact" | "social" | "navbar" | "ai";

const TABS: { key: Tab; label: string }[] = [
  { key: "theme", label: "Colores" },
  { key: "sections", label: "Secciones" },
  { key: "hero", label: "Hero" },
  { key: "about", label: "Sobre mi" },
  { key: "stats", label: "Estadisticas" },
  { key: "contact", label: "Contacto" },
  { key: "social", label: "Redes" },
  { key: "navbar", label: "Navbar" },
  { key: "ai", label: "IA" },
];

export function SettingsEditor({ initialConfig }: { initialConfig: LandingConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [tab, setTab] = useState<Tab>("theme");
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");

  const saveSection = useCallback(async (key: ConfigKey, value: unknown) => {
    setSaving(key);
    setError("");
    setSaved(null);

    try {
      const res = await fetch("/api/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      // Sync local state with the fresh config returned by the server
      // This prevents stale state after router.refresh() reconciles
      if (data.data?.config) {
        setConfig(data.data.config as LandingConfig);
      }

      setSaved(key);
      router.refresh();
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setSaving(null);
    }
  }, [router]);

  const update = useCallback(<K extends keyof LandingConfig>(
    section: K,
    field: string,
    value: unknown,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  const resetSection = useCallback((key: ConfigKey) => {
    setConfig((prev) => ({
      ...prev,
      [key]: DEFAULT_CONFIG[key],
    }));
  }, []);

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-lg bg-a-surface border border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t.key
                ? "bg-a-accent text-black"
                : "text-muted hover:text-foreground hover:bg-card-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Tab content */}
      <div className="space-y-6">
        {tab === "theme" && (
          <ThemeTab
            theme={config.theme}
            onChange={(field, value) => update("theme", field, value)}
            onSave={() => saveSection("theme", config.theme)}
            onReset={() => resetSection("theme")}
            saving={saving === "theme"}
            saved={saved === "theme"}
          />
        )}
        {tab === "sections" && (
          <SectionsTab
            sections={config.sections}
            onChange={(field, value) => update("sections", field, value)}
            onSave={() => saveSection("sections", config.sections)}
            saving={saving === "sections"}
            saved={saved === "sections"}
          />
        )}
        {tab === "hero" && (
          <TextFieldsTab
            sectionKey="hero"
            title="Seccion Hero"
            description="El banner principal del landing page."
            fields={[
              { key: "title", label: "Titulo (linea 1)", value: config.hero.title },
              { key: "titleAccent", label: "Titulo (linea 2, acento)", value: config.hero.titleAccent },
              { key: "tagline", label: "Tagline", value: config.hero.tagline },
              { key: "ctaText", label: "Texto del boton CTA", value: config.hero.ctaText },
              { key: "ctaHref", label: "Enlace del boton CTA", value: config.hero.ctaHref },
              { key: "backgroundImage", label: "Imagen de fondo (URL)", value: config.hero.backgroundImage },
            ]}
            onChange={(field, value) => update("hero", field, value)}
            onSave={() => saveSection("hero", config.hero)}
            onReset={() => resetSection("hero")}
            saving={saving === "hero"}
            saved={saved === "hero"}
          />
        )}
        {tab === "about" && (
          <AboutTab
            about={config.about}
            onChange={(field, value) => update("about", field, value)}
            onSave={() => saveSection("about", config.about)}
            onReset={() => resetSection("about")}
            saving={saving === "about"}
            saved={saved === "about"}
          />
        )}
        {tab === "stats" && (
          <StatsTab
            stats={config.stats}
            onChange={(items) => setConfig((prev) => ({ ...prev, stats: { items } }))}
            onSave={() => saveSection("stats", config.stats)}
            onReset={() => resetSection("stats")}
            saving={saving === "stats"}
            saved={saved === "stats"}
          />
        )}
        {tab === "contact" && (
          <TextFieldsTab
            sectionKey="contact"
            title="Seccion Contacto"
            description="Texto del formulario de contacto."
            fields={[
              { key: "heading", label: "Encabezado", value: config.contact.heading },
              { key: "headingAccent", label: "Encabezado (acento)", value: config.contact.headingAccent },
              { key: "description", label: "Descripcion", value: config.contact.description, multiline: true },
              { key: "email", label: "Email de contacto", value: config.contact.email },
              { key: "ctaText", label: "Texto del boton", value: config.contact.ctaText },
            ]}
            onChange={(field, value) => update("contact", field, value)}
            onSave={() => saveSection("contact", config.contact)}
            onReset={() => resetSection("contact")}
            saving={saving === "contact"}
            saved={saved === "contact"}
          />
        )}
        {tab === "social" && (
          <TextFieldsTab
            sectionKey="social"
            title="Redes Sociales"
            description="URLs y handles de redes sociales."
            fields={[
              { key: "instagram", label: "Instagram URL", value: config.social.instagram },
              { key: "instagramHandle", label: "Instagram Handle", value: config.social.instagramHandle },
              { key: "youtube", label: "YouTube URL", value: config.social.youtube },
              { key: "youtubeHandle", label: "YouTube Handle", value: config.social.youtubeHandle },
              { key: "tiktok", label: "TikTok URL", value: config.social.tiktok },
              { key: "tiktokHandle", label: "TikTok Handle", value: config.social.tiktokHandle },
            ]}
            onChange={(field, value) => update("social", field, value)}
            onSave={() => saveSection("social", config.social)}
            onReset={() => resetSection("social")}
            saving={saving === "social"}
            saved={saved === "social"}
          />
        )}
        {tab === "navbar" && (
          <TextFieldsTab
            sectionKey="navbar"
            title="Barra de Navegacion"
            description="Marca y texto del CTA."
            fields={[
              { key: "brandFirst", label: "Marca (primera parte)", value: config.navbar.brandFirst },
              { key: "brandSecond", label: "Marca (segunda parte)", value: config.navbar.brandSecond },
              { key: "ctaText", label: "Texto del boton CTA", value: config.navbar.ctaText },
            ]}
            onChange={(field, value) => update("navbar", field, value)}
            onSave={() => saveSection("navbar", config.navbar)}
            onReset={() => resetSection("navbar")}
            saving={saving === "navbar"}
            saved={saved === "navbar"}
          />
        )}
        {tab === "ai" && (
          <AITab
            ai={config.ai}
            onChange={(field, value) => update("ai", field, value)}
            onSave={() => saveSection("ai", config.ai)}
            onReset={() => resetSection("ai")}
            saving={saving === "ai"}
            saved={saved === "ai"}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Tab Components
   ═══════════════════════════════════════════════════════ */

/* ─── Save Bar ────────────────────────────────────── */

function SaveBar({ onSave, onReset, saving, saved }: {
  onSave: () => void; onReset?: () => void; saving: boolean; saved: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border">
      <Button onClick={onSave} loading={saving}>
        {saved ? "Guardado" : "Guardar cambios"}
      </Button>
      {onReset && (
        <Button variant="ghost" onClick={onReset}>
          Restaurar defecto
        </Button>
      )}
      {saved && (
        <span className="text-xs text-success font-medium">Guardado correctamente</span>
      )}
    </div>
  );
}

/* ─── Theme Tab ───────────────────────────────────── */

function ThemeTab({ theme, onChange, onSave, onReset, saving, saved }: {
  theme: LandingConfig["theme"];
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const colors = [
    { key: "accentColor", label: "Color de acento", hint: "Color principal (dorado)" },
    { key: "accentHover", label: "Acento hover", hint: "Al pasar el mouse" },
    { key: "bgVoid", label: "Fondo principal", hint: "Color mas oscuro" },
    { key: "bgSurface", label: "Fondo superficie", hint: "Secciones alternas" },
    { key: "bgElevated", label: "Fondo elevado", hint: "Cards y elementos" },
    { key: "textPrimary", label: "Texto principal", hint: "Titulos y texto" },
    { key: "textSecondary", label: "Texto secundario", hint: "Subtitulos" },
  ];

  return (
    <Card>
      <CardHeader title="Paleta de Colores" />
      <CardContent>
        <p className="text-sm text-muted mb-6">Personaliza los colores del landing page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {colors.map((c) => (
            <div key={c.key}>
              <FormLabel>{c.label}</FormLabel>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={(theme as unknown as Record<string, string>)[c.key] || "#000000"}
                  onChange={(e) => onChange(c.key, e.target.value)}
                  className="h-10 w-14 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={(theme as unknown as Record<string, string>)[c.key] || ""}
                  onChange={(e) => onChange(c.key, e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
              <p className="mt-1 text-[0.6rem] text-muted/60">{c.hint}</p>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 rounded-lg border border-border" style={{ background: theme.bgVoid }}>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted mb-3">Vista previa</p>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: theme.accentColor, color: theme.bgVoid }}>
              KV
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Kiko Vargas</p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>IFBB Pro Bodybuilder</p>
            </div>
            <div className="ml-auto px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ background: theme.accentColor, color: theme.bgVoid }}>
              CTA
            </div>
          </div>
        </div>

        <SaveBar onSave={onSave} onReset={onReset} saving={saving} saved={saved} />
      </CardContent>
    </Card>
  );
}

/* ─── Sections Tab ────────────────────────────────── */

function SectionsTab({ sections, onChange, onSave, saving, saved }: {
  sections: LandingConfig["sections"];
  onChange: (field: string, value: boolean) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const items = [
    { key: "hero", label: "Hero", desc: "Banner principal con titulo y CTA" },
    { key: "about", label: "Sobre mi", desc: "Biografia, foto y metricas" },
    { key: "stats", label: "Estadisticas", desc: "Barra de contadores animados" },
    { key: "gallery", label: "Galeria", desc: "Grid de imagenes con lightbox" },
    { key: "achievements", label: "Logros", desc: "Timeline de competencias" },
    { key: "blog", label: "Blog", desc: "Ultimos posts del blog" },
    { key: "contact", label: "Contacto", desc: "Formulario y datos de contacto" },
  ];

  return (
    <Card>
      <CardHeader title="Visibilidad de Secciones" />
      <CardContent>
        <p className="text-sm text-muted mb-6">Activa o desactiva secciones del landing page.</p>
        <div className="space-y-1">
          {items.map((item) => {
            const enabled = (sections as unknown as Record<string, boolean>)[item.key] ?? true;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 px-4 rounded-lg transition-colors hover:bg-card-hover"
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <button
                  onClick={() => onChange(item.key, !enabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    enabled ? "bg-a-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
        <SaveBar onSave={onSave} saving={saving} saved={saved} />
      </CardContent>
    </Card>
  );
}

/* ─── Generic Text Fields Tab ─────────────────────── */

interface FieldDef {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
}

function TextFieldsTab({ title, description, fields, onChange, onSave, onReset, saving, saved }: {
  sectionKey: string;
  title: string;
  description: string;
  fields: FieldDef[];
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <p className="text-sm text-muted mb-6">{description}</p>
        <div className="space-y-5">
          {fields.map((f) => (
            <div key={f.key}>
              <FormLabel>{f.label}</FormLabel>
              {f.multiline ? (
                <textarea
                  value={f.value}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-sm resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <SaveBar onSave={onSave} onReset={onReset} saving={saving} saved={saved} />
      </CardContent>
    </Card>
  );
}

/* ─── About Tab (with paragraphs + metrics) ───────── */

function AboutTab({ about, onChange, onSave, onReset, saving, saved }: {
  about: LandingConfig["about"];
  onChange: (field: string, value: unknown) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Seccion Sobre Mi — Textos" />
        <CardContent>
          <div className="space-y-5">
            <div>
              <FormLabel>Encabezado (linea 1)</FormLabel>
              <input type="text" value={about.heading} onChange={(e) => onChange("heading", e.target.value)} className="w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <FormLabel>Encabezado (acento)</FormLabel>
              <input type="text" value={about.headingAccent} onChange={(e) => onChange("headingAccent", e.target.value)} className="w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <FormLabel>Encabezado (linea 3)</FormLabel>
              <input type="text" value={about.headingSuffix} onChange={(e) => onChange("headingSuffix", e.target.value)} className="w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <FormLabel>Imagen del retrato (URL)</FormLabel>
              <input type="text" value={about.portraitImage} onChange={(e) => onChange("portraitImage", e.target.value)} className="w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <FormLabel>Etiqueta de ano</FormLabel>
              <input type="text" value={about.yearLabel} onChange={(e) => onChange("yearLabel", e.target.value)} className="w-full px-4 py-3 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Parrafos" />
        <CardContent>
          <div className="space-y-4">
            {about.paragraphs.map((p, i) => (
              <div key={i}>
                <FormLabel>Parrafo {i + 1}</FormLabel>
                <textarea
                  value={p}
                  onChange={(e) => {
                    const newParagraphs = [...about.paragraphs];
                    newParagraphs[i] = e.target.value;
                    onChange("paragraphs", newParagraphs);
                  }}
                  rows={3}
                  className="w-full px-4 py-3 text-sm resize-none"
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onChange("paragraphs", [...about.paragraphs, ""])}
              >
                + Agregar parrafo
              </Button>
              {about.paragraphs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange("paragraphs", about.paragraphs.slice(0, -1))}
                >
                  Eliminar ultimo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Metricas" />
        <CardContent>
          <div className="space-y-4">
            {about.metrics.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Numero {i + 1}</FormLabel>
                  <input
                    type="text"
                    value={m.num}
                    onChange={(e) => {
                      const newMetrics = [...about.metrics];
                      newMetrics[i] = { ...m, num: e.target.value };
                      onChange("metrics", newMetrics);
                    }}
                    className="w-full px-4 py-3 text-sm"
                    placeholder="15+"
                  />
                </div>
                <div>
                  <FormLabel>Etiqueta {i + 1}</FormLabel>
                  <input
                    type="text"
                    value={m.text}
                    onChange={(e) => {
                      const newMetrics = [...about.metrics];
                      newMetrics[i] = { ...m, text: e.target.value };
                      onChange("metrics", newMetrics);
                    }}
                    className="w-full px-4 py-3 text-sm"
                    placeholder="Anos compitiendo"
                  />
                </div>
              </div>
            ))}
          </div>
          <SaveBar onSave={onSave} onReset={onReset} saving={saving} saved={saved} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── AI Settings Tab ────────────────────────────── */

function AITab({ ai, onChange, onSave, onReset, saving, saved }: {
  ai: LandingConfig["ai"];
  onChange: (field: string, value: unknown) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Configuracion de IA" />
        <CardContent>
          <p className="text-sm text-muted mb-6">
            Configura el proveedor de IA para generar articulos de blog automaticamente.
          </p>

          {/* Provider selector */}
          <div className="mb-6">
            <FormLabel>Proveedor</FormLabel>
            <div className="flex gap-2">
              {(["openai", "local"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange("provider", p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    ai.provider === p
                      ? "bg-a-accent text-black"
                      : "bg-a-surface border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {p === "openai" ? "OpenAI" : "Local (Ollama)"}
                </button>
              ))}
            </div>
          </div>

          {/* OpenAI settings */}
          {ai.provider === "openai" && (
            <div className="space-y-4 mb-6">
              <div>
                <FormLabel>API Key</FormLabel>
                <input
                  type="password"
                  value={ai.openaiApiKey}
                  onChange={(e) => onChange("openaiApiKey", e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono"
                  placeholder="sk-..."
                />
                <p className="mt-1 text-[0.6rem] text-muted/60">
                  Obtenerla en platform.openai.com/api-keys
                </p>
              </div>
              <div>
                <FormLabel>Modelo</FormLabel>
                <select
                  value={ai.openaiModel}
                  onChange={(e) => onChange("openaiModel", e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (rapido, economico)</option>
                  <option value="gpt-4o">GPT-4o (mejor calidad)</option>
                  <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                  <option value="gpt-4.1">GPT-4.1</option>
                </select>
              </div>
            </div>
          )}

          {/* Local settings */}
          {ai.provider === "local" && (
            <div className="space-y-4 mb-6">
              <div>
                <FormLabel>Endpoint</FormLabel>
                <input
                  type="url"
                  value={ai.localEndpoint}
                  onChange={(e) => onChange("localEndpoint", e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono"
                  placeholder="http://localhost:11434"
                />
                <p className="mt-1 text-[0.6rem] text-muted/60">
                  URL del servidor Ollama o compatible
                </p>
              </div>
              <div>
                <FormLabel>Modelo</FormLabel>
                <input
                  type="text"
                  value={ai.localModel}
                  onChange={(e) => onChange("localModel", e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono"
                  placeholder="llama3"
                />
              </div>
            </div>
          )}

          <SaveBar onSave={onSave} onReset={onReset} saving={saving} saved={saved} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Prompt del Sistema" />
        <CardContent>
          <p className="text-sm text-muted mb-4">
            Define el contexto y personalidad de la IA al generar articulos. Se puede sobreescribir por articulo.
          </p>
          <textarea
            value={ai.systemPrompt}
            onChange={(e) => onChange("systemPrompt", e.target.value)}
            rows={5}
            className="w-full px-4 py-3 text-sm resize-y"
            placeholder="Ej: Eres un coach profesional de bodybuilding..."
          />
          <SaveBar onSave={onSave} onReset={onReset} saving={saving} saved={saved} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Stats Tab ───────────────────────────────────── */

function StatsTab({ stats, onChange, onSave, onReset, saving, saved }: {
  stats: LandingConfig["stats"];
  onChange: (items: LandingConfig["stats"]["items"]) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <Card>
      <CardHeader title="Barra de Estadisticas" />
      <CardContent>
        <p className="text-sm text-muted mb-6">Contadores animados que se muestran en el landing.</p>
        <div className="space-y-4">
          {stats.items.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <div>
                <FormLabel>Valor {i + 1}</FormLabel>
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => {
                    const newItems = [...stats.items];
                    newItems[i] = { ...item, value: parseInt(e.target.value) || 0 };
                    onChange(newItems);
                  }}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <FormLabel>Sufijo</FormLabel>
                <input
                  type="text"
                  value={item.suffix}
                  onChange={(e) => {
                    const newItems = [...stats.items];
                    newItems[i] = { ...item, suffix: e.target.value };
                    onChange(newItems);
                  }}
                  className="w-full px-4 py-3 text-sm"
                  placeholder="+"
                />
              </div>
              <div>
                <FormLabel>Etiqueta</FormLabel>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...stats.items];
                    newItems[i] = { ...item, label: e.target.value };
                    onChange(newItems);
                  }}
                  className="w-full px-4 py-3 text-sm"
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onChange([...stats.items, { value: 0, suffix: "+", label: "" }])}
            >
              + Agregar stat
            </Button>
            {stats.items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(stats.items.slice(0, -1))}
              >
                Eliminar ultimo
              </Button>
            )}
          </div>
        </div>
        <SaveBar onSave={onSave} onReset={onReset} saving={saving} saved={saved} />
      </CardContent>
    </Card>
  );
}
