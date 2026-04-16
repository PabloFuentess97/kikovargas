import { Resend } from "resend";
import { getConfigSection } from "@/lib/config/get-config";

/* ─── Shared Resend client ───────────────────────── */

async function getBookingResend() {
  const emailConfig = await getConfigSection("email");

  let apiKey = emailConfig.resendApiKey;
  if (!apiKey) apiKey = process.env.RESEND_API_KEY || "";

  if (!apiKey) {
    console.warn("[booking-email] No Resend API key configured");
    return null;
  }

  return {
    resend: new Resend(apiKey),
    fromName: emailConfig.fromName || "Kiko Vargas",
    fromEmail: emailConfig.fromEmail || "noreply@kikovargass.com",
    adminEmail: emailConfig.contactEmailTo || process.env.CONTACT_EMAIL_TO || "contacto@kikovargass.com",
  };
}

/* ─── Base email layout (brand-consistent) ───────── */

function bookingLayout(content: string, footerNote?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#030303;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px">
    <!-- Header -->
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #1a1a1a">
      <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#ededed">KIKO</span>
      <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#c9a84c"> VARGAS</span>
    </div>

    <!-- Content -->
    <div style="padding:32px 0;color:#b0b0b0;font-size:15px;line-height:1.7">
      ${content}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center">
      <p style="color:#555;font-size:12px;margin:0">
        ${footerNote || "Este email fue enviado automaticamente por el sistema de reservas de Kiko Vargas."}
      </p>
    </div>
  </div>
</body>
</html>`;
}

/* ─── Detail table row helper ────────────────────── */

function tableRow(label: string, value: string, highlight = false): string {
  return `
    <tr>
      <td style="padding:10px 12px;color:#666;font-size:13px;width:120px;border-top:1px solid #1a1a1a;vertical-align:top">${label}</td>
      <td style="padding:10px 12px;color:${highlight ? "#c9a84c" : "#ededed"};font-size:14px;font-weight:${highlight ? "700" : "600"};border-top:1px solid #1a1a1a">${value}</td>
    </tr>`;
}

/* ─── Format date/time for emails ────────────────── */

function formatBookingDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatBookingTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatEndTime(date: Date, durationMin: number): string {
  const end = new Date(date.getTime() + durationMin * 60000);
  return formatBookingTime(end);
}

/* ═══════════════════════════════════════════════════
   1. USER CONFIRMATION EMAIL
   ═══════════════════════════════════════════════════ */

export interface BookingEmailParams {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  date: Date;
  duration: number;
  linkTitle: string;
}

export function userConfirmationHtml(p: BookingEmailParams): string {
  const content = `
    <!-- Badge -->
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:#c9a84c20;color:#c9a84c;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:6px 16px;border-radius:20px">
        ✓ Reserva Confirmada
      </span>
    </div>

    <h1 style="color:#ededed;font-size:22px;font-weight:700;margin:0 0 8px;line-height:1.3;text-align:center">
      Hola ${p.name}!
    </h1>
    <p style="color:#888;font-size:14px;text-align:center;margin:0 0 28px">
      Tu reserva ha sido confirmada correctamente. Aqui tienes los detalles:
    </p>

    <!-- Booking details card -->
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:4px 0;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 12px;color:#666;font-size:13px;width:120px;vertical-align:top">Servicio</td>
          <td style="padding:10px 12px;color:#ededed;font-size:14px;font-weight:600">${p.linkTitle}</td>
        </tr>
        ${tableRow("Fecha", `<span style="text-transform:capitalize">${formatBookingDate(p.date)}</span>`)}
        ${tableRow("Hora", `${formatBookingTime(p.date)} — ${formatEndTime(p.date, p.duration)}`, true)}
        ${tableRow("Duracion", `${p.duration} minutos`)}
      </table>
    </div>

    <!-- Contact info reminder -->
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:16px;margin-bottom:24px">
      <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;font-weight:600">Tus datos de contacto</p>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:4px 0;color:#666;font-size:13px;width:80px">Nombre</td>
          <td style="padding:4px 0;color:#ededed;font-size:13px">${p.name}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#666;font-size:13px">Email</td>
          <td style="padding:4px 0;color:#ededed;font-size:13px">${p.email}</td>
        </tr>
        ${p.phone ? `
        <tr>
          <td style="padding:4px 0;color:#666;font-size:13px">Telefono</td>
          <td style="padding:4px 0;color:#ededed;font-size:13px">${p.phone}</td>
        </tr>` : ""}
      </table>
    </div>

    ${p.notes ? `
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:16px;margin-bottom:24px">
      <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;font-weight:600">Notas</p>
      <p style="color:#b0b0b0;font-size:13px;margin:0;line-height:1.5">${p.notes}</p>
    </div>` : ""}

    <!-- Help text -->
    <div style="background:#c9a84c10;border:1px solid #c9a84c30;border-radius:12px;padding:16px;text-align:center">
      <p style="color:#c9a84c;font-size:13px;margin:0;line-height:1.5;font-weight:500">
        Si necesitas cancelar o reagendar tu cita, responde a este email y te ayudaremos.
      </p>
    </div>
  `;

  return bookingLayout(content, "Recibiste este email porque realizaste una reserva en kikovargas.fit");
}

/* ═══════════════════════════════════════════════════
   2. ADMIN NOTIFICATION EMAIL
   ═══════════════════════════════════════════════════ */

export function adminNotificationHtml(p: BookingEmailParams): string {
  const content = `
    <!-- Badge -->
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:#c9a84c20;color:#c9a84c;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:6px 16px;border-radius:20px">
        Nueva Reserva
      </span>
    </div>

    <h1 style="color:#ededed;font-size:22px;font-weight:700;margin:0 0 8px;line-height:1.3;text-align:center">
      Nueva reserva recibida
    </h1>
    <p style="color:#888;font-size:14px;text-align:center;margin:0 0 28px">
      Un cliente ha reservado una cita a traves de <strong style="color:#ededed">${p.linkTitle}</strong>
    </p>

    <!-- Booking details -->
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:4px 0;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 12px;color:#666;font-size:13px;width:120px;vertical-align:top">Servicio</td>
          <td style="padding:10px 12px;color:#ededed;font-size:14px;font-weight:600">${p.linkTitle}</td>
        </tr>
        ${tableRow("Fecha", `<span style="text-transform:capitalize">${formatBookingDate(p.date)}</span>`)}
        ${tableRow("Hora", `${formatBookingTime(p.date)} — ${formatEndTime(p.date, p.duration)}`, true)}
        ${tableRow("Duracion", `${p.duration} minutos`)}
      </table>
    </div>

    <!-- Client info -->
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:4px 0;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td colspan="2" style="padding:12px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Datos del cliente</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#666;font-size:13px;width:120px;border-top:1px solid #1a1a1a">Nombre</td>
          <td style="padding:8px 12px;color:#ededed;font-size:14px;font-weight:600;border-top:1px solid #1a1a1a">${p.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Email</td>
          <td style="padding:8px 12px;border-top:1px solid #1a1a1a">
            <a href="mailto:${p.email}" style="color:#c9a84c;font-size:14px;text-decoration:underline">${p.email}</a>
          </td>
        </tr>
        ${p.phone ? `
        <tr>
          <td style="padding:8px 12px;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Telefono</td>
          <td style="padding:8px 12px;border-top:1px solid #1a1a1a">
            <a href="tel:${p.phone}" style="color:#c9a84c;font-size:14px;text-decoration:underline">${p.phone}</a>
          </td>
        </tr>` : ""}
      </table>
    </div>

    ${p.notes ? `
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:16px;margin-bottom:24px">
      <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;font-weight:600">Notas del cliente</p>
      <p style="color:#b0b0b0;font-size:13px;margin:0;line-height:1.5">${p.notes}</p>
    </div>` : ""}

    <!-- CTA: View in dashboard -->
    <div style="text-align:center;padding:8px 0">
      <a href="${process.env.NEXT_PUBLIC_URL || "https://kikovargas.fit"}/dashboard/bookings"
         style="display:inline-block;background:#c9a84c;color:#030303;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.5px">
        Ver en el panel
      </a>
    </div>
  `;

  return bookingLayout(content, "Notificacion automatica del sistema de reservas — Panel de administracion");
}

/* ═══════════════════════════════════════════════════
   3. SEND FUNCTIONS
   ═══════════════════════════════════════════════════ */

/** Send confirmation email to the client */
export async function sendBookingConfirmation(params: BookingEmailParams) {
  const config = await getBookingResend();
  if (!config) return;

  const { resend, fromName, fromEmail } = config;

  const html = userConfirmationHtml(params);

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: params.email,
    replyTo: config.adminEmail,
    subject: `Reserva confirmada — ${params.linkTitle}`,
    html,
  });
}

/** Send notification email to the admin */
export async function sendBookingAdminNotification(params: BookingEmailParams) {
  const config = await getBookingResend();
  if (!config) return;

  const { resend, fromName, fromEmail, adminEmail } = config;

  const html = adminNotificationHtml(params);

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: adminEmail,
    replyTo: params.email,
    subject: `Nueva reserva: ${params.name} — ${formatBookingTime(params.date)} ${formatBookingDate(params.date)}`,
    html,
  });
}

/** Send both emails (fire-and-forget safe) */
export async function sendBookingEmails(params: BookingEmailParams) {
  const results = await Promise.allSettled([
    sendBookingConfirmation(params),
    sendBookingAdminNotification(params),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[booking-email] Send failed:", r.reason);
    }
  }
}
