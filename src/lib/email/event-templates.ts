import { Resend } from "resend";
import { getConfigSection } from "@/lib/config/get-config";

/* ─── Send lead notification to admin ────────────── */

export async function sendEventLeadNotification(params: {
  name: string;
  email: string;
  phone: string;
  message: string;
  pageTitle: string;
  pageSlug: string;
}) {
  const emailConfig = await getConfigSection("email");

  let apiKey = emailConfig.resendApiKey;
  if (!apiKey) apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) {
    console.warn("[event-lead] No Resend API key, skipping notification");
    return;
  }

  const resend = new Resend(apiKey);
  const fromName = emailConfig.fromName || "Kiko Vargas";
  const fromEmail = emailConfig.fromEmail || "noreply@kikovargass.com";
  const adminEmail = emailConfig.contactEmailTo || process.env.CONTACT_EMAIL_TO || "contacto@kikovargass.com";
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://kikovargas.fit";

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#030303;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #1a1a1a">
      <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#ededed">KIKO</span>
      <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#c9a84c"> VARGAS</span>
    </div>

    <div style="padding:32px 0;color:#b0b0b0;font-size:15px;line-height:1.7">
      <div style="text-align:center;margin-bottom:24px">
        <span style="display:inline-block;background:#c9a84c20;color:#c9a84c;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;padding:6px 16px;border-radius:20px">
          Nuevo Lead
        </span>
      </div>

      <h1 style="color:#ededed;font-size:22px;font-weight:700;margin:0 0 8px;text-align:center">
        Nuevo registro en evento
      </h1>
      <p style="color:#888;font-size:14px;text-align:center;margin:0 0 28px">
        Alguien se registrado en <strong style="color:#ededed">${params.pageTitle}</strong>
      </p>

      <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:4px 0;margin-bottom:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 12px;color:#666;font-size:13px;width:100px">Nombre</td>
            <td style="padding:10px 12px;color:#ededed;font-size:14px;font-weight:600">${params.name}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Email</td>
            <td style="padding:10px 12px;border-top:1px solid #1a1a1a">
              <a href="mailto:${params.email}" style="color:#c9a84c;font-size:14px;text-decoration:underline">${params.email}</a>
            </td>
          </tr>
          ${params.phone ? `
          <tr>
            <td style="padding:10px 12px;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Telefono</td>
            <td style="padding:10px 12px;border-top:1px solid #1a1a1a">
              <a href="tel:${params.phone}" style="color:#c9a84c;font-size:14px;text-decoration:underline">${params.phone}</a>
            </td>
          </tr>` : ""}
          ${params.message ? `
          <tr>
            <td style="padding:10px 12px;color:#666;font-size:13px;border-top:1px solid #1a1a1a;vertical-align:top">Mensaje</td>
            <td style="padding:10px 12px;color:#b0b0b0;font-size:14px;border-top:1px solid #1a1a1a">${params.message}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:10px 12px;color:#666;font-size:13px;border-top:1px solid #1a1a1a">Evento</td>
            <td style="padding:10px 12px;color:#ededed;font-size:14px;font-weight:600;border-top:1px solid #1a1a1a">${params.pageTitle}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;padding:8px 0">
        <a href="${baseUrl}/dashboard/event-pages"
           style="display:inline-block;background:#c9a84c;color:#030303;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.5px">
          Ver en el panel
        </a>
      </div>
    </div>

    <div style="border-top:1px solid #1a1a1a;padding-top:24px;text-align:center">
      <p style="color:#555;font-size:12px;margin:0">Notificacion del sistema de eventos — Panel de administracion</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: adminEmail,
    replyTo: params.email,
    subject: `Nuevo lead: ${params.name} — ${params.pageTitle}`,
    html,
  });
}
