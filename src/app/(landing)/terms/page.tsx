import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/landing/legal-layout";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Términos y Condiciones" lastUpdated="14 de abril de 2026">
      <LegalSection title="1. Identificación">
        <p>
          El presente sitio web, accesible en la dirección kikovargass.com, es propiedad de{" "}
          <strong className="text-primary">Kiko Vargas</strong> (en adelante, &ldquo;el Titular&rdquo;).
          Para cualquier comunicación, puedes dirigirte a{" "}
          <a href="mailto:contacto@kikovargass.com" className="text-accent hover:text-accent-hover transition-colors">
            contacto@kikovargass.com
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto y ámbito de aplicación">
        <p>
          Estos Términos y Condiciones regulan el acceso y uso del sitio web kikovargass.com,
          una plataforma de marca personal dedicada al bodybuilding profesional, coaching
          deportivo y colaboraciones con marcas del sector fitness.
        </p>
        <p>
          Al acceder y utilizar este sitio web, aceptas quedar vinculado por estos Términos y
          Condiciones. Si no estás de acuerdo con alguno de ellos, te rogamos que no utilices
          el sitio.
        </p>
      </LegalSection>

      <LegalSection title="3. Servicios ofrecidos">
        <p>
          A través de este sitio web, el Titular ofrece información sobre su trayectoria como
          atleta profesional de bodybuilding, incluyendo:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Información biográfica y trayectoria deportiva.</li>
          <li>Galería de imágenes de competiciones, entrenamientos y sesiones fotográficas.</li>
          <li>Artículos y contenido editorial relacionado con el fitness y la competición.</li>
          <li>Formulario de contacto para consultas sobre colaboraciones, sponsorships y coaching.</li>
        </ul>
        <p>
          El sitio no constituye una tienda online ni ofrece venta directa de productos o servicios.
          Las condiciones específicas de cualquier servicio de coaching o colaboración se acordarán
          de forma individual y directa entre las partes.
        </p>
      </LegalSection>

      <LegalSection title="4. Propiedad intelectual">
        <p>
          Todos los contenidos del sitio web, incluyendo pero no limitado a textos, fotografías,
          imágenes, diseño gráfico, logotipos, iconos, videos y cualquier otro material, están
          protegidos por las leyes de propiedad intelectual e industrial aplicables y son propiedad
          del Titular o de terceros que han autorizado su uso.
        </p>
        <p>
          Queda expresamente prohibida la reproducción, distribución, comunicación pública,
          transformación o cualquier otra forma de explotación de los contenidos de este sitio web
          sin la autorización previa y por escrito del Titular, excepto para uso personal y privado.
        </p>
        <p>
          Las fotografías de competiciones y eventos pueden estar sujetas a derechos de terceros
          (fotógrafos, organizadores de eventos, federaciones). Su presencia en este sitio no
          implica cesión de derechos sobre las mismas.
        </p>
      </LegalSection>

      <LegalSection title="5. Uso del formulario de contacto">
        <p>
          El formulario de contacto está destinado exclusivamente a consultas legítimas relacionadas
          con colaboraciones profesionales, sponsorships, servicios de coaching y consultas generales.
          Al utilizar el formulario, te comprometes a:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Proporcionar información veraz y actualizada.</li>
          <li>No enviar contenido ofensivo, difamatorio, ilegal o que vulnere derechos de terceros.</li>
          <li>No utilizar el formulario con fines publicitarios no solicitados (spam).</li>
          <li>No realizar envíos automatizados o masivos.</li>
        </ul>
        <p>
          El Titular se reserva el derecho de no responder a mensajes que incumplan estas condiciones
          y de bloquear el acceso al formulario en caso de uso abusivo.
        </p>
      </LegalSection>

      <LegalSection title="6. Contenido editorial y disclaimers">
        <p>
          Los artículos publicados en la sección de blog tienen carácter informativo y reflejan
          la experiencia personal del Titular en el ámbito del bodybuilding competitivo. En ningún
          caso deben interpretarse como consejo médico, nutricional o de entrenamiento profesional.
        </p>
        <p>
          Antes de iniciar cualquier programa de entrenamiento, dieta o suplementación, consulta
          con un profesional de la salud cualificado. El Titular no se responsabiliza de los
          resultados derivados de la aplicación de la información contenida en los artículos
          sin la supervisión adecuada.
        </p>
      </LegalSection>

      <LegalSection title="7. Enlaces externos">
        <p>
          Este sitio web puede contener enlaces a plataformas externas (Instagram, YouTube, TikTok
          y otros). Estos enlaces se proporcionan únicamente como referencia y comodidad para el
          usuario. El Titular no se responsabiliza del contenido, políticas de privacidad o prácticas
          de estos sitios de terceros.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilidad del sitio">
        <p>
          El Titular no garantiza la disponibilidad ininterrumpida del sitio web y no será responsable
          de los daños derivados de la falta de disponibilidad o continuidad del funcionamiento del
          sitio por causas ajenas a su voluntad, incluyendo pero no limitado a: fallos técnicos del
          proveedor de alojamiento, mantenimiento programado, ataques informáticos o causas de
          fuerza mayor.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitación de responsabilidad">
        <p>
          El Titular no será responsable de ningún daño directo, indirecto, incidental o consecuente
          derivado del acceso o uso de este sitio web, incluyendo daños por pérdida de datos,
          interrupción del servicio o virus informáticos. El uso del sitio web se realiza bajo la
          exclusiva responsabilidad del usuario.
        </p>
      </LegalSection>

      <LegalSection title="10. Modificaciones">
        <p>
          El Titular se reserva el derecho de modificar estos Términos y Condiciones en cualquier
          momento. Las modificaciones entrarán en vigor desde su publicación en esta página. El uso
          continuado del sitio tras la publicación de los cambios implica la aceptación de los mismos.
        </p>
      </LegalSection>

      <LegalSection title="11. Legislación aplicable y jurisdicción">
        <p>
          Estos Términos y Condiciones se rigen por la legislación vigente. Para la resolución de
          cualquier controversia que pudiera derivarse del acceso o uso de este sitio web, las partes
          se someten a la jurisdicción de los tribunales correspondientes al domicilio del Titular,
          salvo que la normativa aplicable establezca una jurisdicción distinta.
        </p>
      </LegalSection>

      <LegalSection title="12. Contacto">
        <p>
          Para cualquier consulta sobre estos Términos y Condiciones, puedes escribirnos a:{" "}
          <a href="mailto:contacto@kikovargass.com" className="text-accent hover:text-accent-hover transition-colors">
            contacto@kikovargass.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
