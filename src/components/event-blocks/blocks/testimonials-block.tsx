"use client";

import type { TestimonialsData } from "../types";

export function TestimonialsBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as TestimonialsData;
  const items = d.items || [];

  if (items.length === 0) {
    return (
      <section className="py-12 px-6 text-center text-[#444] text-sm">
        Testimonios sin configurar
      </section>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {d.heading && (
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12 text-center">{d.heading}</h2>
        )}

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 sm:p-8 flex flex-col"
            >
              {/* Quote icon */}
              <svg className="h-8 w-8 text-[#c9a84c]/30 mb-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
              </svg>

              {/* Testimonial text */}
              <p className="text-[#bbb] text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#1a1a1a]">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover border border-[#1a1a1a]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] text-sm font-bold shrink-0">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  {item.role && (
                    <p className="text-xs text-[#666]">{item.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
