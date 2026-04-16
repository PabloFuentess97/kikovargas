"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, Button } from "@/components/admin/ui";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export function AvailabilityEditor({ initialSlots }: { initialSlots: AvailabilitySlot[] }) {
  const router = useRouter();

  // Initialize all 7 days, filling in from DB data
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() => {
    const existing = new Map(initialSlots.map((s) => [s.dayOfWeek, s]));
    return Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: existing.get(i)?.startTime || "09:00",
      endTime: existing.get(i)?.endTime || "18:00",
      active: existing.get(i)?.active ?? false,
    }));
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateSlot(dayOfWeek: number, field: string, value: string | boolean) {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s,
      ),
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    // Validate
    for (const slot of slots) {
      if (slot.active && slot.startTime >= slot.endTime) {
        setError(`${DAY_NAMES[slot.dayOfWeek]}: la hora de inicio debe ser anterior a la hora de fin`);
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error al guardar");
        setSaving(false);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Error de conexion");
    }

    setSaving(false);
  }

  // Quick presets
  function applyPreset(type: "weekdays" | "weekends" | "all") {
    setSlots((prev) =>
      prev.map((s) => {
        const isWeekday = s.dayOfWeek >= 1 && s.dayOfWeek <= 5;
        const isWeekend = s.dayOfWeek === 0 || s.dayOfWeek === 6;

        if (type === "weekdays") return { ...s, active: isWeekday, startTime: "15:00", endTime: "21:00" };
        if (type === "weekends") return { ...s, active: isWeekend, startTime: "10:00", endTime: "14:00" };
        if (type === "all") return { ...s, active: true, startTime: "09:00", endTime: "18:00" };
        return s;
      }),
    );
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card>
        <CardHeader title="Plantillas rapidas" />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset("weekdays")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-a-surface border border-border text-muted hover:text-foreground hover:border-a-accent transition-all"
            >
              Lunes a Viernes (15:00-21:00)
            </button>
            <button
              onClick={() => applyPreset("weekends")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-a-surface border border-border text-muted hover:text-foreground hover:border-a-accent transition-all"
            >
              Fines de semana (10:00-14:00)
            </button>
            <button
              onClick={() => applyPreset("all")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-a-surface border border-border text-muted hover:text-foreground hover:border-a-accent transition-all"
            >
              Todos los dias (09:00-18:00)
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Day-by-day config */}
      <Card>
        <CardHeader title="Horarios por dia" />
        <CardContent>
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.dayOfWeek}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg transition-colors ${
                  slot.active ? "bg-card-hover" : "bg-transparent"
                }`}
              >
                {/* Toggle + Day name */}
                <div className="flex items-center gap-3 sm:w-40 shrink-0">
                  <button
                    onClick={() => updateSlot(slot.dayOfWeek, "active", !slot.active)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                      slot.active ? "bg-a-accent" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                        slot.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${slot.active ? "text-foreground" : "text-muted"}`}>
                    {DAY_NAMES[slot.dayOfWeek]}
                  </span>
                </div>

                {/* Time inputs */}
                {slot.active && (
                  <div className="flex items-center gap-2 pl-13 sm:pl-0">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(slot.dayOfWeek, "startTime", e.target.value)}
                      className="rounded-lg border border-border bg-a-surface px-3 py-1.5 text-sm focus:border-a-accent focus:outline-none"
                    />
                    <span className="text-xs text-muted">a</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(slot.dayOfWeek, "endTime", e.target.value)}
                      className="rounded-lg border border-border bg-a-surface px-3 py-1.5 text-sm focus:border-a-accent focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3">
              <p className="text-xs text-danger">{error}</p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar disponibilidad"}
            </Button>
            {saved && <span className="text-xs text-success">Guardado correctamente</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
