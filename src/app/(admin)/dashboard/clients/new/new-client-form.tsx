"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent,
  FormField, FormLabel, FormInput, FormError, FormActions, Button,
  useToast,
} from "@/components/admin/ui";

export function NewClientForm() {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState({
    name: "", email: "", password: "", phone: "",
    monthlyFee: "", startedAt: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
      monthlyFee: data.monthlyFee ? Math.round(parseFloat(data.monthlyFee) * 100) : undefined,
      startedAt: data.startedAt ? new Date(data.startedAt).toISOString() : undefined,
      notes: data.notes || undefined,
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
    router.push(`/dashboard/clients/${json.data.id}`);
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
                Contraseña temporal
                <span className="text-[0.6rem] font-normal normal-case tracking-normal text-muted/60 ml-2">
                  Min 8 caracteres. El cliente podrá cambiarla después.
                </span>
              </FormLabel>
              <FormInput id="password" type="text" required minLength={8} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="phone" optional>Teléfono</FormLabel>
                <FormInput id="phone" type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
              </FormField>
              <FormField>
                <FormLabel htmlFor="monthlyFee" optional>Cuota mensual (€)</FormLabel>
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
