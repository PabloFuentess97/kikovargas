import { Resend } from "resend";
import { getConfigSection } from "@/lib/config/get-config";

/** Get a configured Resend client for newsletter sending */
export async function getNewsletterResend(): Promise<{
  resend: Resend;
  fromName: string;
  fromEmail: string;
}> {
  const emailConfig = await getConfigSection("email");
  let apiKey = emailConfig.resendApiKey;

  if (!apiKey) {
    apiKey = process.env.RESEND_API_KEY || "";
  }

  if (!apiKey) {
    throw new Error("Resend API key no configurada. Ve a Ajustes > Email.");
  }

  return {
    resend: new Resend(apiKey),
    fromName: emailConfig.fromName || "Kiko Vargas",
    fromEmail: emailConfig.fromEmail || "noreply@kikovargass.com",
  };
}

/** Build unsubscribe URL */
export function unsubscribeUrl(baseUrl: string, email: string): string {
  const encoded = encodeURIComponent(email);
  return `${baseUrl}/api/newsletter/unsubscribe?email=${encoded}`;
}

/** Send email to a batch of recipients. Returns count of successful sends. */
export async function sendBatch(
  emails: string[],
  subject: string,
  htmlFn: (email: string) => string,
): Promise<number> {
  const { resend, fromName, fromEmail } = await getNewsletterResend();
  let sent = 0;

  // Resend batch API supports up to 100 emails per call
  const batchSize = 100;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((email) =>
        resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: email,
          subject,
          html: htmlFn(email),
        }),
      ),
    );

    sent += results.filter((r) => r.status === "fulfilled").length;
  }

  return sent;
}
