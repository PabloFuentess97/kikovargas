"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

export function NewsletterSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al suscribirse");
      }

      setStatus("success");
      setMessage(data.data?.message || "Suscripcion exitosa!");
      setName("");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error al suscribirse");
    }
  }

  return (
    <section id="newsletter" className="relative py-24 sm:py-32">
      {/* Background accent glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/[0.03] rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative mx-auto max-w-2xl px-6 text-center"
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-accent"
        >
          Newsletter
        </motion.p>

        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-[1.1] mb-4"
        >
          Contenido exclusivo en{" "}
          <span className="text-accent">tu email</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-sm sm:text-base text-secondary leading-relaxed mb-10 max-w-md mx-auto"
        >
          Recibe articulos, consejos de entrenamiento y novedades directamente en tu bandeja de entrada. Sin spam, solo valor.
        </motion.p>

        {/* Form */}
        {status === "success" ? (
          <motion.div
            variants={fadeUp}
            className="rounded-xl border border-accent/20 bg-accent/[0.05] p-8"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mx-auto mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-primary mb-1">{message}</p>
            <p className="text-sm text-secondary">Revisa tu email para el mensaje de bienvenida.</p>
          </motion.div>
        ) : (
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre (opcional)"
                className="flex-1 rounded-lg border border-white/[0.06] bg-elevated px-4 py-3.5 text-sm text-primary placeholder:text-tertiary/40 outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email"
                required
                className="flex-1 rounded-lg border border-white/[0.06] bg-elevated px-4 py-3.5 text-sm text-primary placeholder:text-tertiary/40 outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="w-full sm:w-auto rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold text-void uppercase tracking-widest hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Suscribiendo...
                </span>
              ) : (
                "Suscribirme"
              )}
            </button>

            {status === "error" && (
              <p className="text-xs text-red-400 mt-2">{message}</p>
            )}

            <p className="text-[0.6rem] text-tertiary/40 mt-3">
              Puedes cancelar en cualquier momento. Sin spam.
            </p>
          </motion.form>
        )}
      </motion.div>
    </section>
  );
}
