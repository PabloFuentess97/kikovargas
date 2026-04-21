"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesion");
        return;
      }

      // Redirect based on role (callbackUrl wins if present and matches role scope)
      const role = data?.data?.role ?? data?.role;
      const defaultTarget = role === "ADMIN" ? "/dashboard" : "/panel";
      const target =
        callbackUrl &&
        ((role === "ADMIN" && callbackUrl.startsWith("/dashboard")) ||
          (role !== "ADMIN" && callbackUrl.startsWith("/panel")))
          ? callbackUrl
          : defaultTarget;

      router.push(target);
      router.refresh();
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-theme="admin" className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Subtle background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.04),transparent_60%)]" />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.15)]">
            <span className="text-lg font-bold" style={{ color: "#c9a84c" }}>KV</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Iniciar sesion
          </h1>
          <p className="mt-1 text-sm text-muted">Accede a tu panel</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 text-sm"
                style={{ background: "#0d0d10", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", color: "#f0f0f2" }}
                placeholder="admin@kikovargas.fit"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 text-sm"
                style={{ background: "#0d0d10", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", color: "#f0f0f2" }}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] px-4 py-3 text-sm" style={{ color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-medium text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: "#c9a84c" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[0.65rem] text-muted">
          KikoVargas &middot; IFBB Pro
        </p>
      </div>
    </div>
  );
}
