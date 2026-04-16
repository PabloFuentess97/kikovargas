"use client";

import { useState, useEffect } from "react";
import type { CountdownData } from "../types";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as CountdownData;
  const targetDate = d.targetDate ? new Date(d.targetDate) : null;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      const tl = calcTimeLeft(targetDate);
      if (!tl) { setExpired(true); return; }
      setTimeLeft(tl);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return (
      <section className="py-12 px-6 text-center text-[#444] text-sm">
        Cuenta regresiva no configurada
      </section>
    );
  }

  const units = [
    { label: "Dias", value: timeLeft?.days ?? 0 },
    { label: "Horas", value: timeLeft?.hours ?? 0 },
    { label: "Min", value: timeLeft?.minutes ?? 0 },
    { label: "Seg", value: timeLeft?.seconds ?? 0 },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {d.heading && (
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{d.heading}</h2>
        )}
        {d.description && (
          <p className="text-sm text-[#888] mb-8">{d.description}</p>
        )}

        {expired ? (
          <div className="text-[#c9a84c] text-lg font-bold">El evento ha comenzado!</div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {units.map((u) => (
              <div key={u.label} className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                    {String(u.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[0.6rem] text-[#666] mt-2 uppercase tracking-wider font-medium">{u.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
