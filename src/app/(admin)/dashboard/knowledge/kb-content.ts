/* ─── Knowledge Base Content ─────────────────────── */
/* All documentation articles organized by category  */

export interface KBArticle {
  id: string;
  title: string;
  content: string; // HTML string
}

export interface KBCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  articles: KBArticle[];
}

export const KB_CATEGORIES: KBCategory[] = [
  /* ================================================================
     GETTING STARTED
     ================================================================ */
  {
    id: "getting-started",
    label: "Primeros pasos",
    icon: "🚀",
    description: "Aprende a usar tu panel de administracion desde cero",
    articles: [
      {
        id: "welcome",
        title: "Bienvenido al panel de administracion",
        content: `
<p>Este es tu <strong>centro de control</strong> para gestionar toda tu presencia online. Desde aqui puedes crear contenido, gestionar reservas, enviar newsletters y mucho mas.</p>

<div class="kb-info">
<strong>Consejo:</strong> Dedica 15 minutos a explorar cada seccion del menu lateral. Te familiarizaras rapidamente con todas las herramientas disponibles.
</div>

<h2>Que puedes hacer desde aqui</h2>

<ul>
<li><strong>Blog</strong> — Crea y publica articulos con ayuda de la inteligencia artificial</li>
<li><strong>Galeria</strong> — Sube y gestiona tus imagenes</li>
<li><strong>Reservas</strong> — Crea enlaces de reserva para que tus clientes agenden citas</li>
<li><strong>Landing Pages</strong> — Construye paginas de aterrizaje para tus eventos</li>
<li><strong>Newsletter</strong> — Envia campanas de email a tus suscriptores</li>
<li><strong>Contactos</strong> — Gestiona tu base de datos de contactos y leads</li>
<li><strong>Analytics</strong> — Mira las estadisticas de visitas de tu web</li>
</ul>

<h2>Estructura del menu</h2>

<p>El menu lateral esta organizado en secciones:</p>

<ul>
<li><strong>Principal:</strong> Dashboard (resumen general) y Analytics (estadisticas)</li>
<li><strong>Contenido:</strong> Posts (blog), Ideas IA (generador de ideas) y Galeria</li>
<li><strong>Newsletter:</strong> Campanas de email y gestion de suscriptores</li>
<li><strong>Reservas:</strong> Enlaces de reserva, listado de reservas y disponibilidad</li>
<li><strong>Eventos:</strong> Landing pages para eventos</li>
<li><strong>Gestion:</strong> Contactos, usuarios y configuracion</li>
</ul>

<h2>Primeros pasos recomendados</h2>

<ol>
<li><strong>Configura tus claves API</strong> — Ve a Configuracion y configura OpenAI (para IA) y Resend (para emails)</li>
<li><strong>Sube imagenes</strong> — Agrega fotos a la galeria para usarlas en tu blog y landing pages</li>
<li><strong>Configura la disponibilidad</strong> — Define tu horario para el sistema de reservas</li>
<li><strong>Crea tu primer post</strong> — Usa la IA para generar tu primer articulo</li>
<li><strong>Crea un enlace de reserva</strong> — Permite que tus clientes agenden citas</li>
</ol>
`,
      },
      {
        id: "dashboard-overview",
        title: "El Dashboard principal",
        content: `
<p>El <strong>Dashboard</strong> es la primera pantalla que ves al entrar. Muestra un resumen de toda tu actividad.</p>

<h2>Que informacion muestra</h2>

<ul>
<li><strong>Estadisticas generales</strong> — Numero total de posts, contactos, suscriptores y reservas</li>
<li><strong>Actividad reciente</strong> — Ultimas acciones realizadas en el panel</li>
<li><strong>Accesos rapidos</strong> — Botones directos a las acciones mas comunes</li>
</ul>

<h2>Como usarlo</h2>

<p>El dashboard es tu punto de partida. Desde aqui puedes:</p>
<ol>
<li>Ver de un vistazo el estado de tu sitio</li>
<li>Acceder rapidamente a crear un nuevo post o enlace de reserva</li>
<li>Identificar tareas pendientes</li>
</ol>

<div class="kb-info">
<strong>Tip:</strong> Visita el dashboard regularmente para estar al dia con tu actividad. Es especialmente util para ver nuevos leads y reservas.
</div>
`,
      },
      {
        id: "navigation",
        title: "Navegacion y atajos",
        content: `
<h2>Menu lateral (Sidebar)</h2>

<p>El menu lateral es tu principal herramienta de navegacion. En <strong>escritorio</strong> esta siempre visible. En <strong>movil</strong> se abre pulsando el icono de menu (hamburguesa) en la barra superior.</p>

<h2>Acceso rapido a secciones</h2>

<p>Cada seccion del menu tiene su propia URL directa. Puedes guardar estas URLs en favoritos para acceder rapidamente:</p>

<ul>
<li><code>/dashboard</code> — Panel principal</li>
<li><code>/dashboard/posts</code> — Blog</li>
<li><code>/dashboard/gallery</code> — Galeria</li>
<li><code>/dashboard/booking-links</code> — Enlaces de reserva</li>
<li><code>/dashboard/event-pages</code> — Landing pages</li>
<li><code>/dashboard/settings</code> — Configuracion</li>
<li><code>/dashboard/knowledge</code> — Esta guia</li>
</ul>

<h2>En el movil</h2>

<ol>
<li>Pulsa el icono de <strong>menu</strong> (tres lineas) en la esquina superior derecha</li>
<li>El menu se desliza desde la izquierda</li>
<li>Pulsa en cualquier seccion para navegar</li>
<li>El menu se cierra automaticamente al cambiar de pagina</li>
</ol>
`,
      },
    ],
  },

  /* ================================================================
     API CONFIGURATION
     ================================================================ */
  {
    id: "api-config",
    label: "Configuracion de APIs",
    icon: "🔑",
    description: "Configura OpenAI, Ollama y Resend para habilitar IA y emails",
    articles: [
      {
        id: "what-is-api-key",
        title: "Que es una clave API (API Key)",
        content: `
<p>Una <strong>clave API</strong> (API Key) es como una <strong>contrasena especial</strong> que permite a tu panel comunicarse con servicios externos como OpenAI (inteligencia artificial) o Resend (envio de emails).</p>

<div class="kb-info">
<strong>Analogia simple:</strong> Piensa en una API Key como la llave de una puerta. Sin la llave, tu panel no puede acceder al servicio. Cada servicio tiene su propia llave.
</div>

<h2>Por que necesitas claves API</h2>

<ul>
<li><strong>OpenAI</strong> — Para que la inteligencia artificial pueda generar articulos, ideas y portadas para tu blog</li>
<li><strong>Resend</strong> — Para que tu panel pueda enviar emails (confirmaciones de reserva, newsletters, notificaciones)</li>
</ul>

<h2>Son seguras?</h2>

<p>Si. Las claves API se guardan <strong>encriptadas</strong> en tu base de datos. Nadie puede verlas una vez guardadas — solo se muestra un formato oculto como <code>••••••abc123</code>.</p>

<div class="kb-warning">
<strong>Importante:</strong> Nunca compartas tus claves API con nadie. Son privadas y dan acceso a los servicios vinculados a tu cuenta.
</div>

<h2>Donde se configuran</h2>

<ol>
<li>Ve a <strong>Configuracion</strong> en el menu lateral</li>
<li>Haz clic en la pestana <strong>"IA"</strong> para la clave de OpenAI</li>
<li>Haz clic en la pestana <strong>"Email"</strong> para la clave de Resend</li>
</ol>
`,
      },
      {
        id: "openai-setup",
        title: "Como obtener y configurar OpenAI",
        content: `
<p>OpenAI es el servicio que potencia la <strong>inteligencia artificial</strong> de tu panel. Con el puedes generar articulos, ideas y portadas para tu blog automaticamente.</p>

<h2>Paso 1: Crear una cuenta en OpenAI</h2>

<ol>
<li>Ve a <a href="https://platform.openai.com" target="_blank" rel="noopener"><strong>platform.openai.com</strong></a></li>
<li>Haz clic en <strong>"Sign up"</strong> (Registrarse)</li>
<li>Puedes registrarte con tu email, cuenta de Google o Microsoft</li>
<li>Confirma tu email si es necesario</li>
</ol>

<h2>Paso 2: Agregar metodo de pago</h2>

<div class="kb-warning">
<strong>Importante:</strong> OpenAI requiere un metodo de pago para usar la API. El coste es muy bajo — generar un articulo completo cuesta aproximadamente $0.01 - $0.05 USD.
</div>

<ol>
<li>Una vez dentro, ve a <strong>Settings > Billing</strong> (Configuracion > Facturacion)</li>
<li>Haz clic en <strong>"Add payment method"</strong></li>
<li>Introduce tu tarjeta de credito o debito</li>
<li>Recomendacion: configura un limite mensual de $5-10 USD para empezar</li>
</ol>

<h2>Paso 3: Crear tu clave API</h2>

<ol>
<li>Ve a <strong>API Keys</strong> en el menu lateral de OpenAI (o visita <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com/api-keys</a>)</li>
<li>Haz clic en <strong>"Create new secret key"</strong></li>
<li>Dale un nombre descriptivo, por ejemplo: <code>KikoVargas Panel</code></li>
<li>Se mostrara la clave. <strong>Copiala inmediatamente</strong> — solo se muestra una vez</li>
</ol>

<div class="kb-info">
<strong>La clave tiene este formato:</strong> <code>sk-proj-abc123...</code> (empieza siempre por <code>sk-</code>)
</div>

<h2>Paso 4: Pegar la clave en tu panel</h2>

<ol>
<li>Ve a <strong>Configuracion</strong> en tu panel de administracion</li>
<li>Haz clic en la pestana <strong>"IA"</strong></li>
<li>En el campo <strong>"API Key de OpenAI"</strong>, pega tu clave</li>
<li>Selecciona el modelo:
  <ul>
    <li><strong>gpt-4o-mini</strong> — Rapido y economico. Ideal para empezar</li>
    <li><strong>gpt-4o</strong> — Mayor calidad de contenido. Algo mas caro</li>
    <li><strong>gpt-4.1-mini</strong> — Ultimo modelo compacto</li>
    <li><strong>gpt-4.1</strong> — Ultimo modelo premium con la mejor calidad</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Que modelo elegir</h2>

<p>Para la mayoria de usuarios, <strong>gpt-4o-mini</strong> es la mejor opcion:</p>
<ul>
<li>Es el mas rapido</li>
<li>Es el mas economico (10x mas barato que gpt-4o)</li>
<li>La calidad del contenido generado es muy buena</li>
</ul>

<p>Si necesitas contenido de mayor calidad o mas matizado, usa <strong>gpt-4o</strong> o <strong>gpt-4.1</strong>.</p>

<h2>Costes aproximados</h2>

<ul>
<li><strong>Generar un articulo:</strong> ~$0.01 - $0.05</li>
<li><strong>Generar ideas:</strong> ~$0.005</li>
<li><strong>Generar imagen de portada:</strong> ~$0.04</li>
<li><strong>Total mensual estimado</strong> (10 articulos): ~$0.50 - $1.00</li>
</ul>
`,
      },
      {
        id: "ollama-setup",
        title: "Como configurar IA local (Ollama)",
        content: `
<p><strong>Ollama</strong> te permite usar inteligencia artificial <strong>en tu propio ordenador</strong>, sin enviar datos a servidores externos y sin coste por uso.</p>

<div class="kb-info">
<strong>Para quien es esto:</strong> Ollama es ideal si tienes un ordenador potente (minimo 8GB de RAM, idealmente 16GB) y prefieres no depender de servicios de pago. La calidad es buena pero generalmente inferior a GPT-4.
</div>

<h2>Paso 1: Instalar Ollama</h2>

<ol>
<li>Ve a <a href="https://ollama.ai" target="_blank" rel="noopener"><strong>ollama.ai</strong></a></li>
<li>Descarga la version para tu sistema operativo (Windows, Mac o Linux)</li>
<li>Instala el programa normalmente</li>
<li>Una vez instalado, Ollama se ejecuta en segundo plano automaticamente</li>
</ol>

<h2>Paso 2: Descargar un modelo</h2>

<p>Abre la terminal (Command Prompt en Windows, Terminal en Mac) y ejecuta:</p>

<div class="kb-code">ollama pull llama3</div>

<p>Este comando descarga el modelo <strong>Llama 3</strong> de Meta. Es el modelo recomendado — gratuito y con buena calidad.</p>

<p><strong>Otros modelos disponibles:</strong></p>
<ul>
<li><code>llama3</code> — Equilibrado y rapido (recomendado)</li>
<li><code>llama3:70b</code> — Mayor calidad pero requiere mucha RAM (40GB+)</li>
<li><code>mistral</code> — Buena alternativa, rapido y eficiente</li>
<li><code>mixtral</code> — Potente pero mas pesado</li>
</ul>

<h2>Paso 3: Verificar que funciona</h2>

<p>En la terminal, ejecuta:</p>

<div class="kb-code">ollama run llama3 "Hola, como estas?"</div>

<p>Si recibes una respuesta, Ollama esta funcionando correctamente.</p>

<h2>Paso 4: Configurar en tu panel</h2>

<ol>
<li>Ve a <strong>Configuracion > IA</strong></li>
<li>En <strong>"Proveedor"</strong>, selecciona <strong>"Local"</strong></li>
<li>En <strong>"Endpoint"</strong>, deja el valor por defecto: <code>http://localhost:11434</code></li>
<li>En <strong>"Modelo"</strong>, escribe el nombre del modelo que descargaste (por ejemplo: <code>llama3</code>)</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<div class="kb-warning">
<strong>Limitacion:</strong> Ollama <strong>no puede generar imagenes de portada</strong>. Esa funcion solo esta disponible con OpenAI (usando DALL-E). Si usas Ollama, tendras que subir las portadas manualmente.
</div>

<h2>Requisitos del servidor</h2>

<p>Si tu web esta en un VPS (servidor), necesitas que Ollama este instalado <strong>en el mismo servidor</strong> o que el endpoint sea accesible desde el servidor.</p>
`,
      },
      {
        id: "resend-setup",
        title: "Como obtener y configurar Resend (emails)",
        content: `
<p><strong>Resend</strong> es el servicio que permite a tu panel enviar emails: confirmaciones de reserva, newsletters, notificaciones de contacto, etc.</p>

<h2>Paso 1: Crear una cuenta en Resend</h2>

<ol>
<li>Ve a <a href="https://resend.com" target="_blank" rel="noopener"><strong>resend.com</strong></a></li>
<li>Haz clic en <strong>"Get Started"</strong> o <strong>"Sign Up"</strong></li>
<li>Registrate con tu email o cuenta de GitHub</li>
<li>Confirma tu email</li>
</ol>

<h2>Paso 2: Crear tu clave API</h2>

<ol>
<li>Una vez dentro del dashboard de Resend, ve a <strong>"API Keys"</strong> en el menu lateral</li>
<li>Haz clic en <strong>"Create API Key"</strong></li>
<li>Nombre: <code>KikoVargas Panel</code></li>
<li>Permiso: Selecciona <strong>"Full access"</strong></li>
<li>Dominio: Puedes dejarlo en "All domains" por ahora</li>
<li>Haz clic en <strong>"Create"</strong></li>
<li><strong>Copia la clave</strong> inmediatamente — solo se muestra una vez</li>
</ol>

<div class="kb-info">
<strong>La clave tiene este formato:</strong> <code>re_abc123...</code> (empieza por <code>re_</code>)
</div>

<h2>Paso 3: Verificar tu dominio (opcional pero recomendado)</h2>

<p>Sin dominio verificado, los emails se envian desde <code>onboarding@resend.dev</code>. Para enviar desde tu propio dominio:</p>

<ol>
<li>En Resend, ve a <strong>"Domains"</strong></li>
<li>Haz clic en <strong>"Add Domain"</strong></li>
<li>Escribe tu dominio (ej: <code>kikovargas.com</code>)</li>
<li>Resend te mostrara registros DNS que necesitas agregar a tu proveedor de dominio</li>
<li>Agrega los registros DNS (generalmente MX, TXT y CNAME)</li>
<li>Espera a que se verifiquen (puede tardar 5-60 minutos)</li>
</ol>

<h2>Paso 4: Configurar en tu panel</h2>

<ol>
<li>Ve a <strong>Configuracion > Email</strong></li>
<li>Pega tu clave API en el campo <strong>"API Key de Resend"</strong></li>
<li>Configura:
  <ul>
    <li><strong>Nombre del remitente:</strong> El nombre que aparece en los emails (ej: "Kiko Vargas")</li>
    <li><strong>Email del remitente:</strong> El email desde el que envias (debe ser de un dominio verificado en Resend, o usa <code>onboarding@resend.dev</code> para pruebas)</li>
    <li><strong>Email de contacto:</strong> Donde recibiras las notificaciones (formularios de contacto, nuevas reservas, etc.)</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Plan gratuito de Resend</h2>

<p>Resend ofrece un plan gratuito generoso:</p>
<ul>
<li><strong>100 emails/dia</strong></li>
<li><strong>3,000 emails/mes</strong></li>
<li>Ideal para empezar sin coste</li>
</ul>

<div class="kb-info">
<strong>Para la mayoria de usuarios</strong>, el plan gratuito de Resend es mas que suficiente. Solo necesitarias un plan de pago si envias newsletters a miles de suscriptores.
</div>
`,
      },
      {
        id: "system-prompt",
        title: "Como configurar el prompt del sistema (IA)",
        content: `
<p>El <strong>prompt del sistema</strong> es una instruccion que le das a la inteligencia artificial para que entienda el <strong>contexto</strong> de tu negocio. Todas las generaciones de contenido (ideas, articulos) usaran esta informacion.</p>

<h2>Donde se configura</h2>

<ol>
<li>Ve a <strong>Configuracion > IA</strong></li>
<li>Busca el campo <strong>"System Prompt"</strong></li>
<li>Escribe las instrucciones para la IA</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Ejemplo de un buen prompt</h2>

<div class="kb-code">Eres el asistente de contenido de Kiko Vargas, un profesional IFBB Pro especializado en fitness, nutricion deportiva y preparacion de competidores de culturismo. El tono debe ser profesional pero cercano, usando lenguaje claro y motivador. El publico objetivo son personas interesadas en mejorar su fisico, tanto principiantes como competidores. Todo el contenido debe estar en espanol.</div>

<h2>Consejos para un buen prompt</h2>

<ul>
<li><strong>Se especifico</strong> — Indica tu nicho, publico y tono</li>
<li><strong>Incluye tu marca</strong> — Nombre, especializacion, credenciales</li>
<li><strong>Define el idioma</strong> — Especifica "en espanol" si quieres contenido en tu idioma</li>
<li><strong>Describe tu audiencia</strong> — Esto ayuda a la IA a adaptar el nivel del contenido</li>
</ul>

<div class="kb-warning">
<strong>Evita:</strong> Prompts demasiado genericos como "Genera contenido de fitness". Cuanto mas contexto des, mejor sera el resultado.
</div>
`,
      },
    ],
  },

  /* ================================================================
     BLOG
     ================================================================ */
  {
    id: "blog",
    label: "Blog",
    icon: "📝",
    description: "Crea, edita y publica articulos con ayuda de IA",
    articles: [
      {
        id: "create-post",
        title: "Como crear un post nuevo",
        content: `
<h2>Metodo 1: Creacion manual</h2>

<ol>
<li>Ve a <strong>Posts</strong> en el menu lateral</li>
<li>Haz clic en <strong>"Nuevo post"</strong></li>
<li>Rellena los campos:
  <ul>
    <li><strong>Titulo:</strong> El titulo de tu articulo</li>
    <li><strong>Slug:</strong> Se genera automaticamente desde el titulo (es la URL del post). Puedes editarlo manualmente si quieres</li>
    <li><strong>Extracto:</strong> Un resumen corto (opcional pero recomendado para SEO)</li>
    <li><strong>Contenido:</strong> Escribe tu articulo usando el editor visual</li>
    <li><strong>Estado:</strong> Elige "Borrador" para guardar sin publicar, o "Publicado" para hacerlo visible</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Metodo 2: Creacion con IA (recomendado)</h2>

<ol>
<li>Ve a <strong>Ideas IA</strong> en el menu lateral</li>
<li>Escribe un tema o nicho (ej: "fitness y nutricion")</li>
<li>Elige cuantas ideas quieres generar (3, 5, 7 o 10)</li>
<li>Haz clic en <strong>"Generar ideas"</strong></li>
<li>Revisa las ideas generadas</li>
<li>Haz clic en <strong>"Crear post"</strong> en la idea que te guste</li>
<li>Se abrira el editor con un panel de IA. Haz clic en <strong>"Generar articulo"</strong></li>
<li>La IA escribira el articulo completo y generara una imagen de portada</li>
<li>Revisa y edita el contenido si es necesario</li>
<li>Cambia el estado a "Publicado" cuando estes listo</li>
</ol>

<div class="kb-info">
<strong>Tip:</strong> Puedes agregar "contexto adicional" antes de generar. Por ejemplo: "Enfocado en principiantes, con ejemplos practicos de dieta". Esto mejora significativamente la calidad del resultado.
</div>

<h2>El editor de contenido</h2>

<p>El editor soporta formato rico:</p>
<ul>
<li><strong>Negrita</strong> y <em>cursiva</em></li>
<li>Encabezados (H2, H3)</li>
<li>Listas con viñetas y numeradas</li>
<li>Citas (blockquote)</li>
<li>Enlaces</li>
</ul>
`,
      },
      {
        id: "edit-publish",
        title: "Editar y publicar posts",
        content: `
<h2>Editar un post existente</h2>

<ol>
<li>Ve a <strong>Posts</strong></li>
<li>Haz clic en <strong>"Editar"</strong> junto al post que quieres modificar</li>
<li>Realiza los cambios que necesites</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Estados de un post</h2>

<ul>
<li><strong>Borrador:</strong> El post esta guardado pero NO es visible en el blog publico. Usalo para trabajar en borradores</li>
<li><strong>Publicado:</strong> El post es visible para todo el mundo en tu blog. Aparecera en la pagina principal del blog</li>
<li><strong>Archivado:</strong> El post se oculta del blog pero no se elimina. Util para contenido antiguo que quieres conservar</li>
</ul>

<h2>Flujo de trabajo recomendado</h2>

<ol>
<li>Crea el post como <strong>Borrador</strong></li>
<li>Escribe o genera el contenido</li>
<li>Revisa que todo este correcto</li>
<li>Cambia el estado a <strong>Publicado</strong></li>
<li>Comparte la URL de tu blog en redes sociales</li>
</ol>

<h2>Imagen de portada</h2>

<p>Cada post puede tener una imagen de portada que se muestra en la lista del blog y al principio del articulo.</p>

<ul>
<li><strong>Con IA:</strong> Se genera automaticamente al crear un articulo con IA (usa DALL-E)</li>
<li><strong>Manual:</strong> Sube la imagen desde el editor del post</li>
</ul>

<div class="kb-warning">
<strong>Nota:</strong> La generacion de imagenes con IA solo funciona con OpenAI (no con Ollama local).
</div>
`,
      },
      {
        id: "blog-seo",
        title: "Mejores practicas para el blog",
        content: `
<h2>SEO (Posicionamiento web)</h2>

<ul>
<li><strong>Titulos:</strong> Usa titulos descriptivos de 50-70 caracteres. Incluye tu palabra clave principal</li>
<li><strong>Slug:</strong> Mantenlo corto y descriptivo (ej: <code>guia-nutricion-principiantes</code>)</li>
<li><strong>Extracto:</strong> Escribe un resumen de 150-160 caracteres que resuma el articulo</li>
<li><strong>Contenido:</strong> Minimo 500 palabras. Los articulos largos (1500+) posicionan mejor</li>
<li><strong>Imagenes:</strong> Usa siempre una imagen de portada atractiva</li>
</ul>

<h2>Frecuencia de publicacion</h2>

<p>La consistencia es mas importante que la cantidad:</p>
<ul>
<li><strong>Minimo recomendado:</strong> 1 post por semana</li>
<li><strong>Ideal:</strong> 2-3 posts por semana</li>
<li><strong>Con IA:</strong> Puedes generar borradores rapidamente y luego editarlos con tu toque personal</li>
</ul>

<h2>Contenido que funciona</h2>

<ul>
<li><strong>Guias practicas:</strong> "Como hacer X paso a paso"</li>
<li><strong>Listas:</strong> "10 mejores ejercicios para..."</li>
<li><strong>Preguntas frecuentes:</strong> "Todo lo que necesitas saber sobre..."</li>
<li><strong>Experiencia personal:</strong> Tu historia, transformaciones de clientes</li>
</ul>
`,
      },
    ],
  },

  /* ================================================================
     GALLERY
     ================================================================ */
  {
    id: "gallery",
    label: "Galeria",
    icon: "🖼️",
    description: "Sube y gestiona imagenes para tu web",
    articles: [
      {
        id: "upload-images",
        title: "Subir imagenes",
        content: `
<h2>Como subir imagenes</h2>

<ol>
<li>Ve a <strong>Galeria</strong> en el menu lateral</li>
<li>Haz clic en la <strong>zona de subida</strong> o <strong>arrastra las imagenes</strong> directamente</li>
<li>Selecciona una o varias imagenes (maximo 10 a la vez)</li>
<li>Las imagenes se suben automaticamente y aparecen en la cuadricula</li>
</ol>

<h2>Formatos y limites</h2>

<ul>
<li><strong>Formatos soportados:</strong> JPG, PNG, WebP</li>
<li><strong>Tamano maximo:</strong> 5 MB por imagen</li>
<li><strong>Maximo por subida:</strong> 10 imagenes a la vez</li>
</ul>

<div class="kb-info">
<strong>Recomendacion:</strong> Usa formato <strong>WebP</strong> siempre que sea posible. Pesa menos que JPG manteniendo la misma calidad, lo que hace que tu web cargue mas rapido.
</div>

<h2>Texto alternativo (alt)</h2>

<p>Cada imagen tiene un campo de <strong>texto alternativo</strong> que se genera automaticamente desde el nombre del archivo. Es importante para:</p>
<ul>
<li><strong>SEO:</strong> Google usa el texto alternativo para entender las imagenes</li>
<li><strong>Accesibilidad:</strong> Los lectores de pantalla leen este texto</li>
</ul>

<p>Para editarlo, pasa el cursor sobre la imagen y haz clic en el boton de edicion.</p>
`,
      },
      {
        id: "manage-gallery",
        title: "Gestionar la galeria",
        content: `
<h2>Imagenes destacadas (Landing)</h2>

<p>Las imagenes marcadas como "Landing" se muestran en la galeria publica de tu pagina principal.</p>

<ol>
<li>En la galeria del admin, haz clic en el icono de <strong>estrella</strong> en la imagen</li>
<li>La imagen se marca como destacada y aparece la etiqueta "Landing"</li>
<li>Haz clic de nuevo para desmarcarla</li>
</ol>

<h2>Filtros</h2>

<ul>
<li><strong>Todas:</strong> Muestra todas las imagenes subidas</li>
<li><strong>En landing:</strong> Solo las imagenes destacadas para la pagina principal</li>
<li><strong>Ocultas:</strong> Imagenes no destacadas (uso interno o para blog)</li>
</ul>

<h2>Eliminar imagenes</h2>

<ol>
<li>Pasa el cursor sobre la imagen</li>
<li>Haz clic en el icono de <strong>papelera</strong></li>
<li>Confirma la eliminacion</li>
</ol>

<div class="kb-warning">
<strong>Atencion:</strong> Si eliminas una imagen que esta usada como portada de un post, el post perdera su portada. Verifica antes de eliminar.
</div>
`,
      },
    ],
  },

  /* ================================================================
     BOOKING SYSTEM
     ================================================================ */
  {
    id: "booking",
    label: "Sistema de reservas",
    icon: "📅",
    description: "Crea enlaces de reserva y gestiona disponibilidad",
    articles: [
      {
        id: "booking-overview",
        title: "Como funciona el sistema de reservas",
        content: `
<p>El sistema de reservas permite que tus clientes <strong>agenden citas contigo</strong> a traves de un enlace unico. Es completamente automatico:</p>

<ol>
<li>Tu creas un <strong>enlace de reserva</strong> (ej: <code>tusitio.com/book/consulta</code>)</li>
<li>Compartes ese enlace con tus clientes</li>
<li>El cliente elige fecha y hora disponible</li>
<li>Recibe una confirmacion por email</li>
<li>Tu recibes una notificacion</li>
</ol>

<h2>Componentes del sistema</h2>

<ul>
<li><strong>Enlaces de reserva:</strong> Cada tipo de servicio tiene su propio enlace (ej: consulta, asesoria, sesion de fotos)</li>
<li><strong>Disponibilidad:</strong> Define en que dias y horas aceptas reservas</li>
<li><strong>Reservas:</strong> Lista de todas las reservas recibidas con su estado</li>
</ul>
`,
      },
      {
        id: "create-booking-link",
        title: "Crear un enlace de reserva",
        content: `
<ol>
<li>Ve a <strong>Reservas > Enlaces</strong> en el menu lateral</li>
<li>Haz clic en <strong>"+ Nuevo enlace"</strong></li>
<li>Rellena los campos:
  <ul>
    <li><strong>Slug:</strong> La parte de la URL que identifica el enlace (ej: <code>consulta</code> para <code>/book/consulta</code>). Solo letras minusculas, numeros y guiones</li>
    <li><strong>Titulo:</strong> El nombre del servicio que vera el cliente (ej: "Consulta de nutricion")</li>
    <li><strong>Descripcion:</strong> Explicacion detallada del servicio (opcional)</li>
    <li><strong>Duracion:</strong> Duracion de la cita en minutos (ej: 60)</li>
    <li><strong>Expiracion:</strong> Fecha limite para reservar (opcional). Despues de esta fecha el enlace se desactiva automaticamente</li>
  </ul>
</li>
<li>Haz clic en <strong>"Crear"</strong></li>
</ol>

<h2>Gestionar enlaces</h2>

<ul>
<li><strong>Copiar enlace:</strong> Copia la URL completa al portapapeles para compartirla</li>
<li><strong>Activar/Desactivar:</strong> Puedes pausar un enlace temporalmente sin eliminarlo</li>
<li><strong>Eliminar:</strong> Borra el enlace y todas sus reservas asociadas</li>
</ul>

<div class="kb-info">
<strong>Ejemplo de uso:</strong> Crea un enlace <code>/book/coaching-inicial</code> con duracion de 30 minutos para la primera consulta gratuita. Comparte ese enlace en tu bio de Instagram.
</div>
`,
      },
      {
        id: "availability-setup",
        title: "Configurar disponibilidad",
        content: `
<p>La disponibilidad define <strong>cuando aceptas reservas</strong>. Sin configurar la disponibilidad, tus clientes no podran reservar.</p>

<h2>Configurar horarios</h2>

<ol>
<li>Ve a <strong>Reservas > Disponibilidad</strong></li>
<li>Veras 7 filas, una por cada dia de la semana</li>
<li>Para cada dia:
  <ul>
    <li><strong>Activa/desactiva</strong> el dia con el interruptor</li>
    <li>Si esta activo, configura la <strong>hora de inicio</strong> y <strong>hora de fin</strong></li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Presets rapidos</h2>

<p>Usa los botones de preset para configurar rapidamente:</p>
<ul>
<li><strong>"Lunes a Viernes (15:00-21:00)"</strong> — Horario de tarde entre semana</li>
<li><strong>"Fines de semana (10:00-14:00)"</strong> — Solo sabados y domingos por la manana</li>
<li><strong>"Todos los dias (09:00-18:00)"</strong> — Horario completo</li>
</ul>

<div class="kb-warning">
<strong>Importante:</strong> Los horarios se aplican a TODOS los enlaces de reserva. Si necesitas horarios diferentes por servicio, configura el horario mas amplio aqui y usa la fecha de expiracion en los enlaces individuales.
</div>

<h2>Como funciona para el cliente</h2>

<ol>
<li>El cliente abre tu enlace de reserva</li>
<li>Ve un calendario donde solo los dias con disponibilidad son clicables</li>
<li>Al seleccionar un dia, ve solo las horas disponibles (se excluyen las ya reservadas)</li>
<li>Elige hora, rellena sus datos y confirma</li>
</ol>
`,
      },
      {
        id: "manage-bookings",
        title: "Gestionar reservas",
        content: `
<h2>Ver reservas</h2>

<ol>
<li>Ve a <strong>Reservas > Reservas</strong></li>
<li>Veras una lista de todas las reservas con:
  <ul>
    <li>Nombre y email del cliente</li>
    <li>Servicio reservado</li>
    <li>Fecha y hora</li>
    <li>Estado (Confirmada, Cancelada, Completada)</li>
  </ul>
</li>
</ol>

<h2>Estados de una reserva</h2>

<ul>
<li><strong>CONFIRMED:</strong> La reserva esta confirmada y pendiente de realizarse</li>
<li><strong>CANCELLED:</strong> La reserva fue cancelada (por ti o el cliente)</li>
<li><strong>COMPLETED:</strong> La cita ya se realizo</li>
</ul>

<h2>Acciones disponibles</h2>

<ul>
<li><strong>Cancelar:</strong> Marca la reserva como cancelada</li>
<li><strong>Reactivar:</strong> Si cancelaste por error, puedes reactivar la reserva</li>
<li><strong>Eliminar:</strong> Borra la reserva permanentemente</li>
</ul>

<h2>Filtrar por estado</h2>

<p>Usa los botones de filtro en la parte superior para ver solo las reservas de un estado determinado. Esto es util cuando tienes muchas reservas.</p>
`,
      },
    ],
  },

  /* ================================================================
     LANDING BUILDER
     ================================================================ */
  {
    id: "landing-builder",
    label: "Landing Builder",
    icon: "🏗️",
    description: "Construye paginas de aterrizaje con bloques",
    articles: [
      {
        id: "landing-overview",
        title: "Que es el Landing Builder",
        content: `
<p>El <strong>Landing Builder</strong> te permite crear <strong>paginas independientes</strong> para promocionar eventos, webinars, servicios o cualquier oferta especial. Cada pagina se construye con bloques que puedes anadir, editar y reordenar.</p>

<h2>Para que sirve</h2>

<ul>
<li><strong>Webinars:</strong> Pagina de registro para tu proximo webinar</li>
<li><strong>Eventos:</strong> Pagina de venta para un evento presencial</li>
<li><strong>Coaching:</strong> Pagina de captacion para tu servicio de coaching</li>
<li><strong>Lanzamientos:</strong> Pagina de preventa o lista de espera</li>
</ul>

<h2>Como funcionan las URLs</h2>

<p>Cada landing page tiene su propia URL: <code>tusitio.com/event/nombre-del-evento</code></p>

<p>Solo las paginas con estado <strong>"Publicada"</strong> son visibles publicamente.</p>

<h2>Bloques disponibles</h2>

<p>Hay 14 tipos de bloques para construir tu pagina:</p>

<ul>
<li><strong>Hero:</strong> Cabecera principal con titulo, subtitulo y boton de accion</li>
<li><strong>Texto:</strong> Seccion de texto con formato HTML</li>
<li><strong>Imagen:</strong> Imagen con pie de foto</li>
<li><strong>Video:</strong> Video de YouTube o Vimeo embebido</li>
<li><strong>Galeria:</strong> Cuadricula de imagenes</li>
<li><strong>Call to Action:</strong> Seccion con boton destacado</li>
<li><strong>Formulario:</strong> Formulario de captura de leads (nombre, email, telefono, mensaje)</li>
<li><strong>Cuenta Regresiva:</strong> Temporizador hasta una fecha objetivo</li>
<li><strong>Preguntas Frecuentes:</strong> Acordeon de preguntas y respuestas</li>
<li><strong>Testimonios:</strong> Tarjetas con opiniones de clientes</li>
<li><strong>Precios:</strong> Planes de precios con caracteristicas</li>
<li><strong>Estadisticas:</strong> Numeros destacados (ej: "500+ alumnos")</li>
<li><strong>Caracteristicas:</strong> Cuadricula de funcionalidades con iconos</li>
<li><strong>Separador:</strong> Linea, puntos o espacio entre secciones</li>
</ul>
`,
      },
      {
        id: "create-landing",
        title: "Crear una landing page",
        content: `
<h2>Paso a paso</h2>

<ol>
<li>Ve a <strong>Eventos > Landing Pages</strong></li>
<li>Haz clic en <strong>"+ Nueva landing page"</strong></li>
<li>Rellena:
  <ul>
    <li><strong>Titulo:</strong> Nombre de tu evento o pagina</li>
    <li><strong>Slug:</strong> La URL (ej: <code>mi-webinar</code> para <code>/event/mi-webinar</code>)</li>
  </ul>
</li>
<li>Elige una <strong>plantilla</strong>:
  <ul>
    <li><strong>En blanco:</strong> Empieza sin bloques</li>
    <li><strong>Webinar:</strong> 11 bloques predefinidos para webinars (hero, stats, features, countdown, testimonios, FAQ, formulario)</li>
    <li><strong>Evento Fitness:</strong> 12 bloques para eventos presenciales (incluye precios con General y VIP)</li>
    <li><strong>Coaching:</strong> 12 bloques para coaching online (incluye 3 planes de precios)</li>
  </ul>
</li>
<li>Haz clic en <strong>"Crear pagina"</strong></li>
<li>Se abrira el editor de bloques</li>
</ol>

<div class="kb-info">
<strong>Recomendacion:</strong> Empieza siempre con una plantilla. Es mucho mas rapido editar el contenido existente que empezar de cero. Puedes modificar, eliminar o reordenar cualquier bloque despues.
</div>
`,
      },
      {
        id: "edit-blocks",
        title: "Editar bloques en el editor",
        content: `
<h2>El editor de bloques</h2>

<p>Al abrir una landing page veras una lista de bloques. Cada bloque muestra una <strong>vista previa visual</strong> de su contenido.</p>

<h2>Acciones basicas</h2>

<ul>
<li><strong>Expandir/Colapsar:</strong> Haz clic en un bloque para expandirlo y ver sus campos de edicion</li>
<li><strong>Editar campos:</strong> Modifica el texto, URLs, opciones, etc. Los cambios se <strong>guardan automaticamente</strong> mientras escribes</li>
<li><strong>Reordenar:</strong> Usa las flechas arriba/abajo o <strong>arrastra</strong> los bloques con el icono de agarre (6 puntos)</li>
<li><strong>Duplicar:</strong> Haz clic en el icono de copiar para duplicar un bloque</li>
<li><strong>Eliminar:</strong> Haz clic en el icono de papelera</li>
</ul>

<h2>Auto-guardado</h2>

<p>El editor guarda automaticamente cada cambio que haces. Veras indicadores en tiempo real:</p>
<ul>
<li><strong>Punto dorado + "Guardando"</strong> — Se esta guardando tu cambio</li>
<li><strong>Check verde + "Guardado"</strong> — Cambio guardado correctamente</li>
</ul>

<div class="kb-info">
<strong>No hay boton de guardar.</strong> Todo se guarda automaticamente. Solo tienes que escribir y listo.
</div>

<h2>Agregar bloques nuevos</h2>

<ol>
<li>Haz clic en <strong>"+ Agregar bloque"</strong> al final de la lista</li>
<li>Elige el tipo de bloque del menu categorizado:
  <ul>
    <li><strong>Contenido:</strong> Hero, Texto, Imagen, Video, Galeria</li>
    <li><strong>Conversion:</strong> CTA, Formulario, Precios, Countdown</li>
    <li><strong>Social proof:</strong> Testimonios, Stats, FAQ, Features</li>
    <li><strong>Layout:</strong> Separador</li>
  </ul>
</li>
<li>El bloque se agrega al final y se expande para que lo edites</li>
</ol>

<h2>Vista previa</h2>

<p>Haz clic en <strong>"Vista previa"</strong> para ver como se ve tu pagina en una nueva pestana. Recuerda que solo las paginas con estado "Publicada" son visibles para el publico.</p>
`,
      },
      {
        id: "landing-leads",
        title: "Formularios y captura de leads",
        content: `
<p>Cada landing page puede tener un <strong>bloque de formulario</strong> para capturar datos de los visitantes (leads).</p>

<h2>Que campos puedes configurar</h2>

<ul>
<li><strong>Nombre</strong> — Siempre recomendado</li>
<li><strong>Email</strong> — Imprescindible para contactar</li>
<li><strong>Telefono</strong> — Opcional, util para servicios presenciales</li>
<li><strong>Mensaje</strong> — Opcional, permite al visitante escribir un texto libre</li>
</ul>

<h2>Donde van los leads</h2>

<p>Cuando alguien rellena un formulario:</p>
<ol>
<li>Se guarda como <strong>Lead</strong> asociado a esa landing page</li>
<li>Se guarda como <strong>Contacto</strong> en tu base de datos general</li>
<li>Recibes una <strong>notificacion por email</strong> con los datos del lead</li>
</ol>

<h2>Ver los leads</h2>

<ul>
<li><strong>En la landing page:</strong> En la lista de landing pages veras el numero de leads</li>
<li><strong>En Contactos:</strong> Todos los leads tambien aparecen en la seccion de Contactos</li>
</ul>

<div class="kb-info">
<strong>Importante:</strong> Asegurate de que el enlace del boton del hero y los CTAs apuntan a <code>#form</code> para que al hacer clic, la pagina haga scroll hasta el formulario.
</div>
`,
      },
    ],
  },

  /* ================================================================
     AI CONTENT
     ================================================================ */
  {
    id: "ai-content",
    label: "Generacion de contenido IA",
    icon: "🤖",
    description: "Usa inteligencia artificial para crear contenido",
    articles: [
      {
        id: "ai-ideas",
        title: "Generar ideas para el blog",
        content: `
<h2>Como funciona</h2>

<ol>
<li>Ve a <strong>Ideas IA</strong> en el menu lateral</li>
<li>En el campo "Nicho o tema", escribe sobre que quieres escribir:
  <ul>
    <li>Ejemplo: "nutricion para ganar masa muscular"</li>
    <li>Ejemplo: "preparacion para competicion de culturismo"</li>
    <li>Ejemplo: "rutinas de entrenamiento en casa"</li>
  </ul>
</li>
<li>Selecciona cuantas ideas quieres (3, 5, 7 o 10)</li>
<li>Haz clic en <strong>"Generar ideas"</strong></li>
</ol>

<h2>Que recibes</h2>

<p>Cada idea incluye:</p>
<ul>
<li><strong>Titulo:</strong> Un titulo atractivo para el articulo</li>
<li><strong>Descripcion:</strong> Breve resumen del contenido propuesto</li>
<li><strong>Tags:</strong> Etiquetas relevantes</li>
</ul>

<h2>Que hacer con las ideas</h2>

<ul>
<li><strong>"Crear post":</strong> Abre el editor de posts con el titulo pre-rellenado y la opcion de generar el articulo con IA</li>
<li><strong>"Guardar":</strong> Guarda la idea en tu lista local para usarla mas tarde</li>
</ul>

<div class="kb-info">
<strong>Tip:</strong> Se mas especifico para obtener mejores ideas. En vez de "fitness", escribe "entrenamiento de piernas para culturistas intermedios".
</div>
`,
      },
      {
        id: "ai-articles",
        title: "Generar articulos completos",
        content: `
<h2>Como generar un articulo</h2>

<ol>
<li>Crea un <strong>nuevo post</strong> (o haz clic en "Crear post" desde una idea)</li>
<li>Si ves el panel de generacion IA, escribe el tema del articulo</li>
<li>Opcionalmente, agrega <strong>contexto adicional:</strong>
  <ul>
    <li>"Enfocado en principiantes"</li>
    <li>"Incluir datos cientificos"</li>
    <li>"Tono informal y cercano"</li>
    <li>"Con ejemplos practicos de dieta semanal"</li>
  </ul>
</li>
<li>Haz clic en <strong>"Generar articulo"</strong></li>
<li>Espera unos segundos mientras la IA trabaja</li>
<li>El titulo, contenido y portada se rellenan automaticamente</li>
</ol>

<h2>Que genera la IA</h2>

<ul>
<li><strong>Titulo optimizado</strong> para SEO</li>
<li><strong>Slug</strong> generado automaticamente desde el titulo</li>
<li><strong>Contenido completo</strong> con formato HTML (encabezados, listas, negritas, etc.)</li>
<li><strong>Imagen de portada</strong> generada con DALL-E (solo con OpenAI)</li>
</ul>

<h2>Despues de generar</h2>

<div class="kb-warning">
<strong>Siempre revisa y edita</strong> el contenido generado. La IA es una herramienta de ayuda, no un reemplazo. Anade tu toque personal, corrige datos y asegurate de que el contenido refleja tu experiencia real.
</div>

<ol>
<li>Lee el articulo completo</li>
<li>Corrige cualquier dato incorrecto</li>
<li>Anade tu experiencia personal y ejemplos reales</li>
<li>Ajusta el tono si es necesario</li>
<li>Cambia el estado a "Publicado" cuando estes satisfecho</li>
</ol>
`,
      },
    ],
  },

  /* ================================================================
     EMAIL SYSTEM
     ================================================================ */
  {
    id: "email-system",
    label: "Sistema de email (Resend)",
    icon: "📧",
    description: "Newsletter, notificaciones y emails transaccionales",
    articles: [
      {
        id: "email-overview",
        title: "Como funciona el sistema de email",
        content: `
<p>Tu panel usa <strong>Resend</strong> para enviar tres tipos de email:</p>

<h2>1. Emails transaccionales (automaticos)</h2>
<ul>
<li><strong>Confirmacion de reserva:</strong> El cliente recibe una confirmacion cuando reserva</li>
<li><strong>Notificacion de nueva reserva:</strong> Tu recibes un email cuando alguien reserva</li>
<li><strong>Notificacion de lead:</strong> Recibes un email cuando alguien rellena un formulario de landing page</li>
</ul>

<h2>2. Newsletter (campanas manuales)</h2>
<ul>
<li>Envia emails masivos a todos tus suscriptores</li>
<li>Crea campanas desde la seccion Newsletter</li>
</ul>

<h2>3. Notificaciones de contacto</h2>
<ul>
<li>Recibes notificaciones cuando alguien te contacta desde el formulario de la web</li>
</ul>

<div class="kb-info">
<strong>Requisito:</strong> Todos los emails necesitan que tengas configurada la clave API de Resend. Ve a <strong>Configuracion > Email</strong> para configurarla.
</div>
`,
      },
      {
        id: "newsletter-campaigns",
        title: "Crear campanas de newsletter",
        content: `
<h2>Como crear una campana</h2>

<ol>
<li>Ve a <strong>Newsletter > Campanas</strong></li>
<li>Haz clic en <strong>"Nueva campana"</strong></li>
<li>Rellena:
  <ul>
    <li><strong>Asunto:</strong> La linea de asunto del email</li>
    <li><strong>Contenido:</strong> El cuerpo del email (soporta formato HTML)</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong> para guardar como borrador</li>
<li>Cuando estes listo, haz clic en <strong>"Enviar"</strong></li>
</ol>

<h2>Mejores practicas para newsletters</h2>

<ul>
<li><strong>Asunto:</strong> Corto y atractivo (max 50 caracteres). Evita palabras como "GRATIS" o "URGENTE" que activan filtros de spam</li>
<li><strong>Contenido:</strong> Aporta valor real. No envies solo promociones</li>
<li><strong>Frecuencia:</strong> 1-2 emails por semana maximo. Respetar la bandeja de entrada de tus suscriptores</li>
<li><strong>Desuscripcion:</strong> Todos los emails incluyen un enlace de desuscripcion automaticamente</li>
</ul>

<div class="kb-warning">
<strong>Recuerda:</strong> Resend tiene un limite de 100 emails/dia y 3,000/mes en el plan gratuito. Planifica tus envios en consecuencia.
</div>
`,
      },
      {
        id: "manage-subscribers",
        title: "Gestionar suscriptores",
        content: `
<h2>Como se suscriben los usuarios</h2>

<p>Los visitantes de tu web pueden suscribirse a traves del <strong>formulario de newsletter</strong> en tu pagina publica. Al registrarse:</p>
<ol>
<li>Se guardan en la base de datos como suscriptores</li>
<li>Reciben un email de confirmacion (si esta configurado)</li>
<li>Aparecen en la lista de suscriptores del admin</li>
</ol>

<h2>Ver y gestionar suscriptores</h2>

<ol>
<li>Ve a <strong>Newsletter > Suscriptores</strong></li>
<li>Veras la lista completa con: email, estado (activo/inactivo) y fecha de suscripcion</li>
<li>Puedes activar o desactivar suscriptores individualmente</li>
</ol>

<h2>Desuscripcion</h2>

<p>Los suscriptores pueden darse de baja haciendo clic en el enlace "Desuscribirse" que aparece al final de cada email. Esto es <strong>obligatorio por ley</strong> (RGPD) y se incluye automaticamente.</p>
`,
      },
    ],
  },

  /* ================================================================
     CONTACTS AND LEADS
     ================================================================ */
  {
    id: "contacts",
    label: "Contactos y leads",
    icon: "👥",
    description: "Gestiona tu base de datos de contactos",
    articles: [
      {
        id: "contacts-overview",
        title: "Gestion de contactos",
        content: `
<h2>Que es un contacto</h2>

<p>Un <strong>contacto</strong> es cualquier persona que ha interactuado con tu web. Los contactos se crean automaticamente cuando alguien:</p>

<ul>
<li>Rellena el <strong>formulario de contacto</strong> de tu web</li>
<li>Realiza una <strong>reserva</strong></li>
<li>Se registra a traves de un <strong>formulario de landing page</strong></li>
</ul>

<h2>Ver contactos</h2>

<ol>
<li>Ve a <strong>Contactos</strong> en el menu lateral</li>
<li>Veras una tabla con: nombre, email, telefono, fuente y fecha</li>
<li>Haz clic en un contacto para ver sus detalles</li>
</ol>

<h2>Informacion disponible</h2>

<p>Cada contacto puede tener:</p>
<ul>
<li><strong>Nombre</strong></li>
<li><strong>Email</strong></li>
<li><strong>Telefono</strong></li>
<li><strong>Mensaje</strong> (si lo envio a traves de un formulario)</li>
<li><strong>Fuente</strong> — De donde vino (formulario web, reserva, landing page)</li>
</ul>

<div class="kb-info">
<strong>Tip:</strong> Los contactos de landing pages tambien aparecen como "leads" asociados a la pagina especifica. Desde Contactos puedes ver todos tus leads centralizados.
</div>
`,
      },
    ],
  },

  /* ================================================================
     TROUBLESHOOTING
     ================================================================ */
  {
    id: "troubleshooting",
    label: "Solucion de problemas",
    icon: "🔧",
    description: "Soluciones a los problemas mas comunes",
    articles: [
      {
        id: "images-not-uploading",
        title: "Las imagenes no se suben",
        content: `
<h2>Posibles causas y soluciones</h2>

<h3>1. Formato no soportado</h3>
<p><strong>Problema:</strong> Intentas subir un archivo que no es JPG, PNG o WebP.</p>
<p><strong>Solucion:</strong> Convierte la imagen a uno de los formatos soportados. Puedes usar herramientas online gratuitas como <a href="https://cloudconvert.com" target="_blank">CloudConvert</a>.</p>

<h3>2. Archivo demasiado grande</h3>
<p><strong>Problema:</strong> La imagen pesa mas de 5 MB.</p>
<p><strong>Solucion:</strong> Reduce el tamano de la imagen. Usa <a href="https://tinypng.com" target="_blank">TinyPNG</a> o <a href="https://squoosh.app" target="_blank">Squoosh</a> para comprimir sin perder calidad visible.</p>

<h3>3. Problemas de permisos en el servidor</h3>
<p><strong>Problema:</strong> El servidor no tiene permisos para escribir en la carpeta de uploads.</p>
<p><strong>Solucion:</strong> Contacta a tu administrador de sistema para verificar que la carpeta <code>public/uploads/</code> tiene permisos de escritura.</p>

<h3>4. Espacio en disco lleno</h3>
<p><strong>Problema:</strong> El servidor no tiene espacio disponible.</p>
<p><strong>Solucion:</strong> Limpia archivos innecesarios o amplia el almacenamiento de tu VPS.</p>

<div class="kb-info">
<strong>Verificacion rapida:</strong> Si una imagen no se sube, intenta con una imagen mas pequena (ej: JPG de 100KB). Si esa funciona, el problema es de tamano. Si no, es de permisos o conexion.
</div>
`,
      },
      {
        id: "emails-not-sending",
        title: "Los emails no se envian",
        content: `
<h2>Posibles causas y soluciones</h2>

<h3>1. Clave API de Resend no configurada</h3>
<p><strong>Problema:</strong> No has configurado la clave API.</p>
<p><strong>Solucion:</strong> Ve a <strong>Configuracion > Email</strong> y pega tu clave API de Resend.</p>

<h3>2. Clave API invalida o expirada</h3>
<p><strong>Problema:</strong> La clave API que pegaste no es valida.</p>
<p><strong>Solucion:</strong> Ve a <a href="https://resend.com/api-keys" target="_blank">resend.com/api-keys</a>, crea una nueva clave y pegala en la configuracion.</p>

<h3>3. Dominio no verificado</h3>
<p><strong>Problema:</strong> Intentas enviar desde un email de un dominio no verificado en Resend.</p>
<p><strong>Solucion:</strong> Verifica tu dominio en Resend o usa <code>onboarding@resend.dev</code> como email de remitente para pruebas.</p>

<h3>4. Limite de emails alcanzado</h3>
<p><strong>Problema:</strong> Has superado el limite de 100 emails/dia o 3,000/mes del plan gratuito.</p>
<p><strong>Solucion:</strong> Espera al dia siguiente o considera subir a un plan de pago en Resend.</p>

<h3>5. Emails en spam</h3>
<p><strong>Problema:</strong> Los emails llegan pero van a la carpeta de spam del destinatario.</p>
<p><strong>Solucion:</strong> Verifica tu dominio en Resend con los registros DNS (SPF, DKIM). Esto mejora significativamente la entregabilidad.</p>
`,
      },
      {
        id: "ai-not-working",
        title: "La IA no funciona",
        content: `
<h2>Posibles causas y soluciones</h2>

<h3>1. Clave API de OpenAI no configurada</h3>
<p><strong>Problema:</strong> No has configurado la clave.</p>
<p><strong>Solucion:</strong> Ve a <strong>Configuracion > IA</strong> y pega tu clave API de OpenAI.</p>

<h3>2. Sin saldo en OpenAI</h3>
<p><strong>Problema:</strong> Tu cuenta de OpenAI no tiene credito disponible.</p>
<p><strong>Solucion:</strong> Ve a <a href="https://platform.openai.com/settings/organization/billing" target="_blank">OpenAI Billing</a> y agrega credito.</p>

<h3>3. Clave API expirada o revocada</h3>
<p><strong>Problema:</strong> La clave que usas ya no es valida.</p>
<p><strong>Solucion:</strong> Crea una nueva clave en <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a> y actualizala en la configuracion.</p>

<h3>4. Ollama no esta corriendo (IA local)</h3>
<p><strong>Problema:</strong> Seleccionaste "Local" pero Ollama no esta ejecutandose.</p>
<p><strong>Solucion:</strong> Abre la terminal y ejecuta <code>ollama serve</code> para iniciar el servicio. Verifica que responde en <code>http://localhost:11434</code>.</p>

<h3>5. Modelo no descargado (Ollama)</h3>
<p><strong>Problema:</strong> El modelo configurado no esta disponible.</p>
<p><strong>Solucion:</strong> Ejecuta <code>ollama pull nombre-del-modelo</code> para descargarlo.</p>

<h3>6. Contenido generado es de baja calidad</h3>
<p><strong>Solucion:</strong></p>
<ul>
<li>Mejora tu <strong>System Prompt</strong> en Configuracion > IA (se mas especifico sobre tu nicho)</li>
<li>Usa un modelo mas potente (gpt-4o en vez de gpt-4o-mini)</li>
<li>Agrega <strong>contexto adicional</strong> al generar cada articulo</li>
</ul>
`,
      },
      {
        id: "booking-issues",
        title: "Problemas con las reservas",
        content: `
<h2>Posibles causas y soluciones</h2>

<h3>1. Los clientes no ven fechas disponibles</h3>
<p><strong>Problema:</strong> No has configurado la disponibilidad.</p>
<p><strong>Solucion:</strong> Ve a <strong>Reservas > Disponibilidad</strong> y configura tus horarios. Sin disponibilidad configurada, el calendario no muestra ningun dia como disponible.</p>

<h3>2. El enlace de reserva no funciona</h3>
<p><strong>Posibles causas:</strong></p>
<ul>
<li><strong>Enlace desactivado:</strong> Verificalo en Reservas > Enlaces. Activalo si esta desactivado</li>
<li><strong>Enlace expirado:</strong> Si configuraste una fecha de expiracion, puede haber pasado ya</li>
<li><strong>Slug incorrecto:</strong> Verifica que el slug en la URL coincide con el que creaste</li>
</ul>

<h3>3. Doble reserva en el mismo horario</h3>
<p><strong>No deberia ocurrir.</strong> El sistema verifica automaticamente la disponibilidad antes de confirmar. Si ocurre:</p>
<ul>
<li>El sistema re-verifica la disponibilidad justo antes de crear la reserva</li>
<li>Si detecta conflicto, muestra error 409 y el cliente ve las horas actualizadas</li>
</ul>

<h3>4. No recibo emails de notificacion de reserva</h3>
<p><strong>Solucion:</strong></p>
<ul>
<li>Verifica que Resend esta configurado correctamente (Configuracion > Email)</li>
<li>Verifica el email de contacto configurado</li>
<li>Revisa la carpeta de spam</li>
</ul>

<h3>5. El cliente no recibe el email de confirmacion</h3>
<p><strong>Solucion:</strong> Mismo problema que los emails no enviados. Verifica la configuracion de Resend y el dominio verificado.</p>
`,
      },
      {
        id: "general-issues",
        title: "Problemas generales",
        content: `
<h3>La pagina carga lento</h3>
<ul>
<li>Comprueba tu conexion a internet</li>
<li>Limpia la cache del navegador (Ctrl+Shift+Delete)</li>
<li>Si el servidor esta lento, puede necesitar mas recursos (RAM/CPU)</li>
</ul>

<h3>Los cambios no se reflejan en la web</h3>
<ul>
<li>Espera 10-30 segundos y recarga la pagina</li>
<li>Limpia la cache del navegador</li>
<li>Prueba en una ventana de incognito</li>
</ul>

<h3>No puedo iniciar sesion</h3>
<ul>
<li>Verifica que tu email y contrasena son correctos</li>
<li>Limpia las cookies del navegador</li>
<li>Prueba en otro navegador</li>
</ul>

<h3>Algo se ve mal en el movil</h3>
<ul>
<li>Todo el panel esta disenado para ser responsive</li>
<li>Si algo no se ve bien, prueba a rotar el dispositivo</li>
<li>Si el problema persiste, limpia cache y recarga</li>
</ul>

<div class="kb-info">
<strong>Si ningun paso soluciona tu problema:</strong> Toma una captura de pantalla del error, anota que estabas haciendo y contacta al soporte tecnico.
</div>
`,
      },
    ],
  },
];
