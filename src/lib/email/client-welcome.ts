import { Resend } from "resend";
import { getConfigSection } from "@/lib/config/get-config";

async function getResendClient(): Promise<Resend> {
  const emailConfig = await getConfigSection("email");
  let apiKey = emailConfig.resendApiKey;

  if (!apiKey) {
    apiKey = process.env.RESEND_API_KEY || "";
  }

  if (!apiKey) {
    throw new Error(
      "Resend API key no configurada. Configurala en Dashboard > Configuracion > Email.",
    );
  }

  return new Resend(apiKey);
}

interface WelcomeEmailParams {
  clientName: string;
  clientEmail: string;
  password: string;
  panelUrl: string;
}

/**
 * Premium welcome email with credentials.
 * Sent to the client after the coach creates the account.
 */
export async function sendClientWelcomeEmail(params: WelcomeEmailParams) {
  const { clientName, clientEmail, password, panelUrl } = params;

  const emailConfig = await getConfigSection("email");
  const resend = await getResendClient();

  const fromName = emailConfig.fromName || "Kiko Vargas";
  const fromEmail = emailConfig.fromEmail || "noreply@kikovargass.com";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tu acceso a Kikovargas.fit</title>
</head>
<body style="margin:0;padding:0;background:#030303;color:#ededed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#030303">

    <!-- Gold top bar -->
    <div style="height:3px;background:linear-gradient(90deg,transparent,#c9a84c 20%,#c9a84c 80%,transparent)"></div>

    <!-- Header -->
    <div style="padding:48px 32px 24px;text-align:center">
      <div style="display:inline-block;padding:8px 16px;border:1px solid rgba(201,168,76,0.3);border-radius:100px;background:rgba(201,168,76,0.08);font-size:10px;font-weight:700;letter-spacing:0.3em;color:#c9a84c;text-transform:uppercase;margin-bottom:24px">
        Acceso confirmado
      </div>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.15;color:#ededed;text-transform:uppercase">
        Bienvenido,<br><span style="color:#c9a84c">${escapeHtml(clientName.split(" ")[0])}</span>
      </h1>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#a8a8a8">
        Tu panel privado esta listo. Desde hoy tendras acceso a tus entrenamientos, dietas,
        checklist, documentos y facturas en un solo lugar.
      </p>
    </div>

    <!-- Credentials card -->
    <div style="padding:0 24px 24px">
      <div style="background:#0e0e0e;border:1px solid rgba(255,255,255,0.06);border-left:3px solid #c9a84c;border-radius:12px;padding:24px">
        <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:0.25em;color:#c9a84c;text-transform:uppercase">
          Tus datos de acceso
        </p>

        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;font-size:11px;color:#6b6b76;letter-spacing:0.12em;text-transform:uppercase;width:110px;vertical-align:top">Email</td>
            <td style="padding:8px 0;font-size:14px;color:#ededed;font-family:'SF Mono',monospace;word-break:break-all">${escapeHtml(clientEmail)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:11px;color:#6b6b76;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top">Contrasena</td>
            <td style="padding:8px 0;font-size:14px;color:#c9a84c;font-family:'SF Mono',monospace;font-weight:600">${escapeHtml(password)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:11px;color:#6b6b76;letter-spacing:0.12em;text-transform:uppercase;vertical-align:top">Panel</td>
            <td style="padding:8px 0;font-size:13px;color:#ededed;font-family:'SF Mono',monospace;word-break:break-all">${escapeHtml(panelUrl)}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- CTA -->
    <div style="padding:0 32px 24px;text-align:center">
      <a href="${escapeHtml(panelUrl)}" style="display:inline-block;background:#c9a84c;color:#030303;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">
        Acceder a mi panel
      </a>
    </div>

    <!-- Next steps -->
    <div style="padding:16px 32px 32px">
      <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#6b6b76;text-transform:uppercase">
        Proximos pasos
      </p>
      <ol style="margin:0;padding-left:20px;color:#a8a8a8;font-size:13px;line-height:1.8">
        <li style="margin-bottom:8px">Entra a tu panel con el email y contrasena de arriba</li>
        <li style="margin-bottom:8px">Recomendacion: cambia tu contrasena en tu primer acceso</li>
        <li>Empezaras a ver tus entrenamientos y plan cuando Kiko los asigne</li>
      </ol>
    </div>

    <!-- Security note -->
    <div style="padding:0 32px 32px">
      <div style="background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.12);border-radius:8px;padding:14px 16px">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#a8a8a8">
          <strong style="color:#c9a84c">Importante:</strong> guarda este email en un lugar seguro
          o apunta tu contrasena. Si la pierdes, contacta directamente con Kiko para recuperarla.
        </p>
      </div>
    </div>

    <!-- Divider -->
    <div style="padding:0 32px">
      <div style="height:1px;background:rgba(255,255,255,0.06)"></div>
    </div>

    <!-- Footer -->
    <div style="padding:24px 32px 40px;text-align:center">
      <p style="margin:0;font-size:11px;color:#6b6b76;letter-spacing:0.1em">
        Kikovargas<span style="color:#c9a84c">.fit</span> &middot; Plataforma privada
      </p>
    </div>

  </div>
</body>
</html>`;

  return resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: clientEmail,
    subject: `Tu acceso privado a Kikovargas.fit`,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
