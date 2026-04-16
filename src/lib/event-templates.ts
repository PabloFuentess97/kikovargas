import type { BlockData, BlockType } from "@/components/event-blocks/types";

/* ─── Template Definitions ───────────────────────── */

export interface TemplateBlock {
  type: BlockType;
  data: BlockData;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  blocks: TemplateBlock[];
}

/* ─── Webinar Template ───────────────────────────── */

const webinarTemplate: EventTemplate = {
  id: "webinar",
  name: "Webinar",
  description: "Perfecto para webinars, masterclasses y presentaciones online.",
  blocks: [
    {
      type: "hero",
      data: {
        title: "Masterclass Exclusiva de Fitness",
        subtitle: "Aprende las tecnicas mas avanzadas de entrenamiento y nutricion de la mano de un profesional IFBB Pro.",
        ctaText: "Reserva tu plaza gratis",
        ctaHref: "#form",
      },
    },
    {
      type: "countdown",
      data: {
        heading: "El webinar comienza en",
        description: "No te pierdas esta oportunidad unica",
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
    },
    {
      type: "text",
      data: {
        heading: "Que vas a aprender?",
        body: "• Planificacion de entrenamientos para hipertrofia maxima\n• Nutricion avanzada para competidores\n• Suplementacion basada en evidencia\n• Preparacion mental para competiciones\n• Sesion de preguntas y respuestas en directo",
        align: "left",
      },
    },
    {
      type: "cta",
      data: {
        heading: "Plazas limitadas a 100 personas",
        description: "Este webinar es totalmente gratuito pero las plazas son limitadas.",
        buttonText: "Reserva tu plaza ahora",
        buttonHref: "#form",
        variant: "primary",
      },
    },
    {
      type: "faq",
      data: {
        heading: "Preguntas frecuentes",
        items: [
          { question: "Es gratuito?", answer: "Si, el webinar es 100% gratuito." },
          { question: "Necesito experiencia previa?", answer: "No, el contenido es apto para todos los niveles." },
          { question: "Quedara grabado?", answer: "Solo los asistentes en directo tendran acceso a la grabacion." },
          { question: "Donde se realiza?", answer: "Online, a traves de Zoom. Recibiras el enlace por email." },
        ],
      },
    },
    {
      type: "form",
      data: {
        heading: "Registrate ahora",
        description: "Rellena el formulario y recibiras toda la informacion por email.",
        buttonText: "Quiero asistir",
        fields: ["name", "email"],
      },
    },
  ],
};

/* ─── Fitness Event Template ─────────────────────── */

const fitnessTemplate: EventTemplate = {
  id: "fitness",
  name: "Evento Fitness",
  description: "Para eventos presenciales, competiciones y open days.",
  blocks: [
    {
      type: "hero",
      data: {
        title: "Kiko Vargas Fitness Experience",
        subtitle: "Un dia completo de entrenamiento, nutricion y motivacion. Vive la experiencia de entrenar con un IFBB Pro.",
        ctaText: "Consigue tu entrada",
        ctaHref: "#form",
      },
    },
    {
      type: "text",
      data: {
        heading: "Que incluye?",
        body: "• Sesion de entrenamiento grupal guiada\n• Charla sobre nutricion deportiva\n• Posing clinic para competidores\n• Meet & greet con fotos\n• Goodie bag con productos de sponsors\n• Certificado de asistencia",
        align: "left",
      },
    },
    {
      type: "countdown",
      data: {
        heading: "Cuenta atras para el evento",
        description: "",
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    },
    {
      type: "cta",
      data: {
        heading: "Solo 50 plazas disponibles",
        description: "Un evento exclusivo y presencial. No te quedes fuera.",
        buttonText: "Reservar mi plaza",
        buttonHref: "#form",
        variant: "primary",
      },
    },
    {
      type: "faq",
      data: {
        heading: "Informacion del evento",
        items: [
          { question: "Donde se celebra?", answer: "La ubicacion exacta se enviara por email una semana antes del evento." },
          { question: "Que debo llevar?", answer: "Ropa deportiva comoda, agua, toalla y muchas ganas de entrenar." },
          { question: "Hay parking?", answer: "Si, el recinto cuenta con parking gratuito." },
          { question: "Puedo llevar acompanante?", answer: "Cada entrada es individual. Tu acompanante necesitara su propia entrada." },
        ],
      },
    },
    {
      type: "form",
      data: {
        heading: "Reserva tu plaza",
        description: "Rellena tus datos y te contactaremos con toda la informacion.",
        buttonText: "Reservar ahora",
        fields: ["name", "email", "phone"],
      },
    },
  ],
};

/* ─── Coaching Session Template ──────────────────── */

const coachingTemplate: EventTemplate = {
  id: "coaching",
  name: "Sesion de Coaching",
  description: "Para ofrecer consultas, asesorias y sesiones 1 a 1.",
  blocks: [
    {
      type: "hero",
      data: {
        title: "Coaching Personalizado con Kiko Vargas",
        subtitle: "Lleva tu fisico al siguiente nivel con un plan personalizado disenado por un profesional IFBB Pro.",
        ctaText: "Solicitar informacion",
        ctaHref: "#form",
      },
    },
    {
      type: "text",
      data: {
        heading: "Que incluye el coaching?",
        body: "• Evaluacion fisica completa inicial\n• Plan de entrenamiento 100% personalizado\n• Plan de nutricion adaptado a tus objetivos\n• Seguimiento semanal con ajustes\n• Acceso directo por WhatsApp\n• Revision de posing (competidores)",
        align: "left",
      },
    },
    {
      type: "cta",
      data: {
        heading: "Transforma tu fisico",
        description: "Resultados reales con un metodo probado en competicion.",
        buttonText: "Quiero mas informacion",
        buttonHref: "#form",
        variant: "outline",
      },
    },
    {
      type: "form",
      data: {
        heading: "Solicita tu plaza",
        description: "Cuentanos un poco sobre ti y tus objetivos. Te responderemos en menos de 24h.",
        buttonText: "Enviar solicitud",
        fields: ["name", "email", "phone", "message"],
      },
    },
  ],
};

/* ─── Export all templates ────────────────────────── */

export const EVENT_TEMPLATES: EventTemplate[] = [
  webinarTemplate,
  fitnessTemplate,
  coachingTemplate,
];

export function getTemplateById(id: string): EventTemplate | undefined {
  return EVENT_TEMPLATES.find((t) => t.id === id);
}
