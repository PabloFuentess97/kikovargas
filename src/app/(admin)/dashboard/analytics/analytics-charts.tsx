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
    <div className="admin-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold">Visitas diarias</h2>
        {hoveredIdx !== null && daily[hoveredIdx] && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">
              {new Date(daily[hoveredIdx].date).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-a-accent-dim px-2 py-0.5 font-semibold text-a-accent tabular-nums">
              {daily[hoveredIdx].count}
            </span>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-[2px] h-44">
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
                  className={`w-full rounded-t transition-all duration-150 ${
                    isHovered
                      ? "bg-a-accent"
                      : isToday
                        ? "bg-a-accent/60"
                        : "bg-a-accent/20"
                  }`}
                  style={{ height: `${Math.max(pct, d.count > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-3 pt-3 border-t border-border">
        <span className="text-[0.6rem] text-muted">
          {new Date(daily[0]?.date ?? "").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
        </span>
        <span className="text-[0.6rem] font-medium text-a-accent">Hoy</span>
      </div>
    </div>
  );
}
