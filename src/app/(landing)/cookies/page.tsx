import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/landing/legal-layout";

export const metadata: Metadata = {
  title: "Política de Cookies",
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Política de Cookies" lastUpdated="14 de abril de 2026">
      <LegalSection title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
          (ordenador, teléfono móvil o tablet) cuando los visitas. Se utilizan ampliamente para
          hacer que los sitios funcionen correctamente, mejorar la experiencia de usuario y
          proporcionar información al propietario del sitio.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies que utilizamos">
        <p>
          En kikovargass.com utilizamos un número reducido de cookies, todas ellas con una finalidad
          clara y específica. A continuación las detallamos:
        </p>

        <p><strong className="text-primary/80">a) Cookies técnicas (estrictamente necesarias)</strong></p>
        <p>
          Estas cookies son esenciales para el funcionamiento del sitio y no requieren tu consentimiento.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem] mt-2 mb-4">
            <thead>
              <tr className="border-b border-border-subtle text-left">
                <th className="py-2 pr-4 text-primary/80 font-semibold">Cookie</th>
                <th className="py-2 pr-4 text-primary/80 font-semibold">Finalidad</th>
                <th className="py-2 pr-4 text-primary/80 font-semibold">Duración</th>
              </tr>
            </thead>
            <tbody className="text-secondary/60">
              <tr className="border-b border-border-subtle/50">
                <td className="py-2 pr-4 font-mono text-accent/70">token</td>
                <td className="py-2 pr-4">Autenticación del panel de administración. Cookie httpOnly que almacena un token JWT.</td>
                <td className="py-2 pr-4">8 horas</td>
              </tr>
              <tr className="border-b border-border-subtle/50">
                <td className="py-2 pr-4 font-mono text-accent/70">cookie-consent</td>
                <td className="py-2 pr-4">Almacena tu preferencia sobre el uso de cookies de analítica.</td>
                <td className="py-2 pr-4">365 días</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p><strong className="text-primary/80">b) Cookies de analítica (requieren consentimiento)</strong></p>
        <p>
          Estas cookies solo se activan si aceptas su uso a través del banner de consentimiento.
          Nos permiten entender cómo los visitantes interactúan con el sitio recopilando información
          de forma agregada y anónima.
        </p>
        <p>
          Nuestro sistema de analítica es propio (no utilizamos Google Analytics ni servicios de
          terceros). Los datos recopilados incluyen: la página visitada, la URL de referencia,
          tipo de dispositivo, navegador, sistema operativo, país y ciudad aproximados (derivados
          de la dirección IP por las cabeceras del servidor) y la fecha/hora de la visita.
        </p>
        <p>
          Los datos de analítica se almacenan en nuestra base de datos PostgreSQL y se eliminan
          automáticamente tras 12 meses. En ningún caso se utilizan para identificar personalmente
          a los visitantes ni se comparten con terceros.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies de terceros">
        <p>
          Este sitio web está alojado en <strong className="text-primary/80">Vercel</strong>, que puede
          establecer cookies técnicas necesarias para el funcionamiento de su red de distribución
          de contenido (CDN) y protección contra ataques. Estas cookies son estrictamente necesarias
          y están fuera de nuestro control directo.
        </p>
        <p>
          El sistema de carga de imágenes utiliza almacenamiento local en el servidor y no
          establece cookies adicionales de terceros.
        </p>
        <p>
          No utilizamos cookies de publicidad, cookies de redes sociales, ni herramientas de
          seguimiento de terceros como Google Analytics, Facebook Pixel o similares.
        </p>
      </LegalSection>

      <LegalSection title="4. Gestión de cookies">
        <p>
          Puedes gestionar tus preferencias de cookies en cualquier momento de las siguientes formas:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-primary/80">Banner de consentimiento</strong>: al visitar el sitio por primera vez,
            se te mostrará un banner donde puedes aceptar o rechazar las cookies de analítica. Tu preferencia
            se guardará durante 365 días.
          </li>
          <li>
            <strong className="text-primary/80">Configuración del navegador</strong>: puedes configurar tu navegador
            para bloquear o eliminar cookies. Ten en cuenta que esto podría afectar al funcionamiento de
            algunas funcionalidades del sitio (como la sesión de administración).
          </li>
        </ul>

        <p>Instrucciones para los navegadores más comunes:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Chrome: Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios</li>
          <li>Firefox: Ajustes &gt; Privacidad y seguridad &gt; Cookies y datos de sitios</li>
          <li>Safari: Preferencias &gt; Privacidad &gt; Gestionar datos de sitios web</li>
          <li>Edge: Configuración &gt; Cookies y permisos del sitio &gt; Cookies y datos almacenados</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Actualizaciones">
        <p>
          Esta Política de Cookies puede actualizarse periódicamente para reflejar cambios en las
          cookies que utilizamos o por motivos legales. Te recomendamos revisarla regularmente.
          La fecha de la última actualización se indica al inicio de este documento.
        </p>
      </LegalSection>

      <LegalSection title="6. Contacto">
        <p>
          Si tienes preguntas sobre nuestra Política de Cookies, puedes escribirnos a:{" "}
          <a href="mailto:contacto@kikovargass.com" className="text-accent hover:text-accent-hover transition-colors">
            contacto@kikovargass.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
