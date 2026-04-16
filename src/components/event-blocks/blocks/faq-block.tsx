"use client";

import { useState } from "react";
import type { FaqData } from "../types";

export function FaqBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as FaqData;
  const items = d.items || [];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <section className="py-12 px-6 text-center text-[#444] text-sm">
        FAQ sin preguntas configuradas
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {d.heading && (
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{d.heading}</h2>
        )}

        <div className="space-y-2">
          {items.map((item, i) => {
            const isOpen = openIdx === i;

            return (
              <div
                key={i}
                className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white pr-4">{item.question}</span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-[#c9a84c] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-[#999] leading-relaxed border-t border-[#1a1a1a] pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
