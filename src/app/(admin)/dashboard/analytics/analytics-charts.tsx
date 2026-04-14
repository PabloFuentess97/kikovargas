"use client";

import { useState } from "react";

interface DailyData {
  date: string;
  count: number;
}

export function AnalyticsCharts({ daily }: { daily: DailyData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = Math.max(...daily.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Visitas diarias</h2>
        {hoveredIdx !== null && daily[hoveredIdx] && (
          <p className="text-xs text-muted">
            {new Date(daily[hoveredIdx].date).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
            })}
            {" — "}
            <span className="font-semibold text-foreground">{daily[hoveredIdx].count}</span> visitas
          </p>
        )}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-[2px] h-40">
        {daily.map((d, i) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0;
          const isHovered = hoveredIdx === i;
          const isToday = i === daily.length - 1;

          return (
            <div
              key={d.date}
              className="relative flex-1 group cursor-pointer"
              style={{ height: "100%" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="absolute bottom-0 w-full flex items-end h-full">
                <div
                  className={`w-full rounded-t-sm transition-all duration-150 ${
                    isHovered
                      ? "bg-a-primary"
                      : isToday
                        ? "bg-a-primary/70"
                        : "bg-a-primary/30"
                  }`}
                  style={{ height: `${Math.max(pct, d.count > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        <span className="text-[0.6rem] text-muted">
          {new Date(daily[0]?.date ?? "").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
        </span>
        <span className="text-[0.6rem] text-muted">Hoy</span>
      </div>
    </div>
  );
}
