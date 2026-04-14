import { Resend } from "resend";
import { env } from "@/config/env";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
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

  return getResend().emails.send({
    from: "Kiko Vargas Web <noreply@kikovargass.com>",
    to: env.CONTACT_EMAIL_TO,
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
          ${phone ? `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top">Teléfono</td><td style="padding:8px 12px">${phone}</td></tr>` : ""}
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
