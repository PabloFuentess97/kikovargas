"use client";

import { useState } from "react";
import type { FormData } from "../types";

export function FormBlock({ data, pageId }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as FormData;
  const fields = d.fields || ["name", "email"];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/event-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || "Error al enviar");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Error de conexion");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section id="form" className="py-16 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6">
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Registro exitoso!</h3>
          <p className="text-sm text-[#888]">Gracias por registrarte. Te enviaremos toda la informacion por email.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="form" className="py-16 px-6">
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-8">
          {d.heading && (
            <h2 className="text-2xl font-bold text-white mb-2 text-center">{d.heading}</h2>
          )}
          {d.description && (
            <p className="text-sm text-[#888] text-center mb-6">{d.description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.includes("name") && (
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
            )}

            {fields.includes("email") && (
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            )}

            {fields.includes("phone") && (
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Telefono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="+34 600 000 000"
                />
              </div>
            )}

            {fields.includes("message") && (
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Mensaje</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors resize-none"
                  placeholder="Escribe un mensaje..."
                />
              </div>
            )}

            {errorMsg && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-xs text-red-400">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b45f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                d.buttonText || "Enviar"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
