"use client";

import { useState } from "react";
import { useToast } from "@/components/admin/ui/toast";

interface GeneratedExercise {
  name: string;
  sets?: number | string;
  reps?: string;
  weight?: string;
  restSec?: number;
  notes?: string;
}

export interface GeneratedWorkout {
  title: string;
  description: string;
  weekDay: number | null;
  exercises: GeneratedExercise[];
}

const MUSCLE_GROUPS = [
  { id: "pecho", label: "Pecho", icon: "💪" },
  { id: "espalda", label: "Espalda", icon: "🔙" },
  { id: "piernas", label: "Piernas", icon: "🦵" },
  { id: "hombro", label: "Hombro", icon: "💪" },
  { id: "brazo", label: "Brazo (bicep + tricep)", icon: "💪" },
  { id: "gluteo", label: "Gluteo + femoral", icon: "🍑" },
  { id: "core", label: "Core / abdominales", icon: "🎯" },
  { id: "fullbody", label: "Full body", icon: "🌟" },
  { id: "push", label: "Push (empuje)", icon: "⬆️" },
  { id: "pull", label: "Pull (tirón)", icon: "⬇️" },
];

const DIFFICULTIES = [
  { id: "beginner", label: "Principiante" },
  { id: "intermediate", label: "Intermedio" },
  { id: "advanced", label: "Avanzado" },
  { id: "pro", label: "Competidor" },
];

const DURATIONS = [
  { id: "short", label: "Corto 30-45'" },
  { id: "medium", label: "Medio 45-60'" },
  { id: "long", label: "Largo 60-90'" },
];

const COMMON_INJURIES = [
  "Hombro",
  "Rodilla",
  "Espalda baja / lumbar",
  "Cuello",
  "Muñeca",
  "Codo",
  "Tobillo",
  "Cadera",
];

export function AIWorkoutModal({
  open,
  onClose,
  onGenerated,
}: {
  open: boolean;
  onClose: () => void;
  onGenerated: (w: GeneratedWorkout) => void;
}) {
  const toast = useToast();
  const [muscleGroup, setMuscleGroup] = useState("pecho");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [duration, setDuration] = useState("medium");
  const [goal, setGoal] = useState("hipertrofia");
  const [injuries, setInjuries] = useState<string[]>([]);
  const [customInjury, setCustomInjury] = useState("");
  const [equipment, setEquipment] = useState("gimnasio completo");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function toggleInjury(inj: string) {
    setInjuries((prev) => (prev.includes(inj) ? prev.filter((i) => i !== inj) : [...prev, inj]));
  }

  async function generate() {
    setLoading(true);
    try {
      const allInjuries = [...injuries];
      if (customInjury.trim()) allInjuries.push(customInjury.trim());

      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          muscleGroup: MUSCLE_GROUPS.find((m) => m.id === muscleGroup)?.label ?? muscleGroup,
          difficulty,
          duration,
          goal,
          equipment,
          injuries: allInjuries,
          extra,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Error al generar");
        return;
      }
      onGenerated(json.data);
      toast.success("Entrenamiento generado");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-a-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-a-accent/15">
              <svg className="h-4 w-4 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09z" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold">Generar entrenamiento con IA</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full text-muted hover:bg-card-hover">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Grupo muscular / tipo</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMuscleGroup(m.id)}
                  className={`flex items-center gap-2 px-3 h-11 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] ${
                    muscleGroup === m.id ? "bg-a-accent/15 border-a-accent/30 text-a-accent" : "bg-card border-border text-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Nivel</label>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`px-3 h-9 rounded-lg text-xs font-medium transition-all ${
                      difficulty === d.id ? "bg-a-accent/15 text-a-accent" : "bg-card border border-border text-muted"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Duracion</label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    className={`px-3 h-9 rounded-lg text-xs font-medium transition-all ${
                      duration === d.id ? "bg-a-accent/15 text-a-accent" : "bg-card border border-border text-muted"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Objetivo</label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="hipertrofia, fuerza, definicion, resistencia..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Material</label>
            <input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="Ej: gimnasio completo, solo mancuernas, peso corporal..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
              <svg className="h-3 w-3 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              Lesiones / limitaciones
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_INJURIES.map((inj) => (
                <button
                  key={inj}
                  onClick={() => toggleInjury(inj)}
                  className={`px-2.5 h-8 rounded-md text-[0.7rem] font-medium transition-all ${
                    injuries.includes(inj) ? "bg-warning/15 text-warning border border-warning/30" : "bg-card border border-border text-muted"
                  }`}
                >
                  {injuries.includes(inj) && "✓ "}{inj}
                </button>
              ))}
            </div>
            <input
              value={customInjury}
              onChange={(e) => setCustomInjury(e.target.value)}
              placeholder="Otra lesion / limitacion especifica..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">Notas adicionales</label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={2}
              placeholder="Preferencias, ejercicios especificos que quieres incluir/evitar..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-card/30">
          <button onClick={onClose} className="px-4 h-10 rounded-lg text-sm text-muted hover:text-foreground">
            Cancelar
          </button>
          <button
            onClick={generate}
            disabled={loading}
            className="px-5 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97] disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l3-3-3-3v3a9 9 0 100 18 9 9 0 009-9h-3a6 6 0 11-12 0z" />
                </svg>
                Generando...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09z" />
                </svg>
                Generar con IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
