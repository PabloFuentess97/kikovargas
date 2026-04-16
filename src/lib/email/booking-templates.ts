import { getConfigSection } from "@/lib/config/get-config";

/* ─── Base email layout (brand-consistent) ───────── */

function bookingLayout(content: string): string {
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
        Este email fue enviado automaticamente por el sistema de reservas de Kiko Vargas.
      </p>
    </div>
  </div>
</body>
</html>`;
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

/* ─── Booking confirmation email ─────────────────── */

export function bookingConfirmationHtml(params: {
  name: string;
  date: Date;
  duration: number;
  linkTitle: string;
}): string {
  const { name, date, duration, linkTitle } = params;

  const content = `
    <p style="color:#c9a84c;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px">Reserva Confirmada</p>
    <h1 style="color:#ededed;font-size:24px;font-weight:700;margin:0 0 24px;line-height:1.3">
      Hola ${name}, tu reserva esta confirmada!
    </h1>

    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:24px;margin-bottom:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;width:120px">Servicio</td>
          <td style="padding:8px 0;color:#ededed;font-size:14px;font-weight:600">${linkTitle}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Fecha</td>
          <td style="padding:8px 0;color:#ededed;font-size:14px;font-weight:600;border-top:1px solid #1a1a1a;text-transform:capitalize">
            ${formatBookingDate(date)}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Hora</td>
          <td style="padding:8px 0;color:#c9a84c;font-size:14px;font-weight:700;border-top:1px solid #1a1a1a">
            ${formatBookingTime(date)}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Duracion</td>
          <td style="padding:8px 0;color:#ededed;font-size:14px;font-weight:600;border-top:1px solid #1a1a1a">${duration} minutos</td>
        </tr>
      </table>
    </div>

    <p style="color:#999;font-size:14px;line-height:1.6">
      Si necesitas cancelar o reagendar tu cita, por favor contactanos respondiendo a este email.
    </p>
  `;

  return bookingLayout(content);
}

/* ─── Send confirmation email ────────────────────── */

export async function sendBookingConfirmation(params: {
  name: string;
  email: string;
  date: Date;
  duration: number;
  linkTitle: string;
}) {
  const { Resend } = await import("resend");
  const emailConfig = await getConfigSection("email");

  let apiKey = emailConfig.resendApiKey;
  if (!apiKey) apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) {
    console.warn("[booking] No Resend API key, skipping confirmation email");
    return;
  }

  const resend = new Resend(apiKey);
  const fromName = emailConfig.fromName || "Kiko Vargas";
  const fromEmail = emailConfig.fromEmail || "noreply@kikovargass.com";

  const html = bookingConfirmationHtml(params);

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: params.email,
    subject: `Reserva confirmada - ${params.linkTitle}`,
    html,
  });
}
