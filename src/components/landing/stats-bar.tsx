"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ease } from "@/lib/animations";
import { Divider } from "./divider";

const STATS = [
  { value: 15, suffix: "+", label: "Años de experiencia" },
  { value: 3, suffix: "x", label: "Campeón nacional" },
  { value: 200, suffix: "+", label: "Atletas preparados" },
  { value: 12, suffix: "+", label: "Competencias IFBB" },
];

function Counter({ value, suffix, label, inView }: {
  value: number; suffix: string; label: string; inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 2400;
    const start = performance.now();

    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(eased * value));
      if (p < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div className="text-center py-6 md:py-8">
      <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-none tracking-tight">
        {count}
        <span className="text-accent">{suffix}</span>
      </span>
      <p className="mt-2.5 text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.25em] text-tertiary leading-relaxed">
        {label}
      </p>
    </div>
  );
}

export function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative bg-void overflow-hidden">
      <Divider />

      <div className="container-landing py-8 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.65, ease }}
            >
              <Counter {...stat} inView={inView} />
            </motion.div>
          ))}
        </div>
      </div>

      <Divider />
    </section>
  );
}
