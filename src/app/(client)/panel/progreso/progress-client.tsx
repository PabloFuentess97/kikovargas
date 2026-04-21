"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/admin/ui/toast";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface CheckIn {
  id: string;
  date: string;
  weightKg: number | null;
  photoFrontUrl: string | null;
  photoSideUrl: string | null;
  photoBackUrl: string | null;
  notes: string;
  createdAt: string;
}

/* ═══════════════════════════════════════════════════
   BMI helpers
   ═══════════════════════════════════════════════════ */

function calcBMI(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Bajo peso", color: "text-warning" };
  if (bmi < 25) return { label: "Normal", color: "text-success" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-warning" };
  return { label: "Obesidad", color: "text-danger" };
}

/* ═══════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════ */

export function ProgressClient({
  heightCm,
  initialCheckIns,
  startedAt,
}: {
  heightCm: number | null;
  initialCheckIns: CheckIn[];
  startedAt: string | null;
}) {
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [showNew, setShowNew] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const latest = checkIns[0];
  const first = checkIns[checkIns.length - 1];
  const latestBMI = latest ? calcBMI(latest.weightKg, heightCm) : null;
  const weightChange = latest && first && latest.id !== first.id && latest.weightKg != null && first.weightKg != null
    ? Math.round((latest.weightKg - first.weightKg) * 10) / 10
    : null;

  function handleDeleted(id: string) {
    setCheckIns((prev) => prev.filter((c) => c.id !== id));
  }

  function handleAdded(checkIn: CheckIn) {
    setCheckIns((prev) => [checkIn, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setShowNew(false);
  }

  return (
    <div className="admin-fade-in">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-a-accent mb-1">Mi progreso</p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Evolución</h1>
          {startedAt && (
            <p className="text-[0.7rem] text-muted mt-0.5">
              Coaching desde {new Date(startedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="shrink-0 px-3 h-10 rounded-lg bg-a-accent text-black text-xs font-semibold hover:brightness-110 active:scale-[0.97] inline-flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo check-in
        </button>
      </div>

      {/* Stats strip */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <StatTile
            label="Peso actual"
            value={latest.weightKg ? `${latest.weightKg} kg` : "—"}
            accent
          />
          <StatTile
            label="IMC"
            value={latestBMI ? latestBMI.toFixed(1) : "—"}
            sub={latestBMI ? bmiCategory(latestBMI).label : "Altura no configurada"}
            subColor={latestBMI ? bmiCategory(latestBMI).color : ""}
          />
          <StatTile
            label="Variación"
            value={weightChange !== null ? `${weightChange > 0 ? "+" : ""}${weightChange} kg` : "—"}
            sub={weightChange !== null ? "vs. inicial" : ""}
            accent={weightChange !== null && weightChange < 0}
          />
          <StatTile
            label="Check-ins"
            value={String(checkIns.length)}
            sub="registrados"
          />
        </div>
      )}

      {/* Weight chart */}
      {checkIns.filter((c) => c.weightKg != null).length >= 2 && (
        <WeightChart checkIns={checkIns} />
      )}

      {/* Compare mode toggle */}
      {checkIns.filter((c) => c.photoFrontUrl || c.photoSideUrl || c.photoBackUrl).length >= 2 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`text-xs font-medium px-3 h-9 rounded-lg border transition-all active:scale-95 inline-flex items-center gap-1.5 ${
              compareMode
                ? "bg-a-accent/10 border-a-accent/30 text-a-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 01-2 2H4m0 0l4-4m-4 4l4 4M16 17V9a2 2 0 012-2h2m0 0l-4-4m4 4l-4 4" />
            </svg>
            {compareMode ? "Modo lista" : "Comparar antes/después"}
          </button>
        </div>
      )}

      {/* Content */}
      {compareMode ? (
        <CompareView checkIns={checkIns} />
      ) : (
        <>
          {showNew && (
            <NewCheckInForm
              onCancel={() => setShowNew(false)}
              onCreated={handleAdded}
            />
          )}

          {checkIns.length === 0 && !showNew ? (
            <EmptyState onAdd={() => setShowNew(true)} />
          ) : (
            <div className="space-y-3">
              {checkIns.map((c) => (
                <CheckInCard
                  key={c.id}
                  checkIn={c}
                  heightCm={heightCm}
                  onDelete={() => handleDeleted(c.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Stat tile ─────────────────────────────────── */

function StatTile({ label, value, sub, subColor, accent }: { label: string; value: string; sub?: string; subColor?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5">{label}</p>
      <p className={`text-lg font-bold tracking-tight ${accent ? "text-a-accent" : ""}`}>{value}</p>
      {sub && <p className={`text-[0.65rem] mt-0.5 ${subColor || "text-muted"}`}>{sub}</p>}
    </div>
  );
}

/* ─── Weight chart (SVG pure) ───────────────────── */

function WeightChart({ checkIns }: { checkIns: CheckIn[] }) {
  const points = useMemo(() => {
    return [...checkIns]
      .filter((c) => c.weightKg != null)
      .map((c) => ({ date: new Date(c.date).getTime(), weight: c.weightKg! }))
      .sort((a, b) => a.date - b.date);
  }, [checkIns]);

  if (points.length < 2) return null;

  const WIDTH = 600;
  const HEIGHT = 140;
  const PAD = 10;
  const minW = Math.min(...points.map((p) => p.weight)) - 0.5;
  const maxW = Math.max(...points.map((p) => p.weight)) + 0.5;
  const rangeW = maxW - minW || 1;
  const minD = points[0].date;
  const maxD = points[points.length - 1].date;
  const rangeD = maxD - minD || 1;

  const pts = points.map((p) => {
    const x = PAD + ((p.date - minD) / rangeD) * (WIDTH - PAD * 2);
    const y = HEIGHT - PAD - ((p.weight - minW) / rangeW) * (HEIGHT - PAD * 2);
    return { x, y, ...p };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${HEIGHT - PAD} L ${pts[0].x} ${HEIGHT - PAD} Z`;

  return (
    <div className="mb-5 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground">Evolución del peso</h3>
        <p className="text-[0.65rem] text-muted">
          {minW.toFixed(1)} – {maxW.toFixed(1)} kg
        </p>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="w-full h-32">
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#wgrad)" />
        <path d={pathD} fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c9a84c" stroke="#0a0a0a" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex items-center justify-between mt-2 text-[0.6rem] text-muted">
        <span>{new Date(minD).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
        <span>{new Date(maxD).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
      </div>
    </div>
  );
}

/* ─── Compare view ──────────────────────────────── */

function CompareView({ checkIns }: { checkIns: CheckIn[] }) {
  const withPhotos = checkIns.filter((c) => c.photoFrontUrl || c.photoSideUrl || c.photoBackUrl);

  const [beforeId, setBeforeId] = useState<string>(withPhotos[withPhotos.length - 1]?.id ?? "");
  const [afterId, setAfterId] = useState<string>(withPhotos[0]?.id ?? "");

  const before = withPhotos.find((c) => c.id === beforeId);
  const after = withPhotos.find((c) => c.id === afterId);

  if (!before || !after) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5">Antes</label>
          <select
            value={beforeId}
            onChange={(e) => setBeforeId(e.target.value)}
            className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-xs"
          >
            {withPhotos.map((c) => (
              <option key={c.id} value={c.id}>
                {new Date(c.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                {c.weightKg ? ` — ${c.weightKg} kg` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5">Después</label>
          <select
            value={afterId}
            onChange={(e) => setAfterId(e.target.value)}
            className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-xs"
          >
            {withPhotos.map((c) => (
              <option key={c.id} value={c.id}>
                {new Date(c.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                {c.weightKg ? ` — ${c.weightKg} kg` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {["Front", "Side", "Back"].map((slot) => {
        const b = before[`photo${slot}Url` as "photoFrontUrl" | "photoSideUrl" | "photoBackUrl"];
        const a = after[`photo${slot}Url` as "photoFrontUrl" | "photoSideUrl" | "photoBackUrl"];
        if (!b && !a) return null;
        const label = slot === "Front" ? "Frontal" : slot === "Side" ? "Lateral" : "Espalda";
        return (
          <div key={slot}>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">{label}</p>
            <div className="grid grid-cols-2 gap-2">
              <PhotoSlot url={b} date={before.date} weight={before.weightKg} fallback="Sin foto" />
              <PhotoSlot url={a} date={after.date} weight={after.weightKg} fallback="Sin foto" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhotoSlot({ url, date, weight, fallback }: { url: string | null | undefined; date: string; weight: number | null; fallback: string }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden aspect-[3/4] relative">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Check-in" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted/50">{fallback}</div>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-[0.65rem]">
        <p className="font-medium">{new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
        {weight && <p className="text-[0.6rem] opacity-80">{weight} kg</p>}
      </div>
    </div>
  );
}

/* ─── Check-in card ─────────────────────────────── */

function CheckInCard({ checkIn, heightCm, onDelete }: { checkIn: CheckIn; heightCm: number | null; onDelete: () => void }) {
  const toast = useToast();
  const bmi = calcBMI(checkIn.weightKg, heightCm);
  const photos = [
    { slot: "Frontal", url: checkIn.photoFrontUrl },
    { slot: "Lateral", url: checkIn.photoSideUrl },
    { slot: "Espalda", url: checkIn.photoBackUrl },
  ].filter((p) => p.url);

  async function handleDelete() {
    if (!confirm("¿Eliminar este check-in? La acción es irreversible.")) return;
    const res = await fetch(`/api/panel/checkins/${checkIn.id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete();
      toast.success("Check-in eliminado");
    } else {
      toast.error("No se pudo eliminar");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div>
          <p className="text-sm font-semibold">
            {new Date(checkIn.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-[0.7rem] text-muted">
            {checkIn.weightKg && <span>{checkIn.weightKg} kg</span>}
            {bmi && <span>IMC {bmi.toFixed(1)} · <span className={bmiCategory(bmi).color}>{bmiCategory(bmi).label}</span></span>}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10 active:scale-90 inline-flex items-center justify-center"
          title="Eliminar check-in"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" />
          </svg>
        </button>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className={`grid grid-cols-${Math.min(photos.length, 3)} gap-0.5`}>
          {photos.map((p, i) => (
            <a
              key={i}
              href={p.url!}
              target="_blank"
              rel="noopener"
              className="block aspect-[3/4] relative bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url!} alt={p.slot} className="w-full h-full object-cover" />
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[0.55rem] text-white font-medium">
                {p.slot}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Notes */}
      {checkIn.notes && (
        <div className="px-4 py-3 bg-background/40">
          <p className="text-xs text-foreground whitespace-pre-wrap">{checkIn.notes}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ───────────────────────────────── */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
        <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">Sin check-ins todavia</h3>
      <p className="text-sm text-muted max-w-xs mb-4">
        Registra tu peso y fotos cada semana para ver tu evolución con claridad.
      </p>
      <button
        onClick={onAdd}
        className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium"
      >
        Hacer mi primer check-in
      </button>
    </div>
  );
}

/* ─── New check-in form ─────────────────────────── */

function NewCheckInForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (c: CheckIn) => void }) {
  const toast = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<{ front?: UploadedFile; side?: UploadedFile; back?: UploadedFile }>({});
  const [saving, setSaving] = useState(false);

  async function handlePhoto(slot: "front" | "side" | "back", file: File) {
    const fd = new FormData();
    fd.append("files", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (!json.success || !json.data.uploaded[0]) {
      toast.error(json.error || "Error al subir foto");
      return;
    }
    const f = json.data.uploaded[0];
    setPhotos((p) => ({ ...p, [slot]: { url: f.url, key: f.key } }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/panel/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date(date).toISOString(),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        photoFrontUrl: photos.front?.url ?? null,
        photoFrontKey: photos.front?.key ?? null,
        photoSideUrl: photos.side?.url ?? null,
        photoSideKey: photos.side?.key ?? null,
        photoBackUrl: photos.back?.url ?? null,
        photoBackKey: photos.back?.key ?? null,
        notes,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) {
      onCreated(json.data);
      toast.success("Check-in guardado");
    } else {
      toast.error(json.error || "Error al guardar");
    }
  }

  return (
    <div className="rounded-2xl border border-a-accent/30 bg-card p-4 mb-4 space-y-4">
      <h3 className="text-sm font-semibold">Nuevo check-in</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="400"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="72.3"
            className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Fotos (opcional)</label>
        <div className="grid grid-cols-3 gap-2">
          <PhotoUploadSlot label="Frontal" photo={photos.front} onUpload={(f) => handlePhoto("front", f)} onClear={() => setPhotos((p) => ({ ...p, front: undefined }))} />
          <PhotoUploadSlot label="Lateral" photo={photos.side} onUpload={(f) => handlePhoto("side", f)} onClear={() => setPhotos((p) => ({ ...p, side: undefined }))} />
          <PhotoUploadSlot label="Espalda" photo={photos.back} onUpload={(f) => handlePhoto("back", f)} onClear={() => setPhotos((p) => ({ ...p, back: undefined }))} />
        </div>
      </div>

      <div>
        <label className="block text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1.5">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm resize-none"
          placeholder="¿Cómo te has sentido esta semana? Energía, descanso, entrenamientos..."
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar check-in"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 h-10 rounded-lg text-sm text-muted hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

interface UploadedFile { url: string; key: string }

function PhotoUploadSlot({ label, photo, onUpload, onClear }: { label: string; photo?: UploadedFile; onUpload: (f: File) => void; onClear: () => void }) {
  return (
    <div>
      <p className="text-[0.55rem] uppercase tracking-widest text-muted mb-1 text-center">{label}</p>
      {photo ? (
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-a-accent/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={onClear}
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"
            title="Quitar"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="block aspect-[3/4] rounded-lg border-2 border-dashed border-border bg-background cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
          />
          <div className="text-center p-2">
            <svg className="h-5 w-5 text-muted mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <p className="text-[0.6rem] text-muted">Subir</p>
          </div>
        </label>
      )}
    </div>
  );
}
