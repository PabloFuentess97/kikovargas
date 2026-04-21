"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent,
  FormField, FormLabel, FormInput, FormError, FormActions, Button,
  useToast,
} from "@/components/admin/ui";
import { useCopy } from "@/lib/hooks/use-copy";

/* ═══════════════════════════════════════════════════
   Password generator (no confusing characters)
   ═══════════════════════════════════════════════════ */
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

interface CreatedClient {
  id: string;
  name: string;
  email: string;
  panelUrl: string;
  tempPassword: string;
  emailResult: { sent: boolean; error?: string };
}

export function NewClientForm() {
  const [created, setCreated] = useState<CreatedClient | null>(null);

  if (created) {
    return <SuccessScreen client={created} />;
  }

  return <CreateForm onCreated={setCreated} />;
}

/* ═══════════════════════════════════════════════════
   Create form
   ═══════════════════════════════════════════════════ */
function CreateForm({ onCreated }: { onCreated: (c: CreatedClient) => void }) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState({
    name: "", email: "", password: "", phone: "",
    monthlyFee: "", startedAt: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [sendEmail, setSendEmail] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  function genPass() {
    setData({ ...data, password: generatePassword() });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      phone: data.phone || undefined,
      monthlyFee: data.monthlyFee ? Math.round(parseFloat(data.monthlyFee) * 100) : undefined,
      startedAt: data.startedAt ? new Date(data.startedAt).toISOString() : undefined,
      notes: data.notes || undefined,
      sendWelcomeEmail: sendEmail,
    };

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      setErr(json.error || "Error al crear cliente");
      return;
    }

    toast.success("Cliente creado");
    onCreated(json.data);
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <Card>
        <CardContent>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="name">Nombre completo</FormLabel>
                <FormInput id="name" required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
              </FormField>
              <FormField>
                <FormLabel htmlFor="email">Email (acceso)</FormLabel>
                <FormInput id="email" type="email" required value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
              </FormField>
            </div>

            <FormField>
              <FormLabel htmlFor="password">
                Contrasena temporal
                <span className="text-[0.6rem] font-normal normal-case tracking-normal text-muted/60 ml-2">
                  Min 8 caracteres
                </span>
              </FormLabel>
              <div className="flex gap-2">
                <input
                  id="password"
                  type="text"
                  required
                  minLength={8}
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  className="flex-1 rounded-lg border border-border bg-a-surface px-4 py-3 text-sm font-mono focus:border-a-accent focus:outline-none"
                  placeholder="Usa 'Generar' o escribe una"
                />
                <button
                  type="button"
                  onClick={genPass}
                  className="px-4 rounded-lg border border-border text-muted hover:text-a-accent hover:border-a-accent/30 text-xs font-medium active:scale-95 transition-all"
                >
                  Generar
                </button>
              </div>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="phone" optional>Telefono</FormLabel>
                <FormInput id="phone" type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
              </FormField>
              <FormField>
                <FormLabel htmlFor="monthlyFee" optional>Cuota mensual (EUR)</FormLabel>
                <FormInput id="monthlyFee" type="number" step="0.01" min="0" value={data.monthlyFee} onChange={(e) => setData({ ...data, monthlyFee: e.target.value })} placeholder="150.00" />
              </FormField>
            </div>

            <FormField>
              <FormLabel htmlFor="startedAt" optional>Inicio de coaching</FormLabel>
              <FormInput id="startedAt" type="date" value={data.startedAt} onChange={(e) => setData({ ...data, startedAt: e.target.value })} />
            </FormField>

            <FormField>
              <FormLabel htmlFor="notes" optional>Notas internas</FormLabel>
              <textarea
                id="notes"
                rows={3}
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm focus:border-a-accent focus:outline-none resize-none"
                placeholder="Objetivos, lesiones, preferencias..."
              />
            </FormField>

            {/* Send welcome email toggle */}
            <div className="rounded-xl border border-border bg-a-surface/50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#c9a84c]"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Enviar email de bienvenida con las credenciales
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    El cliente recibira un email premium con su email, contrasena y enlace al panel.
                    Requiere tener Resend configurado en <span className="text-a-accent">Configuracion &gt; Email</span>.
                  </p>
                </div>
              </label>
            </div>

            {err && <FormError message={err} />}
          </div>

          <FormActions>
            <Button type="submit" loading={saving}>Crear cliente</Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/clients")}>Cancelar</Button>
          </FormActions>
        </CardContent>
      </Card>
    </form>
  );
}

/* ═══════════════════════════════════════════════════
   Success screen with shareable credentials
   ═══════════════════════════════════════════════════ */
function SuccessScreen({ client }: { client: CreatedClient }) {
  const router = useRouter();
  const toast = useToast();
  const { copy, copiedKey } = useCopy();
  const [resending, setResending] = useState(false);

  const formattedBlock = [
    `Hola ${client.name},`,
    ``,
    `Este es tu acceso privado al panel de Kikovargas.fit:`,
    ``,
    `Email: ${client.email}`,
    `Contrasena: ${client.tempPassword}`,
    `Panel: ${client.panelUrl}`,
    ``,
    `Recomendamos cambiar la contrasena despues del primer acceso.`,
  ].join("\n");

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedBlock)}`;
  const mailtoUrl = `mailto:${client.email}?subject=${encodeURIComponent("Tu acceso a Kikovargas.fit")}&body=${encodeURIComponent(formattedBlock)}`;

  async function resendEmail() {
    setResending(true);
    const res = await fetch(`/api/clients/${client.id}/send-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: client.tempPassword }),
    });
    const json = await res.json();
    setResending(false);
    if (json.success) {
      toast.success("Email enviado por Resend");
    } else {
      toast.error(json.error || "No se pudo enviar");
    }
  }

  return (
    <div className="space-y-4">
      {/* Success banner */}
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
            <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">Cliente creado correctamente</h3>
            <p className="text-sm text-muted mt-0.5 capitalize">{client.name}</p>
            {client.emailResult.sent && (
              <p className="text-xs text-success mt-2 inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Email de bienvenida enviado a {client.email}
              </p>
            )}
            {client.emailResult.error && (
              <p className="text-xs text-warning mt-2 leading-relaxed">
                No se pudo enviar el email: {client.emailResult.error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Credentials card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Datos de acceso</h3>
          <p className="text-xs text-muted mt-0.5">
            Comparte estos datos con tu cliente. La contrasena solo se muestra <strong className="text-foreground">ahora</strong> — despues no se puede recuperar.
          </p>
        </div>

        <div className="divide-y divide-border">
          <CredRow
            label="Email"
            value={client.email}
            onCopy={() => copy(client.email, { label: "Email copiado", key: "email" })}
            copied={copiedKey === "email"}
          />
          <CredRow
            label="Contrasena"
            value={client.tempPassword}
            mono
            accent
            onCopy={() => copy(client.tempPassword, { label: "Contrasena copiada", key: "pass" })}
            copied={copiedKey === "pass"}
          />
          <CredRow
            label="Panel"
            value={client.panelUrl}
            onCopy={() => copy(client.panelUrl, { label: "Enlace copiado", key: "url" })}
            copied={copiedKey === "url"}
          />
        </div>

        {/* Bulk actions */}
        <div className="px-4 py-4 bg-a-surface/30 space-y-2">
          <button
            onClick={() => copy(formattedBlock, { label: "Mensaje completo copiado", key: "all" })}
            className={`w-full flex items-center justify-between px-4 h-12 rounded-xl transition-all active:scale-[0.98] ${
              copiedKey === "all"
                ? "bg-success/10 text-success border border-success/30"
                : "bg-a-accent text-black hover:brightness-110"
            }`}
          >
            <span className="text-sm font-medium">
              {copiedKey === "all" ? "Copiado!" : "Copiar mensaje completo"}
            </span>
            {copiedKey === "all" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-medium active:scale-[0.98] transition-all"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>

            <a
              href={mailtoUrl}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-card border border-border text-muted hover:text-foreground text-xs font-medium active:scale-[0.98] transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Mail local
            </a>
          </div>

          {/* Resend via Resend API */}
          <button
            onClick={resendEmail}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-muted hover:text-a-accent hover:border-a-accent/30 text-xs font-medium active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            {resending
              ? "Enviando..."
              : client.emailResult.sent
              ? "Reenviar por email (Resend)"
              : "Enviar por email (Resend)"}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
        <p className="text-xs text-warning leading-relaxed">
          <strong>Importante:</strong> esta es la unica vez que veras la contrasena en texto plano.
          Si se pierde, reenvia credenciales desde la ficha del cliente (generara una nueva).
        </p>
      </div>

      {/* Next actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => router.push(`/dashboard/clients/${client.id}`)}
          className="flex-1 h-11 rounded-xl bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Ir al cliente
        </button>
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="h-11 px-4 rounded-xl border border-border text-muted hover:text-foreground text-sm font-medium active:scale-[0.98] transition-all"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

/* ─── Credential row ─────────────────────────────── */
function CredRow({
  label,
  value,
  mono,
  accent,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <div className="flex-1 min-w-0">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-muted mb-1">{label}</p>
        <p className={`text-sm break-all ${mono ? "font-mono" : ""} ${accent ? "text-a-accent font-semibold" : "text-foreground"}`}>
          {value}
        </p>
      </div>
      <button
        onClick={onCopy}
        className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-90 ${
          copied ? "text-success bg-success/10" : "text-muted hover:text-a-accent hover:bg-card-hover"
        }`}
        title="Copiar"
        aria-label={`Copiar ${label}`}
      >
        {copied ? (
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        )}
      </button>
    </div>
  );
}
