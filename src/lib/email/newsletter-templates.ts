/** Base email layout with brand styling */
function baseLayout(content: string, unsubscribeUrl: string): string {
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
      <p style="color:#555;font-size:12px;margin:0 0 8px">
        Recibes este email porque te suscribiste a la newsletter de Kiko Vargas.
      </p>
      <a href="${unsubscribeUrl}" style="color:#c9a84c;font-size:12px;text-decoration:underline">
        Cancelar suscripcion
      </a>
    </div>
  </div>
</body>
</html>`;
}

/** Template: New blog post published */
export function newPostTemplate(post: {
  title: string;
  excerpt?: string | null;
  slug: string;
  coverUrl?: string | null;
}, baseUrl: string, unsubscribeUrl: string): string {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const coverHtml = post.coverUrl
    ? `<img src="${baseUrl}${post.coverUrl}" alt="${post.title}" style="width:100%;border-radius:8px;margin-bottom:24px" />`
    : "";

  const content = `
    <p style="color:#c9a84c;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px">Nuevo articulo</p>
    ${coverHtml}
    <h1 style="color:#ededed;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3">${post.title}</h1>
    ${post.excerpt ? `<p style="color:#999;font-size:15px;line-height:1.6;margin:0 0 24px">${post.excerpt}</p>` : ""}
    <div style="text-align:center;padding:8px 0">
      <a href="${postUrl}" style="display:inline-block;background:#c9a84c;color:#030303;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;letter-spacing:0.5px">
        Leer articulo
      </a>
    </div>
  `;

  return baseLayout(content, unsubscribeUrl);
}

/** Template: Custom campaign */
export function customTemplate(body: string, unsubscribeUrl: string): string {
  const content = `
    <div style="color:#b0b0b0;font-size:15px;line-height:1.7">
      ${body}
    </div>
  `;

  return baseLayout(content, unsubscribeUrl);
}

/** Template: Welcome email */
export function welcomeTemplate(name: string, unsubscribeUrl: string): string {
  const content = `
    <h1 style="color:#ededed;font-size:22px;font-weight:700;margin:0 0 16px">Bienvenido${name ? `, ${name}` : ""}!</h1>
    <p>Gracias por suscribirte a la newsletter de <strong style="color:#ededed">Kiko Vargas</strong>.</p>
    <p>Recibiras las ultimas novedades sobre bodybuilding, fitness, entrenamientos y contenido exclusivo directamente en tu email.</p>
    <p style="color:#c9a84c;font-weight:600;margin-top:24px">Nos vemos pronto!</p>
  `;

  return baseLayout(content, unsubscribeUrl);
}
