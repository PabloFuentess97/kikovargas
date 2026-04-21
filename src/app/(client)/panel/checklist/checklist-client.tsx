"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/admin/ui/toast";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "DAILY" | "WEEKLY" | "GENERAL";
  completed: boolean;
  completedAt: string | null;
  dueDate: string | null;
}

const CATEGORY_LABELS: Record<Task["category"], string> = {
  DAILY: "Diarias",
  WEEKLY: "Semanales",
  GENERAL: "Generales",
};

const CATEGORY_ORDER: Task["category"][] = ["DAILY", "WEEKLY", "GENERAL"];

export function ChecklistClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const toast = useToast();

  const grouped = useMemo(() => {
    const g: Record<string, Task[]> = {};
    for (const cat of CATEGORY_ORDER) g[cat] = [];
    for (const task of tasks) g[task.category].push(task);
    return g;
  }, [tasks]);

  async function toggle(id: string, completed: boolean) {
    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed, completedAt: completed ? new Date().toISOString() : null } : t))
    );

    try {
      const res = await fetch(`/api/panel/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
      );
      toast.error("No se pudo guardar");
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
          <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Sin tareas pendientes</h3>
        <p className="text-sm text-muted max-w-xs">Kiko asignara tu checklist cuando sea necesario.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((cat) => {
        const list = grouped[cat];
        if (list.length === 0) return null;
        const pending = list.filter((t) => !t.completed).length;

        return (
          <div key={cat}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted">
                {CATEGORY_LABELS[cat]}
              </h2>
              <span className="text-[0.65rem] text-muted">
                {pending > 0 ? `${pending} pendiente${pending !== 1 ? "s" : ""}` : "Completadas"}
              </span>
            </div>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              {list.map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => toggle(task.id, !task.completed)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left active:bg-card-hover transition-colors ${
                    i !== 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span
                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border-2 mt-0.5 transition-all ${
                      task.completed ? "bg-a-accent border-a-accent" : "border-border bg-transparent"
                    }`}
                  >
                    {task.completed && (
                      <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${task.completed ? "text-muted line-through" : "text-foreground"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[0.75rem] text-muted mt-0.5">{task.description}</p>
                    )}
                    {task.dueDate && !task.completed && (
                      <p className="text-[0.7rem] text-warning mt-1">
                        Vence {new Date(task.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </p>
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
