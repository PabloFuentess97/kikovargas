import { Resend } from "resend";
import { getConfigSection } from "@/lib/config/get-config";

/** Get Resend API key: DB config first, then env fallback */
async function getResendClient(): Promise<Resend> {
  // Try DB config first (already decrypted by getConfigSection)
  const emailConfig = await getConfigSection("email");
  let apiKey = emailConfig.resendApiKey;

  // Fallback to env var
  if (!apiKey) {
    apiKey = process.env.RESEND_API_KEY || "";
  }

  if (!apiKey) {
    throw new Error(
      "Resend API key no configurada. Configurala en Dashboard > Ajustes > Email, o define RESEND_API_KEY en las variables de entorno.",
    );
  }

  return new Resend(apiKey);
}

interface ContactEmailParams {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(params: ContactEmailParams) {
  const { name, email, phone, subject, message } = params;

  const emailConfig = await getConfigSection("email");
  const resend = await getResendClient();

  const fromName = emailConfig.fromName || "Kiko Vargas Web";
  const fromEmail = emailConfig.fromEmail || "noreply@kikovargass.com";
  const contactTo = emailConfig.contactEmailTo || process.env.CONTACT_EMAIL_TO || "contacto@kikovargass.com";

  return resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: contactTo,
    replyTo: email,
    subject: `Nuevo contacto: ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="margin-bottom:24px">Nuevo mensaje de contacto</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 12px;font-weight:600;vertical-align:top;width:100px">Nombre</td>
            <td style="padding:8px 12px">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;vertical-align:top">Email</td>
            <td style="padding:8px 12px"><a href="mailto:${email}">${email}</a></td>
          </tr>
          ${phone ? `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top">Telefono</td><td style="padding:8px 12px">${phone}</td></tr>` : ""}
          <tr>
            <td style="padding:8px 12px;font-weight:600;vertical-align:top">Asunto</td>
            <td style="padding:8px 12px">${subject}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;font-weight:600;vertical-align:top">Mensaje</td>
            <td style="padding:8px 12px;white-space:pre-wrap">${message}</td>
          </tr>
        </table>
      </div>
    `,
  });
}
