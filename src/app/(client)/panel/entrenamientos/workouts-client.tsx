"use client";

import { useState } from "react";
import { useToast } from "@/components/admin/ui/toast";

interface Exercise {
  name: string;
  sets?: number | string;
  reps?: number | string;
  weight?: string;
  restSec?: number;
  notes?: string;
  completed?: boolean;
}

interface Workout {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  weekDay: number | null;
  exercises: Exercise[];
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

export function WorkoutsClient({ initialWorkouts }: { initialWorkouts: Workout[] }) {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const toast = useToast();

  async function toggleExercise(workoutId: string, index: number) {
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;

    const newExercises = workout.exercises.map((ex, i) =>
      i === index ? { ...ex, completed: !ex.completed } : ex
    );

    // Optimistic update
    setWorkouts((prev) => prev.map((w) => (w.id === workoutId ? { ...w, exercises: newExercises } : w)));
    setSavingId(workoutId);

    try {
      const res = await fetch(`/api/panel/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercises: newExercises }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // rollback
      setWorkouts((prev) => prev.map((w) => (w.id === workoutId ? { ...w, exercises: workout.exercises } : w)));
      toast.error("No se pudo guardar el cambio");
    } finally {
      setSavingId(null);
    }
  }

  if (workouts.length === 0) {
    return (
      <EmptyState
        title="Aun no tienes entrenamientos"
        description="Kiko asignara tu plan pronto. Te avisaremos cuando este listo."
      />
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const total = workout.exercises.length;
        const done = workout.exercises.filter((e) => e.completed).length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        const isComplete = workout.status === "COMPLETED";

        return (
          <div key={workout.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {workout.weekDay !== null && (
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-a-accent mb-1">
                      {DAYS[workout.weekDay]}
                    </p>
                  )}
                  <h2 className="text-base font-semibold text-foreground">{workout.title}</h2>
                  {workout.description && (
                    <p className="text-xs text-muted mt-1">{workout.description}</p>
                  )}
                </div>
                {isComplete && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[0.65rem] text-success">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Completado
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {total > 0 && !isComplete && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[0.6rem] text-muted mb-1">
                    <span>{done} / {total} ejercicios</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background overflow-hidden">
                    <div
                      className="h-full bg-a-accent transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Exercises */}
            <div className="divide-y divide-border">
              {workout.exercises.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => toggleExercise(workout.id, i)}
                  disabled={savingId === workout.id}
                  className="w-full flex items-start gap-3 px-5 py-3.5 text-left active:bg-card-hover transition-colors disabled:opacity-60"
                >
                  <span
                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border-2 mt-0.5 transition-all ${
                      ex.completed
                        ? "bg-a-accent border-a-accent"
                        : "border-border bg-transparent"
                    }`}
                  >
                    {ex.completed && (
                      <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${ex.completed ? "text-muted line-through" : "text-foreground"}`}>
                      {ex.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-[0.7rem] text-muted">
                      {ex.sets && <span>{ex.sets} series</span>}
                      {ex.reps && <span>{ex.reps} reps</span>}
                      {ex.weight && <span>{ex.weight}</span>}
                      {ex.restSec !== undefined && ex.restSec > 0 && <span>descanso {ex.restSec}s</span>}
                    </div>
                    {ex.notes && (
                      <p className="text-[0.7rem] text-muted mt-1 italic">{ex.notes}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
        <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18M18 3v18M3 7.5h3m0 9H3m15-9h3m-3 9h3M6 12h12" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-xs">{description}</p>
    </div>
  );
}
