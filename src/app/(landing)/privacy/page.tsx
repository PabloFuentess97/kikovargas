import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/landing/legal-layout";

export const metadata: Metadata = {
  title: "Política de Privacidad",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="14 de abril de 2026">
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es <strong className="text-primary">Kiko Vargas</strong> (en
          adelante, &ldquo;el Responsable&rdquo;), con domicilio digital en{" "}
          <a href="mailto:contacto@kikovargass.com" className="text-accent hover:text-accent-hover transition-colors">
            contacto@kikovargass.com
          </a>.
        </p>
        <p>
          Este sitio web (kikovargass.com) es una plataforma de marca personal dedicada al
          bodybuilding profesional, coaching deportivo y colaboraciones con marcas del sector
          fitness. La presente Política de Privacidad describe cómo recopilamos, usamos y
          protegemos tu información personal de acuerdo con el Reglamento General de Protección
          de Datos (RGPD) y la legislación aplicable.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recopilamos">
        <p>Recopilamos información personal exclusivamente a través de los siguientes canales:</p>

        <p><strong className="text-primary/80">a) Formulario de contacto</strong></p>
        <p>
          Cuando nos envías un mensaje a través del formulario de contacto del sitio, recopilamos:
          nombre completo, dirección de correo electrónico, número de teléfono (opcional), asunto
          y contenido del mensaje. Estos datos se almacenan en nuestra base de datos PostgreSQL
          alojada en servidores seguros y se utilizan exclusivamente para atender tu consulta.
        </p>

        <p><strong className="text-primary/80">b) Notificaciones por correo electrónico</strong></p>
        <p>
          Al enviar el formulario de contacto, tus datos (nombre, email, asunto y mensaje) se
          transmiten a través del servicio <strong className="text-primary/80">Resend</strong> para
          generar una notificación por correo electrónico al equipo de Kiko Vargas. Resend actúa
          como encargado del tratamiento y procesa los datos conforme a su propia política de
          privacidad. No utilizamos tu correo electrónico para enviar comunicaciones comerciales
          ni newsletters sin tu consentimiento expreso.
        </p>

        <p><strong className="text-primary/80">c) Datos de navegación (analítica)</strong></p>
        <p>
          Si aceptas el uso de cookies de analítica, recopilamos de forma automatizada: la URL de
          la página visitada, la URL de referencia, la dirección IP (anonimizada en el
          almacenamiento), el país y ciudad aproximados (derivados de la IP por cabeceras del
          servidor), el tipo de dispositivo, sistema operativo y navegador, y la fecha y hora de
          la visita. Estos datos se procesan de forma agregada con el único fin de entender cómo
          los visitantes interactúan con el sitio y mejorar la experiencia de usuario.
        </p>
      </LegalSection>

      <LegalSection title="3. Base legal del tratamiento">
        <p>El tratamiento de tus datos se fundamenta en:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-primary/80">Consentimiento</strong> (Art. 6.1.a RGPD): al enviar el formulario de
            contacto y al aceptar las cookies de analítica.
          </li>
          <li>
            <strong className="text-primary/80">Interés legítimo</strong> (Art. 6.1.f RGPD): para el funcionamiento
            técnico del sitio, la seguridad y la prevención de fraude.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Conservación de datos">
        <p>
          Los mensajes de contacto se conservan durante un máximo de 24 meses desde su recepción,
          salvo que exista una obligación legal o contractual que justifique una conservación más
          prolongada. Los datos de analítica se conservan durante 12 meses en forma agregada y
          se eliminan automáticamente tras ese periodo.
        </p>
      </LegalSection>

      <LegalSection title="5. Destinatarios de los datos">
        <p>Tus datos personales pueden ser compartidos con los siguientes terceros, exclusivamente para las finalidades indicadas:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className="text-primary/80">Resend Inc.</strong> — Servicio de envío de correo electrónico transaccional para notificaciones del formulario de contacto.</li>
          <li><strong className="text-primary/80">Vercel Inc.</strong> — Alojamiento del sitio web. Los datos de geolocalización (país/ciudad) se derivan de las cabeceras proporcionadas por su infraestructura.</li>
          <li><strong className="text-primary/80">Proveedor de base de datos PostgreSQL</strong> — Almacenamiento seguro de los datos del formulario de contacto y analítica.</li>
          <li><strong className="text-primary/80">Almacenamiento local</strong> — Las imágenes de la galería se almacenan en el servidor propio del sitio (no se utilizan servicios externos de almacenamiento).</li>
        </ul>
        <p>
          No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales.
        </p>
      </LegalSection>

      <LegalSection title="6. Transferencias internacionales">
        <p>
          Algunos de nuestros proveedores de servicios (Resend, Vercel) tienen sede en
          Estados Unidos. Las transferencias de datos fuera del Espacio Económico Europeo se realizan
          bajo las garantías adecuadas, incluyendo las Cláusulas Contractuales Tipo aprobadas por la
          Comisión Europea y el Marco de Privacidad de Datos UE-EE.UU.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          De acuerdo con la normativa vigente, puedes ejercer los siguientes derechos en cualquier
          momento escribiendo a{" "}
          <a href="mailto:contacto@kikovargass.com" className="text-accent hover:text-accent-hover transition-colors">
            contacto@kikovargass.com
          </a>:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong className="text-primary/80">Acceso</strong>: solicitar confirmación de si tratamos tus datos y obtener una copia.</li>
          <li><strong className="text-primary/80">Rectificación</strong>: corregir datos inexactos o completar datos incompletos.</li>
          <li><strong className="text-primary/80">Supresión</strong>: solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
          <li><strong className="text-primary/80">Limitación</strong>: solicitar la restricción del tratamiento en determinadas circunstancias.</li>
          <li><strong className="text-primary/80">Portabilidad</strong>: recibir tus datos en un formato estructurado y legible por máquina.</li>
          <li><strong className="text-primary/80">Oposición</strong>: oponerte al tratamiento de tus datos por motivos legítimos.</li>
        </ul>
        <p>
          Responderemos a tu solicitud en un plazo máximo de 30 días. Si consideras que tus derechos
          no han sido atendidos adecuadamente, puedes presentar una reclamación ante la autoridad de
          protección de datos competente.
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales
          contra el acceso no autorizado, la alteración, divulgación o destrucción. Entre ellas:
          cifrado de contraseñas mediante bcrypt, autenticación basada en tokens JWT con cookies httpOnly,
          comunicaciones cifradas mediante HTTPS, y acceso restringido al panel de administración.
        </p>
      </LegalSection>

      <LegalSection title="9. Modificaciones">
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento.
          Cualquier modificación será publicada en esta misma página con la fecha de actualización
          correspondiente. Te recomendamos revisar esta página periódicamente.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Para cualquier consulta relacionada con la privacidad de tus datos, puedes contactarnos en:{" "}
          <a href="mailto:contacto@kikovargass.com" className="text-accent hover:text-accent-hover transition-colors">
            contacto@kikovargass.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
