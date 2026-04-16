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
/* Structure: Hero → Stats → Features → Video → Countdown → Testimonials → FAQ → CTA → Form */

const webinarTemplate: EventTemplate = {
  id: "webinar",
  name: "Webinar",
  description: "Perfecto para webinars, masterclasses y presentaciones online.",
  blocks: [
    {
      type: "hero",
      data: {
        title: "Masterclass Gratuita: Hipertrofia Avanzada",
        subtitle: "Descubre las tecnicas de entrenamiento y nutricion que usan los profesionales IFBB Pro para llevar su fisico al siguiente nivel. En directo y con sesion de preguntas.",
        ctaText: "Reserva tu plaza gratis",
        ctaHref: "#form",
      },
    },
    {
      type: "stats",
      data: {
        items: [
          { value: "500+", label: "Alumnos formados" },
          { value: "12", label: "Anos de experiencia" },
          { value: "IFBB Pro", label: "Categoria" },
          { value: "100%", label: "Gratuito" },
        ],
      },
    },
    {
      type: "divider",
      data: { style: "dots" },
    },
    {
      type: "features",
      data: {
        heading: "Que vas a aprender en esta masterclass",
        description: "90 minutos de contenido de alto valor basado en ciencia y experiencia real en competicion.",
        columns: 3,
        items: [
          {
            icon: "💪",
            title: "Entrenamiento Avanzado",
            description: "Periodizacion, tecnicas de intensidad y programacion para hipertrofia maxima con evidencia cientifica.",
          },
          {
            icon: "🥗",
            title: "Nutricion Estrategica",
            description: "Como estructurar macros, timing de nutrientes y suplementacion efectiva para tus objetivos.",
          },
          {
            icon: "🧠",
            title: "Mentalidad de Campeon",
            description: "Preparacion mental, consistencia y gestion del estres que marcan la diferencia en tu progreso.",
          },
          {
            icon: "📊",
            title: "Tracking y Progresion",
            description: "Herramientas y metodos para medir tu avance real y ajustar tu planificacion en tiempo real.",
          },
          {
            icon: "🎯",
            title: "Posing & Presentacion",
            description: "Fundamentos de posing para competidores y como mejorar tu estetica visual paso a paso.",
          },
          {
            icon: "❓",
            title: "Q&A en Directo",
            description: "Sesion de preguntas y respuestas al final del webinar. Resuelve todas tus dudas en directo.",
          },
        ],
      },
    },
    {
      type: "video",
      data: {
        heading: "Mira lo que te espera",
        description: "Un breve adelanto del contenido que compartiremos en la masterclass.",
        url: "",
      },
    },
    {
      type: "countdown",
      data: {
        heading: "La masterclass comienza en",
        description: "Plazas limitadas a 100 personas — no te quedes fuera",
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
    },
    {
      type: "divider",
      data: { style: "line", label: "TESTIMONIOS" },
    },
    {
      type: "testimonials",
      data: {
        heading: "Lo que dicen quienes ya han asistido",
        items: [
          {
            name: "Carlos Ruiz",
            role: "Competidor Amateur",
            text: "La informacion que Kiko comparte en sus masterclasses es de un nivel increible. Cambie completamente mi enfoque de entrenamiento y los resultados hablan por si solos.",
          },
          {
            name: "Laura Martinez",
            role: "Fitness Enthusiast",
            text: "Pense que ya lo sabia todo sobre nutricion deportiva hasta que asisti a su webinar. Aprendi mas en 90 minutos que en meses leyendo por mi cuenta.",
          },
          {
            name: "David Gomez",
            role: "Preparador Fisico",
            text: "Como profesional del fitness, valoro mucho la calidad del contenido. Kiko explica conceptos complejos de forma clara y siempre respaldado por evidencia.",
          },
        ],
      },
    },
    {
      type: "faq",
      data: {
        heading: "Preguntas frecuentes",
        items: [
          { question: "Es realmente gratuito?", answer: "Si, la masterclass es 100% gratuita. Solo necesitas registrarte para reservar tu plaza y recibiras el enlace de acceso por email." },
          { question: "Necesito experiencia previa?", answer: "El contenido es avanzado pero accesible. Si llevas al menos 6 meses entrenando, aprovecharas al maximo cada minuto." },
          { question: "Quedara grabada?", answer: "Solo los asistentes en directo tendran acceso a la grabacion durante 48 horas. Otra razon mas para no faltar." },
          { question: "Donde se realiza?", answer: "Online, a traves de Zoom. Recibiras el enlace de acceso por email 24 horas antes y un recordatorio 1 hora antes del inicio." },
          { question: "Puedo hacer preguntas?", answer: "Por supuesto. Reservamos los ultimos 20 minutos para una sesion de Q&A donde respondo a todas las preguntas en directo." },
          { question: "Que necesito para asistir?", answer: "Solo un dispositivo con conexion a internet. Recomendamos tener papel y boligrafo para tomar notas." },
        ],
      },
    },
    {
      type: "cta",
      data: {
        heading: "Solo quedan unas pocas plazas",
        description: "Mas de 300 personas ya se han registrado. Las plazas estan limitadas a 100 asistentes para mantener la calidad de la sesion.",
        buttonText: "Quiero mi plaza gratuita",
        buttonHref: "#form",
        variant: "primary",
      },
    },
    {
      type: "form",
      data: {
        heading: "Registrate ahora",
        description: "Rellena tus datos y recibiras toda la informacion de acceso por email. Tu plaza queda confirmada al instante.",
        buttonText: "Reservar mi plaza gratis",
        fields: ["name", "email"],
      },
    },
  ],
};

/* ─── Fitness Event Template ─────────────────────── */
/* Structure: Hero → Stats → Features → Pricing → Countdown → Testimonials → Gallery → FAQ → CTA → Form */

const fitnessTemplate: EventTemplate = {
  id: "fitness",
  name: "Evento Fitness",
  description: "Para eventos presenciales, competiciones y open days.",
  blocks: [
    {
      type: "hero",
      data: {
        title: "Kiko Vargas Fitness Experience",
        subtitle: "Un dia completo e irrepetible de entrenamiento, nutricion y motivacion. Vive la experiencia de entrenar con un profesional IFBB Pro y transforma tu forma de entender el fitness.",
        ctaText: "Consigue tu entrada",
        ctaHref: "#pricing",
      },
    },
    {
      type: "stats",
      data: {
        items: [
          { value: "8h", label: "De contenido" },
          { value: "50", label: "Plazas limitadas" },
          { value: "5", label: "Actividades" },
          { value: "1", label: "Dia inolvidable" },
        ],
      },
    },
    {
      type: "divider",
      data: { style: "dots" },
    },
    {
      type: "features",
      data: {
        heading: "Que incluye el evento",
        description: "Una experiencia completa disenada para que aproveches cada minuto al maximo.",
        columns: 3,
        items: [
          {
            icon: "🏋️",
            title: "Entrenamiento Grupal",
            description: "Sesion de entrenamiento guiada por Kiko con tecnicas avanzadas. Adaptada a todos los niveles.",
          },
          {
            icon: "🍽️",
            title: "Charla de Nutricion",
            description: "Masterclass practica sobre nutricion deportiva: como calcular macros, meal prep y suplementacion.",
          },
          {
            icon: "🏆",
            title: "Posing Clinic",
            description: "Sesion exclusiva de posing para competidores con correccion individual y tips profesionales.",
          },
          {
            icon: "📸",
            title: "Meet & Greet",
            description: "Sesion de fotos y tiempo para conocer a Kiko en persona. Lleva tu telefono preparado!",
          },
          {
            icon: "🎁",
            title: "Goodie Bag",
            description: "Pack de productos de nuestros sponsors: suplementos, merch exclusivo y descuentos especiales.",
          },
          {
            icon: "📜",
            title: "Certificado",
            description: "Certificado oficial de asistencia al evento firmado por Kiko Vargas.",
          },
        ],
      },
    },
    {
      type: "text",
      data: {
        heading: "Un evento disenado para ti",
        body: "Da igual si eres principiante o si ya compites: este evento esta pensado para que <strong>aprendas, disfrutes y te lleves herramientas reales</strong> para mejorar tu fisico y tu relacion con el entrenamiento.\n\nKiko Vargas lleva mas de 12 anos dedicado al mundo del fitness y la competicion. Su enfoque combina ciencia, experiencia y una pasion contagiosa que ha ayudado a cientos de personas a transformar sus vidas.",
        align: "center",
      },
    },
    {
      type: "pricing",
      data: {
        heading: "Elige tu entrada",
        description: "Dos opciones para vivir la experiencia a tu manera.",
        plans: [
          {
            name: "Entrada General",
            price: "49€",
            period: "",
            features: [
              "Acceso completo al evento (8h)",
              "Entrenamiento grupal guiado",
              "Charla de nutricion",
              "Meet & greet con fotos",
              "Goodie bag con productos",
              "Certificado de asistencia",
            ],
            buttonText: "Reservar General",
            buttonHref: "#form",
            highlighted: false,
          },
          {
            name: "Entrada VIP",
            price: "89€",
            period: "",
            features: [
              "Todo lo de la General +",
              "Posing clinic exclusivo",
              "Almuerzo con Kiko (networking)",
              "Revision de fisico individual",
              "Plan de entrenamiento personalizado",
              "Grupo privado de WhatsApp",
              "10% dto. en coaching online",
            ],
            buttonText: "Reservar VIP",
            buttonHref: "#form",
            highlighted: true,
          },
        ],
      },
    },
    {
      type: "countdown",
      data: {
        heading: "Cuenta atras para el evento",
        description: "No dejes tu plaza para el ultimo momento",
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
    },
    {
      type: "divider",
      data: { style: "line", label: "EXPERIENCIAS" },
    },
    {
      type: "testimonials",
      data: {
        heading: "Lo que dicen los asistentes anteriores",
        items: [
          {
            name: "Marcos Fernandez",
            role: "Asistente VIP - Edicion anterior",
            text: "El mejor evento fitness al que he asistido. La energia del grupo, la calidad del contenido y la cercania de Kiko hacen que sea una experiencia unica. Repito seguro.",
          },
          {
            name: "Ana Belen Torres",
            role: "Competidora Bikini Fitness",
            text: "El posing clinic me cambio completamente. Kiko detecto errores que llevaba meses arrastrando y en 30 minutos entendi como corregirlos. Vale cada euro.",
          },
          {
            name: "Roberto Sanchez",
            role: "Fitness Lifestyle",
            text: "Fui sin expectativas y volvi con un plan de accion claro para los proximos 6 meses. El networking con otros asistentes fue un plus increible.",
          },
        ],
      },
    },
    {
      type: "faq",
      data: {
        heading: "Informacion practica",
        items: [
          { question: "Donde se celebra?", answer: "La ubicacion exacta se comunicara por email una semana antes del evento. Sera en una instalacion premium con todo el equipamiento necesario." },
          { question: "Que debo llevar?", answer: "Ropa deportiva comoda, zapatillas de entrenamiento, agua, toalla y muchas ganas. Te proporcionaremos shaker y snacks durante la jornada." },
          { question: "Hay parking?", answer: "Si, el recinto cuenta con parking gratuito para todos los asistentes. Tambien es accesible en transporte publico." },
          { question: "Puedo llevar acompanante?", answer: "Cada entrada es individual para mantener la exclusividad. Tu acompanante puede comprar su propia entrada (si quedan plazas)." },
          { question: "Que pasa si no puedo asistir?", answer: "Puedes transferir tu entrada a otra persona hasta 72h antes del evento. No se realizan devoluciones." },
          { question: "Hay opcion vegetariana/vegana para el almuerzo VIP?", answer: "Si, al registrarte podras indicar tus preferencias alimentarias y nos adaptaremos a tus necesidades." },
        ],
      },
    },
    {
      type: "cta",
      data: {
        heading: "Solo 50 plazas disponibles",
        description: "Un evento exclusivo y presencial que no se repetira. Cada edicion se agota semanas antes. No te quedes fuera.",
        buttonText: "Reservar mi plaza ahora",
        buttonHref: "#form",
        variant: "primary",
      },
    },
    {
      type: "form",
      data: {
        heading: "Reserva tu entrada",
        description: "Rellena tus datos y te contactaremos con toda la informacion de pago y logistica del evento.",
        buttonText: "Quiero asistir",
        fields: ["name", "email", "phone"],
      },
    },
  ],
};

/* ─── Coaching Session Template ──────────────────── */
/* Structure: Hero → Stats → Features → Video → Divider → Pricing → Testimonials → Text → FAQ → CTA → Form */

const coachingTemplate: EventTemplate = {
  id: "coaching",
  name: "Coaching Online",
  description: "Para ofrecer planes de coaching, asesorias y seguimiento personalizado.",
  blocks: [
    {
      type: "hero",
      data: {
        title: "Coaching Personalizado con Kiko Vargas",
        subtitle: "Lleva tu fisico al siguiente nivel con un plan 100% personalizado disenado por un profesional IFBB Pro. Entrenamiento, nutricion y mentalidad — todo adaptado a ti.",
        ctaText: "Quiero transformarme",
        ctaHref: "#pricing",
      },
    },
    {
      type: "stats",
      data: {
        heading: "Resultados que hablan por si solos",
        items: [
          { value: "200+", label: "Alumnos transformados" },
          { value: "95%", label: "Tasa de satisfaccion" },
          { value: "12+", label: "Anos de experiencia" },
          { value: "50+", label: "Competidores preparados" },
        ],
      },
    },
    {
      type: "divider",
      data: { style: "dots" },
    },
    {
      type: "features",
      data: {
        heading: "Que incluye el coaching",
        description: "Un sistema completo y probado para que consigas resultados reales, sin importar tu punto de partida.",
        columns: 2,
        items: [
          {
            icon: "📋",
            title: "Plan de Entrenamiento Personalizado",
            description: "Rutina disenada al 100% para tus objetivos, nivel, disponibilidad y equipamiento. Actualizada cada 4-6 semanas.",
          },
          {
            icon: "🥑",
            title: "Plan de Nutricion a Medida",
            description: "Calculo de macros, estructura de comidas y opciones flexibles adaptadas a tus gustos y estilo de vida.",
          },
          {
            icon: "📱",
            title: "Seguimiento Semanal",
            description: "Check-in semanal con revision de fotos, medidas, peso y sensaciones. Ajustes en tiempo real basados en tu progreso.",
          },
          {
            icon: "💬",
            title: "Acceso Directo por WhatsApp",
            description: "Comunicacion directa para resolver dudas, ajustar comidas o recibir motivacion cuando mas lo necesitas.",
          },
          {
            icon: "📊",
            title: "App de Seguimiento",
            description: "Acceso a plataforma con tus planes, videos de ejercicios, registro de progreso y metricas detalladas.",
          },
          {
            icon: "🏆",
            title: "Prep de Competicion",
            description: "Si tu objetivo es competir: peak week, carga de carbos, posing, bronceado y preparacion completa para el dia D.",
          },
        ],
      },
    },
    {
      type: "video",
      data: {
        heading: "Conoce mi metodo",
        description: "Descubre como trabajo con mis alumnos y por que este sistema funciona.",
        url: "",
      },
    },
    {
      type: "divider",
      data: { style: "line", label: "PLANES" },
    },
    {
      type: "pricing",
      data: {
        heading: "Elige tu plan de coaching",
        description: "Invierte en ti. Todos los planes incluyen seguimiento personalizado con Kiko.",
        plans: [
          {
            name: "Esencial",
            price: "149€",
            period: "/mes",
            features: [
              "Plan de entrenamiento personalizado",
              "Plan de nutricion basico",
              "Check-in semanal",
              "Ajustes mensuales",
              "Acceso a la app de seguimiento",
            ],
            buttonText: "Empezar Esencial",
            buttonHref: "#form",
            highlighted: false,
          },
          {
            name: "Premium",
            price: "249€",
            period: "/mes",
            features: [
              "Todo lo del plan Esencial +",
              "Nutricion avanzada con opciones",
              "Check-in semanal con videollamada",
              "Acceso directo por WhatsApp",
              "Videos personalizados de tecnica",
              "Ajustes ilimitados",
            ],
            buttonText: "Empezar Premium",
            buttonHref: "#form",
            highlighted: true,
          },
          {
            name: "Competicion",
            price: "349€",
            period: "/mes",
            features: [
              "Todo lo del plan Premium +",
              "Preparacion completa de competicion",
              "Peak week y protocolo de carga",
              "Posing coaching semanal",
              "Asesoria de bronceado y bano",
              "Soporte dia de competicion",
              "Analisis post-competicion",
            ],
            buttonText: "Empezar Competicion",
            buttonHref: "#form",
            highlighted: false,
          },
        ],
      },
    },
    {
      type: "divider",
      data: { style: "line", label: "TRANSFORMACIONES" },
    },
    {
      type: "testimonials",
      data: {
        heading: "Transformaciones reales de alumnos reales",
        items: [
          {
            name: "Miguel Angel R.",
            role: "Perdio 18kg en 6 meses",
            text: "Despues de anos intentandolo solo, decidir invertir en coaching con Kiko fue la mejor decision. En 6 meses he perdido 18kg de grasa y ganado masa muscular. Mi vida ha cambiado completamente.",
          },
          {
            name: "Patricia Lopez",
            role: "1er puesto Bikini Fitness Regional",
            text: "Kiko me preparo para mi primera competicion y quede primera. Su atencion al detalle en la prep, el posing y la nutricion es de otro nivel. No podria haberlo hecho sin el.",
          },
          {
            name: "Javier Moreno",
            role: "De 0 a competidor en 2 anos",
            text: "Empece sin tener ni idea de nutricion ni entrenamiento. Hoy compito a nivel nacional gracias a su coaching. La inversion mas rentable que he hecho en mi vida.",
          },
        ],
      },
    },
    {
      type: "text",
      data: {
        heading: "Mi compromiso contigo",
        body: "No soy un coach que te envia una plantilla y desaparece. <strong>Cada plan que diseno es unico</strong>, cada ajuste esta pensado para ti y cada mensaje que me envias tiene respuesta.\n\nLlevo mas de 12 anos dedicado al fitness y la competicion. He preparado a mas de 50 competidores y he ayudado a cientos de personas a transformar su fisico. Mi metodo funciona porque se basa en <strong>ciencia, experiencia y atencion personalizada</strong>.\n\nSi estas listo para dejar de improvisar y empezar a progresar de verdad, estoy aqui para ayudarte.",
        align: "center",
      },
    },
    {
      type: "faq",
      data: {
        heading: "Preguntas frecuentes sobre el coaching",
        items: [
          { question: "Cuanto dura el compromiso minimo?", answer: "El compromiso minimo es de 3 meses. Las transformaciones reales requieren tiempo y consistencia. Si buscas resultados a corto plazo, esto no es para ti." },
          { question: "Necesito ir a un gimnasio?", answer: "Lo ideal es tener acceso a un gimnasio completo, pero puedo adaptarte un plan para entrenar en casa con equipamiento basico si es necesario." },
          { question: "Con que frecuencia me contactas?", answer: "Los check-ins son semanales. En el plan Premium y Competicion tienes acceso directo por WhatsApp para dudas puntuales entre check-ins." },
          { question: "Sirve si soy principiante?", answer: "Absolutamente. El plan se adapta a tu nivel, desde principiante total hasta competidor avanzado. Cada persona tiene un punto de partida diferente." },
          { question: "Como se realiza el pago?", answer: "El pago es mensual por transferencia o Bizum. Recibiras la factura correspondiente cada mes." },
          { question: "Puedo cambiar de plan?", answer: "Si, puedes subir o bajar de plan en cualquier momento al inicio de un nuevo mes." },
        ],
      },
    },
    {
      type: "cta",
      data: {
        heading: "Tu transformacion empieza hoy",
        description: "Las plazas de coaching son limitadas para garantizar la calidad del seguimiento. Actualmente quedan pocas plazas disponibles.",
        buttonText: "Solicitar mi plaza",
        buttonHref: "#form",
        variant: "primary",
      },
    },
    {
      type: "form",
      data: {
        heading: "Solicita tu plaza de coaching",
        description: "Cuentanos un poco sobre ti y tus objetivos. Te respondere personalmente en menos de 24 horas.",
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
