/* ─── Knowledge Base Content ─────────────────────── */
/* Professional SaaS documentation system            */
/* All articles use HTML with kb-info, kb-warning,   */
/* and kb-code class callout boxes.                  */

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
        title: "Bienvenido al panel",
        content: `
<p>Este panel es tu <strong>centro de control</strong> para gestionar toda tu presencia online como profesional del fitness. Desde un unico sitio puedes crear contenido, gestionar reservas, enviar newsletters, y mucho mas — sin necesidad de conocimientos tecnicos.</p>

<div class="kb-info">
<strong>Consejo para empezar:</strong> No necesitas configurar todo de golpe. Sigue los pasos de esta guia y en 15 minutos tendras lo basico listo.
</div>

<h2>Que puedes hacer desde aqui</h2>

<ul>
<li><strong>Blog:</strong> Escribe y publica articulos. La IA puede generar borradores completos por ti</li>
<li><strong>Galeria:</strong> Sube fotos de entrenamientos, competiciones o transformaciones</li>
<li><strong>Reservas:</strong> Permite que tus clientes reserven citas directamente desde tu web</li>
<li><strong>Landing Pages:</strong> Crea paginas profesionales para eventos, webinars o servicios</li>
<li><strong>Newsletter:</strong> Envia emails a todos tus suscriptores</li>
<li><strong>Contactos:</strong> Centraliza todos tus leads y clientes en un solo lugar</li>
<li><strong>Analytics:</strong> Consulta cuanta gente visita tu web</li>
</ul>

<h2>El menu lateral</h2>

<p>La navegacion se organiza en secciones logicas:</p>

<ul>
<li><strong>Principal</strong> — Dashboard (resumen) y Analytics (estadisticas)</li>
<li><strong>Contenido</strong> — Blog, generador de ideas con IA, y galeria de fotos</li>
<li><strong>Newsletter</strong> — Campanas de email y gestion de suscriptores</li>
<li><strong>Reservas</strong> — Tus enlaces, el listado de citas, y tu disponibilidad horaria</li>
<li><strong>Eventos</strong> — Landing pages para tus eventos y servicios</li>
<li><strong>Gestion</strong> — Contactos, usuarios y configuracion general</li>
</ul>

<h2>Lista de arranque rapido</h2>

<p>Para tener tu sitio completamente funcional, necesitas estos 5 pasos:</p>

<ol>
<li><strong>Configura las claves API</strong> — Ve a <em>Configuracion</em> y configura OpenAI (para la IA) y Resend (para enviar emails). Sin esto, estas funciones no estaran disponibles</li>
<li><strong>Sube imagenes a la galeria</strong> — Las necesitaras para el blog y las landing pages</li>
<li><strong>Define tu disponibilidad horaria</strong> — Para que los clientes puedan reservar citas</li>
<li><strong>Publica tu primer articulo</strong> — Usa la IA para generar un borrador y luego edita con tu toque personal</li>
<li><strong>Crea tu primer enlace de reserva</strong> — Compartelo en redes para empezar a recibir clientes</li>
</ol>
`,
      },
      {
        id: "dashboard-overview",
        title: "El Dashboard principal",
        content: `
<p>El <strong>Dashboard</strong> es lo primero que ves al entrar al panel. Te da una foto instantanea de toda tu actividad sin tener que navegar entre secciones.</p>

<h2>Informacion que muestra</h2>

<ul>
<li><strong>Tarjetas de estadisticas</strong> — Numero total de posts publicados, contactos, suscriptores activos y reservas pendientes</li>
<li><strong>Actividad reciente</strong> — Las ultimas acciones que han ocurrido (nuevas reservas, leads, posts publicados)</li>
<li><strong>Accesos rapidos</strong> — Botones directos para las acciones mas habituales (nuevo post, nueva campana, etc.)</li>
</ul>

<h2>Como aprovecharlo</h2>

<p>Acostumbrate a echar un vistazo al dashboard cada vez que entres al panel. Es la forma mas rapida de detectar:</p>

<ul>
<li>Nuevas reservas que necesitan tu atencion</li>
<li>Leads frescos de tus landing pages</li>
<li>El crecimiento de tus suscriptores</li>
</ul>

<div class="kb-info">
<strong>Buena practica:</strong> Revisa el dashboard cada manana. Te tomara menos de 30 segundos y te mantendra al dia con todo lo que pasa en tu web.
</div>
`,
      },
      {
        id: "navigation",
        title: "Navegacion del panel",
        content: `
<h2>En escritorio</h2>

<p>El menu lateral esta siempre visible a la izquierda. Haz clic en cualquier seccion para navegar. La seccion activa se resalta con un indicador dorado.</p>

<h2>En movil</h2>

<ol>
<li>Pulsa el icono de <strong>menu</strong> (tres lineas horizontales) en la esquina superior derecha</li>
<li>El menu se despliega desde la izquierda</li>
<li>Pulsa en la seccion que necesites</li>
<li>El menu se cierra automaticamente al cambiar de pagina</li>
</ol>

<h2>URLs directas (favoritos)</h2>

<p>Cada seccion del panel tiene su propia URL. Si quieres acceder rapidamente a algo concreto, puedes guardar la URL en los favoritos de tu navegador:</p>

<ul>
<li><code>/dashboard</code> — Panel principal</li>
<li><code>/dashboard/posts</code> — Todos tus posts</li>
<li><code>/dashboard/gallery</code> — Galeria de imagenes</li>
<li><code>/dashboard/booking-links</code> — Tus enlaces de reserva</li>
<li><code>/dashboard/event-pages</code> — Landing pages</li>
<li><code>/dashboard/settings</code> — Configuracion</li>
<li><code>/dashboard/knowledge</code> — Esta guia de ayuda</li>
</ul>
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
    description: "Conecta OpenAI, Ollama y Resend para activar la IA y los emails",
    articles: [
      {
        id: "what-is-api-key",
        title: "Que es una clave API",
        content: `
<p>Una <strong>clave API</strong> es un codigo unico que permite que tu panel se comunique con servicios externos. Es como una contrasena que le da permiso a tu web para usar herramientas de terceros.</p>

<div class="kb-info">
<strong>Ejemplo simple:</strong> Para que tu panel pueda generar articulos con inteligencia artificial, necesita "presentarse" ante OpenAI con una clave API. Sin esa clave, OpenAI no sabe quien eres y rechaza la solicitud.
</div>

<h2>Que servicios necesitan clave</h2>

<ul>
<li><strong>OpenAI</strong> — Genera articulos, ideas y portadas para tu blog usando inteligencia artificial. <em>Coste: ~$0.01 por articulo</em></li>
<li><strong>Resend</strong> — Envia todos los emails: confirmaciones de reserva, newsletters, y notificaciones de leads. <em>Gratis hasta 3,000 emails/mes</em></li>
</ul>

<h2>Son seguras mis claves?</h2>

<p><strong>Si.</strong> Las claves se guardan <strong>encriptadas</strong> (cifrado AES-256) en la base de datos. Una vez guardadas, nadie puede verlas — ni siquiera tu. Solo se muestra un formato oculto como <code>sk-••••••abc123</code>.</p>

<div class="kb-warning">
<strong>Nunca compartas tus claves API</strong> por email, redes sociales o mensajes. Son privadas y dan acceso directo a los servicios vinculados a tu cuenta de pago.
</div>

<h2>Donde se configuran</h2>

<ol>
<li>Abre <strong>Configuracion</strong> en el menu lateral (icono de engranaje)</li>
<li>Pestana <strong>"IA"</strong> — para la clave de OpenAI y opciones de inteligencia artificial</li>
<li>Pestana <strong>"Email"</strong> — para la clave de Resend y opciones de correo</li>
</ol>
`,
      },
      {
        id: "openai-setup",
        title: "Configurar OpenAI (inteligencia artificial)",
        content: `
<p>OpenAI es el servicio que potencia toda la inteligencia artificial del panel: generacion de articulos, ideas para el blog e imagenes de portada.</p>

<h2>Paso 1 — Crear una cuenta en OpenAI</h2>

<ol>
<li>Abre <a href="https://platform.openai.com" target="_blank" rel="noopener"><strong>platform.openai.com</strong></a> en tu navegador</li>
<li>Haz clic en <strong>"Sign up"</strong> (Registrarse)</li>
<li>Puedes usar tu email, Google o Microsoft</li>
<li>Confirma tu email si te lo pide</li>
</ol>

<h2>Paso 2 — Anadir un metodo de pago</h2>

<ol>
<li>Dentro de OpenAI, ve a <strong>Settings &gt; Billing</strong></li>
<li>Haz clic en <strong>"Add payment method"</strong></li>
<li>Introduce tu tarjeta de credito o debito</li>
<li>Configura un <strong>limite mensual de $5</strong> para empezar (mas que suficiente)</li>
</ol>

<div class="kb-info">
<strong>Sobre los costes:</strong> Generar un articulo completo cuesta entre $0.01 y $0.05. Con $5 puedes generar cientos de articulos. El coste es realmente minimo.
</div>

<h2>Paso 3 — Crear tu clave API</h2>

<ol>
<li>Ve a <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener"><strong>platform.openai.com/api-keys</strong></a></li>
<li>Haz clic en <strong>"Create new secret key"</strong></li>
<li>Ponle un nombre descriptivo: <code>KikoVargas Panel</code></li>
<li><strong>Copia la clave inmediatamente</strong> — solo se muestra una vez</li>
</ol>

<div class="kb-warning">
<strong>Importante:</strong> La clave solo se muestra una vez. Si la pierdes, tendras que crear una nueva. Guardala temporalmente en un bloc de notas hasta pegarla en la configuracion.
</div>

<p>Las claves de OpenAI tienen este formato:</p>
<div class="kb-code">sk-proj-abc123def456ghi789...</div>

<h2>Paso 4 — Pegar la clave en tu panel</h2>

<ol>
<li>Ve a <strong>Configuracion</strong> en tu panel (menu lateral)</li>
<li>Abre la pestana <strong>"IA"</strong></li>
<li>Pega tu clave en el campo <strong>"API Key de OpenAI"</strong></li>
<li>Elige tu modelo preferido (ver abajo)</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Que modelo elegir</h2>

<p>El panel te ofrece varios modelos de IA. Aqui tienes la comparativa:</p>

<ul>
<li><strong>gpt-4o-mini</strong> — El mas recomendado para empezar. Rapido, barato y con muy buena calidad. Ideal para el 90% de los casos</li>
<li><strong>gpt-4o</strong> — Mayor calidad en textos complejos. Algo mas caro (~5x que mini). Usalo si necesitas articulos muy elaborados</li>
<li><strong>gpt-4.1-mini</strong> — El modelo compacto mas reciente. Similar a gpt-4o-mini pero con mejoras</li>
<li><strong>gpt-4.1</strong> — El modelo premium mas reciente. La mejor calidad disponible</li>
</ul>

<div class="kb-info">
<strong>Nuestra recomendacion:</strong> Empieza con <strong>gpt-4o-mini</strong>. Si en algun momento notas que los articulos no tienen la calidad que necesitas, sube a gpt-4o o gpt-4.1.
</div>

<h2>Cuanto voy a gastar</h2>

<ul>
<li>Generar un articulo completo: <strong>$0.01 – $0.05</strong></li>
<li>Generar una lista de ideas: <strong>~$0.005</strong></li>
<li>Generar una imagen de portada: <strong>~$0.04</strong></li>
<li>Publicar 10 articulos al mes: <strong>~$0.50 – $1.00 en total</strong></li>
</ul>
`,
      },
      {
        id: "ollama-setup",
        title: "Configurar IA local con Ollama",
        content: `
<p><strong>Ollama</strong> es una alternativa gratuita a OpenAI que ejecuta la inteligencia artificial directamente en tu ordenador, sin enviar datos a servidores externos.</p>

<div class="kb-info">
<strong>Para quien es Ollama:</strong> Para usuarios con un ordenador potente (minimo 8 GB de RAM, ideal 16 GB+) que prefieren no depender de servicios de pago o que valoran la privacidad de sus datos. La calidad es buena, pero generalmente inferior a GPT-4.
</div>

<h2>Paso 1 — Instalar Ollama</h2>

<ol>
<li>Abre <a href="https://ollama.ai" target="_blank" rel="noopener"><strong>ollama.ai</strong></a></li>
<li>Descarga la version para tu sistema (Windows, Mac o Linux)</li>
<li>Instala el programa</li>
<li>Al terminar, Ollama se ejecuta automaticamente en segundo plano</li>
</ol>

<h2>Paso 2 — Descargar un modelo de IA</h2>

<p>Abre la terminal de tu ordenador y ejecuta este comando:</p>

<div class="kb-code">ollama pull llama3</div>

<p>Esto descarga <strong>Llama 3</strong> (de Meta), el modelo recomendado: gratuito y con buena calidad de generacion.</p>

<p>Otros modelos disponibles:</p>
<ul>
<li><code>llama3</code> — Equilibrado y rapido. <strong>Recomendado</strong></li>
<li><code>llama3:70b</code> — Mayor calidad pero necesita 40 GB+ de RAM</li>
<li><code>mistral</code> — Rapido y eficiente. Buena alternativa</li>
<li><code>mixtral</code> — Potente pero mas lento</li>
</ul>

<h2>Paso 3 — Verificar la instalacion</h2>

<p>En la terminal, ejecuta:</p>

<div class="kb-code">ollama run llama3 "Hola, dime una frase motivacional sobre fitness"</div>

<p>Si recibes una respuesta, Ollama esta funcionando correctamente.</p>

<h2>Paso 4 — Configurar en el panel</h2>

<ol>
<li>Abre <strong>Configuracion &gt; IA</strong></li>
<li>En "Proveedor", selecciona <strong>"Local"</strong></li>
<li>En "Endpoint", deja el valor por defecto: <code>http://localhost:11434</code></li>
<li>En "Modelo", escribe: <code>llama3</code></li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<div class="kb-warning">
<strong>Limitacion importante:</strong> Ollama <strong>no puede generar imagenes de portada</strong>. La generacion de imagenes solo funciona con OpenAI (DALL-E). Si usas Ollama, tendras que subir las portadas manualmente desde la galeria.
</div>

<h2>Si tu web esta en un servidor (VPS)</h2>

<p>Ollama necesita estar instalado en el <strong>mismo servidor</strong> donde corre tu web, o en un servidor cuya URL sea accesible. En ese caso, cambia el endpoint a la IP de tu servidor (ej: <code>http://tu-ip:11434</code>).</p>
`,
      },
      {
        id: "resend-setup",
        title: "Configurar Resend (envio de emails)",
        content: `
<p><strong>Resend</strong> es el servicio que permite a tu panel enviar emails: confirmaciones de reserva, newsletters, y notificaciones cuando alguien rellena un formulario.</p>

<div class="kb-info">
<strong>Buena noticia:</strong> Resend tiene un plan gratuito de <strong>3,000 emails al mes</strong> (100/dia). Para la mayoria de usuarios, es mas que suficiente.
</div>

<h2>Paso 1 — Crear cuenta en Resend</h2>

<ol>
<li>Abre <a href="https://resend.com" target="_blank" rel="noopener"><strong>resend.com</strong></a></li>
<li>Haz clic en <strong>"Get Started"</strong></li>
<li>Registrate con tu email o cuenta de GitHub</li>
<li>Confirma tu email</li>
</ol>

<h2>Paso 2 — Crear tu clave API</h2>

<ol>
<li>Dentro del dashboard de Resend, abre <strong>"API Keys"</strong> en el menu lateral</li>
<li>Haz clic en <strong>"Create API Key"</strong></li>
<li>Nombre: <code>KikoVargas Panel</code></li>
<li>Permiso: <strong>"Full access"</strong></li>
<li>Dominio: dejalo en "All domains"</li>
<li>Haz clic en <strong>"Create"</strong></li>
<li><strong>Copia la clave</strong> — solo se muestra una vez</li>
</ol>

<p>Las claves de Resend tienen este formato:</p>
<div class="kb-code">re_abc123def456ghi789...</div>

<h2>Paso 3 — Verificar tu dominio (recomendado)</h2>

<p>Sin dominio verificado, los emails se envian desde <code>onboarding@resend.dev</code> (funcional pero poco profesional). Para enviar desde tu propio dominio:</p>

<ol>
<li>En Resend, abre <strong>"Domains"</strong></li>
<li>Haz clic en <strong>"Add Domain"</strong></li>
<li>Escribe tu dominio (ej: <code>kikovargas.com</code>)</li>
<li>Resend te mostrara registros DNS que necesitas agregar en tu proveedor de dominio</li>
<li>Agrega los registros (normalmente MX, TXT y CNAME)</li>
<li>Espera la verificacion (entre 5 y 60 minutos)</li>
</ol>

<div class="kb-info">
<strong>Puedes empezar sin verificar el dominio.</strong> Usa <code>onboarding@resend.dev</code> como email de remitente para hacer pruebas. Cuando tengas tu dominio verificado, cambia el remitente en la configuracion.
</div>

<h2>Paso 4 — Configurar en el panel</h2>

<ol>
<li>Abre <strong>Configuracion &gt; Email</strong></li>
<li>Pega tu clave API en el campo correspondiente</li>
<li>Configura estos tres campos:
  <ul>
    <li><strong>Nombre del remitente:</strong> El nombre que veran los destinatarios (ej: "Kiko Vargas")</li>
    <li><strong>Email del remitente:</strong> La direccion desde la que se envian los emails. Debe ser de un dominio verificado en Resend, o usa <code>onboarding@resend.dev</code></li>
    <li><strong>Email de contacto:</strong> Donde tu recibiras las notificaciones (nuevos formularios, reservas, leads)</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Limites del plan gratuito</h2>

<ul>
<li><strong>100 emails por dia</strong></li>
<li><strong>3,000 emails por mes</strong></li>
<li>Sin limite de contactos</li>
</ul>

<p>Solo necesitarias un plan de pago si envias newsletters a miles de suscriptores de forma regular.</p>
`,
      },
      {
        id: "system-prompt",
        title: "Personalizar la IA (System Prompt)",
        content: `
<p>El <strong>System Prompt</strong> es una instruccion permanente que define como se comporta la inteligencia artificial en tu panel. Cada vez que generas ideas o articulos, la IA lee este prompt para entender tu contexto.</p>

<h2>Por que es importante</h2>

<p>Sin un buen System Prompt, la IA genera contenido generico. Con uno bien escrito, genera contenido que suena como <strong>tu</strong> — con tu tono, tu terminologia y tu enfoque.</p>

<h2>Como configurarlo</h2>

<ol>
<li>Ve a <strong>Configuracion &gt; IA</strong></li>
<li>Busca el campo <strong>"System Prompt"</strong></li>
<li>Escribe tus instrucciones (ver ejemplo abajo)</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Ejemplo de un buen System Prompt</h2>

<div class="kb-code">Eres el asistente de contenido de Kiko Vargas, un profesional IFBB Pro especializado en fitness, nutricion deportiva y preparacion de competidores de culturismo. El tono debe ser profesional pero cercano, usando lenguaje claro y motivador. El publico objetivo son personas interesadas en mejorar su fisico, tanto principiantes como competidores avanzados. Todo el contenido debe estar en espanol.</div>

<h2>Claves para un buen prompt</h2>

<ul>
<li><strong>Se especifico sobre tu nicho:</strong> "culturismo y nutricion deportiva" es mejor que "fitness"</li>
<li><strong>Define tu tono:</strong> Profesional, cercano, motivador, tecnico, casual...</li>
<li><strong>Menciona tu audiencia:</strong> Principiantes, avanzados, competidores, mujeres, hombres...</li>
<li><strong>Indica tu nombre y credenciales:</strong> Ayuda a la IA a personalizar el contenido</li>
<li><strong>Especifica el idioma:</strong> Escribe "todo el contenido debe ser en espanol"</li>
</ul>

<div class="kb-warning">
<strong>Evita:</strong> Prompts demasiado vagos como "genera contenido sobre fitness". Cuanto mas contexto proporciones, mas personalizado y util sera el resultado.
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
    description: "Crea, edita y publica articulos con asistencia de IA",
    articles: [
      {
        id: "create-post",
        title: "Crear un nuevo articulo",
        content: `
<p>Hay dos formas de crear articulos: escribirlo tu mismo, o dejar que la IA genere un borrador que luego editas. Ambos metodos empiezan igual.</p>

<h2>Metodo 1 — Escribir manualmente</h2>

<ol>
<li>Abre <strong>Posts</strong> en el menu lateral</li>
<li>Haz clic en <strong>"Nuevo post"</strong></li>
<li>Rellena los campos:
  <ul>
    <li><strong>Titulo:</strong> El titulo principal de tu articulo</li>
    <li><strong>Slug:</strong> La URL del post (se genera sola desde el titulo, pero puedes editarla)</li>
    <li><strong>Extracto:</strong> Un resumen corto. Opcional pero muy recomendado para SEO</li>
    <li><strong>Contenido:</strong> El cuerpo del articulo, con el editor visual</li>
    <li><strong>Estado:</strong> "Borrador" (guardar sin publicar) o "Publicado" (visible en tu web)</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Metodo 2 — Generar con IA (recomendado)</h2>

<ol>
<li>Abre <strong>Ideas IA</strong> en el menu lateral</li>
<li>Escribe un tema general (ej: "nutricion para masa muscular")</li>
<li>Elige cuantas ideas quieres: 3, 5, 7 o 10</li>
<li>Haz clic en <strong>"Generar ideas"</strong></li>
<li>Revisa las ideas. Haz clic en <strong>"Crear post"</strong> en la que mas te guste</li>
<li>En el editor, haz clic en <strong>"Generar articulo"</strong></li>
<li>La IA escribira el articulo completo y generara una imagen de portada</li>
<li>Revisa, edita y ajusta el contenido a tu estilo</li>
<li>Cambia el estado a <strong>"Publicado"</strong> cuando este listo</li>
</ol>

<div class="kb-info">
<strong>Tip profesional:</strong> Antes de generar, agrega "contexto adicional" en el campo correspondiente. Ejemplo: <em>"Enfocado en principiantes, con un plan de dieta semanal concreto"</em>. Esto mejora drasticamente la calidad del resultado.
</div>

<h2>El editor de contenido</h2>

<p>El editor visual soporta:</p>
<ul>
<li><strong>Negrita</strong> y <em>cursiva</em></li>
<li>Encabezados (H2, H3) para estructurar el articulo</li>
<li>Listas con viñetas y listas numeradas</li>
<li>Citas en bloque</li>
<li>Enlaces a otras paginas</li>
</ul>
`,
      },
      {
        id: "edit-publish",
        title: "Editar y publicar articulos",
        content: `
<h2>Editar un articulo existente</h2>

<ol>
<li>Ve a <strong>Posts</strong></li>
<li>Busca el post que quieres modificar</li>
<li>Haz clic en <strong>"Editar"</strong></li>
<li>Realiza tus cambios</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Estados de un articulo</h2>

<p>Cada articulo tiene uno de estos tres estados:</p>

<ul>
<li><strong>Borrador</strong> — Guardado pero <strong>no visible</strong> en tu blog. Perfecto para trabajar en el contenido antes de publicar</li>
<li><strong>Publicado</strong> — <strong>Visible para todos</strong> en la pagina del blog. Aparece en la lista de articulos de tu web</li>
<li><strong>Archivado</strong> — Oculto del blog pero conservado. Util para articulos antiguos que no quieres borrar</li>
</ul>

<h2>Flujo de trabajo recomendado</h2>

<ol>
<li>Crea el articulo como <strong>Borrador</strong></li>
<li>Genera o escribe el contenido</li>
<li>Revisalo con calma (ortografia, datos, estructura)</li>
<li>Cambia a <strong>Publicado</strong> cuando estes conforme</li>
<li>Comparte la URL en tus redes sociales</li>
</ol>

<h2>Imagenes de portada</h2>

<p>La imagen de portada se muestra en la lista del blog y al inicio del articulo.</p>

<ul>
<li><strong>Generada con IA:</strong> Se crea automaticamente al usar "Generar articulo" (usa DALL-E de OpenAI)</li>
<li><strong>Subida manualmente:</strong> Puedes subir tu propia imagen desde el editor</li>
</ul>

<div class="kb-warning">
<strong>Nota:</strong> La generacion automatica de imagenes solo funciona con OpenAI. Si usas Ollama, tendras que subir las portadas manualmente.
</div>
`,
      },
      {
        id: "blog-seo",
        title: "Consejos para posicionar tu blog",
        content: `
<p>El SEO (posicionamiento en buscadores) determina si la gente encuentra tus articulos en Google. Aqui tienes las practicas basicas que puedes aplicar desde el panel.</p>

<h2>Optimizacion basica de cada articulo</h2>

<ul>
<li><strong>Titulo:</strong> 50-70 caracteres. Incluye la palabra clave principal. Ej: "Guia completa de nutricion para ganar masa muscular"</li>
<li><strong>Slug:</strong> Corto y descriptivo. Ej: <code>guia-nutricion-masa-muscular</code> (no <code>mi-articulo-1</code>)</li>
<li><strong>Extracto:</strong> 150-160 caracteres que resuman el articulo. Google lo usa como descripcion en los resultados</li>
<li><strong>Contenido:</strong> Minimo 500 palabras. Los articulos de 1,500+ palabras tienden a posicionar mejor</li>
<li><strong>Imagenes:</strong> Siempre incluye una portada. Las fotos propias son mas valoradas que las genericas</li>
</ul>

<h2>Frecuencia de publicacion</h2>

<p>La consistencia importa mas que la cantidad:</p>
<ul>
<li><strong>Minimo:</strong> 1 articulo por semana</li>
<li><strong>Ideal:</strong> 2-3 articulos por semana</li>
<li><strong>Con IA:</strong> Puedes generar borradores en minutos y dedicar tu tiempo a editarlos y personalizarlos</li>
</ul>

<h2>Tipos de contenido que funcionan bien</h2>

<ul>
<li><strong>Guias paso a paso:</strong> "Como perder grasa sin perder musculo"</li>
<li><strong>Listas:</strong> "10 ejercicios esenciales para principiantes"</li>
<li><strong>Preguntas frecuentes:</strong> "Todo sobre la creatina: beneficios, dosis y mitos"</li>
<li><strong>Casos de exito:</strong> Transformaciones de clientes, tu propia experiencia</li>
</ul>

<div class="kb-info">
<strong>Consejo de oro:</strong> Escribe para personas, no para algoritmos. Un articulo que genuinamente ayuda al lector siempre posiciona mejor a largo plazo que uno escrito solo para SEO.
</div>
`,
      },
    ],
  },

  /* ================================================================
     GALLERY
     ================================================================ */
  {
    id: "gallery",
    label: "Galeria de imagenes",
    icon: "🖼️",
    description: "Sube y organiza fotos para tu web y blog",
    articles: [
      {
        id: "upload-images",
        title: "Subir imagenes",
        content: `
<h2>Como subir fotos</h2>

<ol>
<li>Abre <strong>Galeria</strong> en el menu lateral</li>
<li>Haz clic en la <strong>zona de subida</strong> (o arrastra las imagenes directamente sobre ella)</li>
<li>Selecciona una o varias imagenes</li>
<li>Las fotos se suben automaticamente y aparecen en la cuadricula</li>
</ol>

<h2>Formatos y limites</h2>

<ul>
<li><strong>Formatos:</strong> JPG, PNG y WebP</li>
<li><strong>Peso maximo:</strong> 5 MB por imagen</li>
<li><strong>Imagenes por subida:</strong> Hasta 10 a la vez</li>
</ul>

<div class="kb-info">
<strong>Recomendacion:</strong> Usa el formato <strong>WebP</strong> siempre que puedas. Pesa un 25-35% menos que JPG con la misma calidad visual, lo que hace que tu web cargue mas rapido. Puedes convertir tus fotos en <a href="https://squoosh.app" target="_blank">squoosh.app</a> (gratis).
</div>

<h2>Texto alternativo (accesibilidad y SEO)</h2>

<p>Cada imagen tiene un campo de <strong>texto alternativo</strong> (alt text) que se genera automaticamente desde el nombre del archivo. Este texto es importante porque:</p>

<ul>
<li><strong>Google lo usa</strong> para entender de que va la imagen (mejora el SEO)</li>
<li><strong>Los lectores de pantalla lo leen</strong> para personas con discapacidad visual</li>
</ul>

<p>Para editarlo, pasa el cursor sobre la imagen y pulsa el boton de edicion.</p>
`,
      },
      {
        id: "manage-gallery",
        title: "Organizar la galeria",
        content: `
<h2>Imagenes destacadas (para la landing)</h2>

<p>Las fotos marcadas como <strong>"Landing"</strong> se muestran en la galeria publica de tu pagina principal. Las demas solo son visibles desde el panel.</p>

<ol>
<li>Pasa el cursor sobre una imagen</li>
<li>Haz clic en el icono de <strong>estrella</strong></li>
<li>La imagen se marca como destacada (aparece la etiqueta "Landing")</li>
<li>Haz clic de nuevo para desmarcarla</li>
</ol>

<h2>Filtrar imagenes</h2>

<ul>
<li><strong>Todas:</strong> Muestra todas las imagenes subidas</li>
<li><strong>En landing:</strong> Solo las marcadas como destacadas</li>
<li><strong>Ocultas:</strong> Las que no estan en la landing (uso interno, portadas de blog, etc.)</li>
</ul>

<h2>Eliminar imagenes</h2>

<ol>
<li>Pasa el cursor sobre la imagen</li>
<li>Haz clic en el icono de <strong>papelera</strong></li>
<li>Confirma la eliminacion</li>
</ol>

<div class="kb-warning">
<strong>Cuidado:</strong> Si eliminas una imagen que esta siendo usada como portada de un articulo del blog, ese articulo perdera su portada. Verifica que la imagen no esta en uso antes de borrarla.
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
    description: "Crea enlaces de reserva y gestiona tu agenda",
    articles: [
      {
        id: "booking-overview",
        title: "Como funciona el sistema",
        content: `
<p>El sistema de reservas permite que tus clientes <strong>agenden citas contigo</strong> de forma automatica, sin necesidad de intercambiar mensajes para cuadrar horarios.</p>

<h2>Asi funciona el flujo completo</h2>

<ol>
<li>Tu creas un <strong>enlace de reserva</strong> para un servicio (ej: <code>tusitio.com/book/consulta</code>)</li>
<li>Compartes ese enlace en Instagram, WhatsApp, tu web, etc.</li>
<li>El cliente abre el enlace y ve un <strong>calendario</strong> con tus dias y horas disponibles</li>
<li>Elige una fecha y hora, rellena sus datos, y confirma</li>
<li>El cliente recibe una <strong>confirmacion por email</strong></li>
<li>Tu recibes una <strong>notificacion</strong> con los datos de la reserva</li>
</ol>

<h2>Los tres componentes del sistema</h2>

<ul>
<li><strong>Enlaces de reserva:</strong> Cada tipo de servicio tiene su propio enlace personalizado</li>
<li><strong>Disponibilidad:</strong> Tu configuracion de dias y horas en los que aceptas reservas</li>
<li><strong>Reservas:</strong> El listado de todas las citas recibidas</li>
</ul>

<div class="kb-info">
<strong>Para que funcione el sistema completo</strong> necesitas: (1) configurar tu disponibilidad, (2) crear al menos un enlace de reserva, y (3) tener Resend configurado para que se envien las confirmaciones.
</div>
`,
      },
      {
        id: "create-booking-link",
        title: "Crear un enlace de reserva",
        content: `
<h2>Paso a paso</h2>

<ol>
<li>Abre <strong>Reservas &gt; Enlaces</strong> en el menu lateral</li>
<li>Haz clic en <strong>"+ Nuevo enlace"</strong></li>
<li>Rellena los campos:
  <ul>
    <li><strong>Slug:</strong> La parte de la URL que identifica el servicio. Ej: <code>consulta</code> genera la URL <code>/book/consulta</code>. Solo letras minusculas, numeros y guiones</li>
    <li><strong>Titulo:</strong> Lo que vera el cliente. Ej: "Consulta de nutricion personalizada"</li>
    <li><strong>Descripcion:</strong> Texto explicativo del servicio (opcional pero recomendado)</li>
    <li><strong>Duracion:</strong> Cuanto dura la cita, en minutos. Ej: 60</li>
    <li><strong>Expiracion:</strong> Fecha limite para reservar. Despues de esa fecha el enlace se desactiva solo (opcional)</li>
  </ul>
</li>
<li>Haz clic en <strong>"Crear"</strong></li>
</ol>

<h2>Acciones disponibles</h2>

<ul>
<li><strong>Copiar enlace:</strong> Copia la URL completa para compartirla donde quieras</li>
<li><strong>Activar / Desactivar:</strong> Pausa un enlace temporalmente sin eliminarlo</li>
<li><strong>Eliminar:</strong> Borra el enlace y todas sus reservas asociadas permanentemente</li>
</ul>

<div class="kb-info">
<strong>Idea practica:</strong> Crea un enlace <code>/book/primera-consulta</code> de 30 minutos para consultas gratuitas iniciales. Ponlo en la bio de tu Instagram y en tu pagina de contacto.
</div>
`,
      },
      {
        id: "availability-setup",
        title: "Configurar tu disponibilidad",
        content: `
<p>La disponibilidad define <strong>en que dias y a que horas</strong> tus clientes pueden reservar contigo. Sin esta configuracion, el calendario aparecera vacio para los clientes.</p>

<h2>Como configurarla</h2>

<ol>
<li>Abre <strong>Reservas &gt; Disponibilidad</strong></li>
<li>Veras una fila por cada dia de la semana (lunes a domingo)</li>
<li>Para cada dia:
  <ul>
    <li>Activa o desactiva el dia con el <strong>interruptor</strong></li>
    <li>Si esta activo, configura la <strong>hora de inicio</strong> y <strong>hora de fin</strong></li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong></li>
</ol>

<h2>Presets rapidos</h2>

<p>Para no configurar dia por dia, usa los botones de preset:</p>

<ul>
<li><strong>Lunes a Viernes (15:00–21:00)</strong> — Tardes entre semana</li>
<li><strong>Fines de semana (10:00–14:00)</strong> — Mananas de sabado y domingo</li>
<li><strong>Todos los dias (09:00–18:00)</strong> — Horario continuo completo</li>
</ul>

<div class="kb-warning">
<strong>Nota:</strong> El mismo horario se aplica a <strong>todos</strong> los enlaces de reserva. Si ofreces servicios con horarios diferentes, configura el horario mas amplio aqui y usa las fechas de expiracion en cada enlace para limitarlos.
</div>

<h2>Que ve el cliente</h2>

<ol>
<li>Al abrir tu enlace de reserva, ve un <strong>calendario</strong></li>
<li>Solo los dias con disponibilidad son seleccionables (los demas aparecen en gris)</li>
<li>Al elegir un dia, ve las <strong>horas libres</strong> (se excluyen las que ya tienen reserva)</li>
<li>Selecciona hora, introduce sus datos, y confirma</li>
</ol>
`,
      },
      {
        id: "manage-bookings",
        title: "Gestionar las reservas",
        content: `
<h2>Ver todas tus reservas</h2>

<ol>
<li>Abre <strong>Reservas &gt; Reservas</strong></li>
<li>Veras la lista con: nombre y email del cliente, servicio, fecha/hora, y estado</li>
</ol>

<h2>Estados de una reserva</h2>

<ul>
<li><strong>Confirmada (CONFIRMED):</strong> Cita pendiente de realizarse</li>
<li><strong>Cancelada (CANCELLED):</strong> La reserva fue cancelada</li>
<li><strong>Completada (COMPLETED):</strong> La cita ya se realizo</li>
</ul>

<h2>Acciones disponibles</h2>

<ul>
<li><strong>Cancelar:</strong> Si necesitas cancelar una cita, cambia su estado a cancelada</li>
<li><strong>Reactivar:</strong> Si cancelaste por error, puedes volver a confirmar la reserva</li>
<li><strong>Eliminar:</strong> Borra la reserva permanentemente de la base de datos</li>
</ul>

<h2>Filtros</h2>

<p>Usa los botones de filtro en la parte superior de la tabla para ver solo reservas de un estado concreto. Muy util cuando tienes muchas reservas acumuladas.</p>

<div class="kb-info">
<strong>Buena practica:</strong> Revisa las reservas del dia siguiente cada noche. Asi puedes prepararte y evitar sorpresas.
</div>
`,
      },
    ],
  },

  /* ================================================================
     LANDING BUILDER
     ================================================================ */
  {
    id: "landing-builder",
    label: "Landing Pages",
    icon: "🏗️",
    description: "Crea paginas profesionales para eventos y servicios",
    articles: [
      {
        id: "landing-overview",
        title: "Que es una landing page",
        content: `
<p>Una <strong>landing page</strong> (pagina de aterrizaje) es una pagina web independiente disenada para un objetivo concreto: vender un servicio, captar registros para un evento, o promocionar una oferta especial.</p>

<h2>Ejemplos de uso</h2>

<ul>
<li><strong>Webinar gratuito:</strong> Pagina de registro con temporizador de cuenta atras</li>
<li><strong>Evento presencial:</strong> Informacion del evento + formulario de inscripcion + precios</li>
<li><strong>Servicio de coaching:</strong> Descripcion del programa + testimonios + planes de precios</li>
<li><strong>Lista de espera:</strong> Formulario simple para captar emails antes de un lanzamiento</li>
</ul>

<h2>Como se construyen</h2>

<p>Las landing pages se construyen apilando <strong>bloques</strong>. Cada bloque es una seccion de contenido (un titulo, una galeria de fotos, un formulario, etc.). Tu eliges que bloques usar y en que orden.</p>

<h2>URLs</h2>

<p>Cada landing tiene su propia URL: <code>tusitio.com/event/nombre-del-evento</code></p>
<p>Solo las paginas con estado <strong>"Publicada"</strong> son accesibles. Las que estan en borrador devuelven un error 404.</p>

<h2>Bloques disponibles (14 tipos)</h2>

<ul>
<li><strong>Hero:</strong> Cabecera con titulo grande, subtitulo y boton de accion</li>
<li><strong>Texto:</strong> Seccion libre de texto con formato HTML</li>
<li><strong>Imagen:</strong> Una imagen con pie de foto</li>
<li><strong>Video:</strong> Inserta un video de YouTube o Vimeo</li>
<li><strong>Galeria:</strong> Cuadricula de varias imagenes</li>
<li><strong>Call to Action (CTA):</strong> Seccion destacada con boton y mensaje persuasivo</li>
<li><strong>Formulario:</strong> Captura datos de los visitantes (nombre, email, telefono, mensaje)</li>
<li><strong>Cuenta regresiva:</strong> Temporizador que cuenta hacia una fecha objetivo</li>
<li><strong>FAQ:</strong> Preguntas frecuentes en formato acordeon</li>
<li><strong>Testimonios:</strong> Citas de clientes con foto, nombre y cargo</li>
<li><strong>Precios:</strong> Planes comparativos con precios y caracteristicas</li>
<li><strong>Estadisticas:</strong> Numeros destacados (ej: "500+ alumnos", "15 anos de experiencia")</li>
<li><strong>Caracteristicas:</strong> Cuadricula de iconos con titulo y descripcion</li>
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
<li>Abre <strong>Eventos &gt; Landing Pages</strong></li>
<li>Haz clic en <strong>"+ Nueva landing page"</strong></li>
<li>Rellena los datos basicos:
  <ul>
    <li><strong>Titulo:</strong> El nombre de tu evento o servicio</li>
    <li><strong>Slug:</strong> La URL (ej: <code>mi-webinar</code> genera <code>/event/mi-webinar</code>)</li>
  </ul>
</li>
<li>Elige una <strong>plantilla</strong> como punto de partida</li>
<li>Haz clic en <strong>"Crear pagina"</strong></li>
</ol>

<h2>Plantillas disponibles</h2>

<ul>
<li><strong>En blanco:</strong> Sin bloques. Para empezar totalmente desde cero</li>
<li><strong>Webinar</strong> (11 bloques) — Hero, estadisticas, caracteristicas del evento, cuenta atras, testimonios, FAQ y formulario de registro</li>
<li><strong>Evento Fitness</strong> (12 bloques) — Orientada a eventos presenciales. Incluye 2 planes de precios (General y VIP)</li>
<li><strong>Coaching</strong> (12 bloques) — Para servicios de coaching online. Incluye 3 planes de precios (Esencial, Premium, Competicion)</li>
</ul>

<div class="kb-info">
<strong>Recomendacion:</strong> Empieza siempre con una plantilla. Es mucho mas rapido editar contenido existente que empezar de cero. Puedes modificar, eliminar o reordenar cualquier bloque despues de crear la pagina.
</div>
`,
      },
      {
        id: "edit-blocks",
        title: "El editor de bloques",
        content: `
<p>Cuando abres una landing page, entras al editor de bloques: una lista vertical de todas las secciones de tu pagina, cada una con una vista previa de su contenido.</p>

<h2>Acciones basicas</h2>

<ul>
<li><strong>Expandir / Colapsar:</strong> Haz clic en cualquier bloque para ver y editar sus campos</li>
<li><strong>Editar:</strong> Modifica textos, URLs, opciones... los cambios se <strong>guardan solos</strong></li>
<li><strong>Reordenar:</strong> Usa las flechas arriba/abajo o <strong>arrastra</strong> el bloque usando el icono de agarre (los 6 puntos)</li>
<li><strong>Duplicar:</strong> Crea una copia del bloque con un clic</li>
<li><strong>Eliminar:</strong> Borra el bloque (pide confirmacion)</li>
</ul>

<h2>Guardado automatico</h2>

<p>El editor guarda <strong>cada cambio automaticamente</strong> mientras escribes. No hay boton de "Guardar" — todo se guarda en tiempo real.</p>

<p>Indicadores visuales:</p>
<ul>
<li><strong>Punto dorado + "Guardando..."</strong> — Se esta procesando tu cambio</li>
<li><strong>Check verde + "Guardado"</strong> — Cambio guardado correctamente</li>
</ul>

<div class="kb-info">
<strong>Simplemente escribe y listo.</strong> No necesitas pulsar ningun boton para guardar. Si cierras la pagina, todos los cambios ya estan guardados.
</div>

<h2>Agregar bloques nuevos</h2>

<ol>
<li>Haz clic en <strong>"+ Agregar bloque"</strong> al final de la lista</li>
<li>Elige el tipo de bloque de las categorias:
  <ul>
    <li><strong>Contenido:</strong> Hero, Texto, Imagen, Video, Galeria</li>
    <li><strong>Conversion:</strong> CTA, Formulario, Precios, Cuenta atras</li>
    <li><strong>Social proof:</strong> Testimonios, Estadisticas, FAQ, Caracteristicas</li>
    <li><strong>Layout:</strong> Separador</li>
  </ul>
</li>
<li>El bloque aparece al final de la pagina y se expande para editarlo</li>
</ol>

<h2>Vista previa</h2>

<p>Pulsa el boton <strong>"Vista previa"</strong> en la barra superior para abrir la pagina en una nueva pestana y ver exactamente como la veran tus visitantes.</p>

<div class="kb-warning">
<strong>Recuerda:</strong> Solo las paginas con estado "Publicada" son visibles para el publico. Mientras este en "Borrador", la vista previa funciona pero la URL publica devuelve error 404.
</div>
`,
      },
      {
        id: "landing-leads",
        title: "Captura de leads",
        content: `
<p>Cada landing page puede incluir un <strong>bloque de formulario</strong> para recoger datos de los visitantes interesados (leads).</p>

<h2>Campos del formulario</h2>

<p>Puedes activar o desactivar cada campo individualmente:</p>

<ul>
<li><strong>Nombre</strong> — Siempre recomendado</li>
<li><strong>Email</strong> — Imprescindible para poder contactar al lead</li>
<li><strong>Telefono</strong> — Util para servicios presenciales o coaching</li>
<li><strong>Mensaje</strong> — Campo de texto libre para que el visitante escriba lo que necesite</li>
</ul>

<h2>Que pasa cuando alguien rellena el formulario</h2>

<ol>
<li>Los datos se guardan como <strong>Lead</strong> asociado a esa landing page especifica</li>
<li>Tambien se guardan como <strong>Contacto</strong> en tu base de datos general</li>
<li>Tu recibes una <strong>notificacion por email</strong> al instante con toda la informacion</li>
</ol>

<h2>Donde ver tus leads</h2>

<ul>
<li><strong>En la tabla de landing pages:</strong> Cada pagina muestra cuantos leads ha recibido</li>
<li><strong>En Contactos:</strong> Todos los leads aparecen centralizados junto con el resto de contactos</li>
</ul>

<div class="kb-info">
<strong>Tip para maximizar conversiones:</strong> Configura el enlace del boton del Hero y los bloques CTA para que apunten a <code>#form</code>. De esta forma, al hacer clic, la pagina hace scroll automaticamente hasta el formulario.
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
    label: "Inteligencia artificial",
    icon: "🤖",
    description: "Genera ideas, articulos e imagenes con IA",
    articles: [
      {
        id: "ai-ideas",
        title: "Generar ideas para el blog",
        content: `
<p>El generador de ideas te ayuda a superar el bloqueo creativo. Le das un tema general y la IA te devuelve multiples ideas de articulos con titulo y descripcion.</p>

<h2>Como usarlo</h2>

<ol>
<li>Abre <strong>Ideas IA</strong> en el menu lateral</li>
<li>En el campo "Nicho o tema", escribe sobre que quieres publicar. Cuanto mas especifico, mejor:
  <ul>
    <li>Bien: <em>"nutricion para ganar masa muscular en ectomorfos"</em></li>
    <li>Bien: <em>"rutinas de entrenamiento en casa sin material"</em></li>
    <li>Demasiado generico: <em>"fitness"</em></li>
  </ul>
</li>
<li>Elige cuantas ideas generar: 3, 5, 7 o 10</li>
<li>Haz clic en <strong>"Generar ideas"</strong></li>
</ol>

<h2>Que recibes por cada idea</h2>

<ul>
<li><strong>Titulo:</strong> Un titulo atractivo listo para publicar</li>
<li><strong>Descripcion:</strong> Resumen de lo que cubriria el articulo</li>
<li><strong>Tags:</strong> Etiquetas relevantes para categorizar</li>
</ul>

<h2>Acciones disponibles</h2>

<ul>
<li><strong>"Crear post":</strong> Abre el editor con el titulo pre-rellenado y la opcion de generar el articulo completo con IA</li>
<li><strong>"Guardar":</strong> Guarda la idea para usarla mas adelante</li>
</ul>

<div class="kb-info">
<strong>Tip:</strong> Genera 10 ideas de golpe, guarda las 3-4 mejores, y crea un post con cada una a lo largo de la semana. Es una forma muy eficiente de planificar tu calendario editorial.
</div>
`,
      },
      {
        id: "ai-articles",
        title: "Generar articulos completos",
        content: `
<p>La IA puede escribir articulos completos en segundos: titulo optimizado, contenido estructurado con encabezados y listas, e incluso una imagen de portada generada automaticamente.</p>

<h2>Como generar un articulo</h2>

<ol>
<li>Crea un <strong>nuevo post</strong> o haz clic en "Crear post" desde una idea generada</li>
<li>En el panel de generacion IA, escribe el tema del articulo</li>
<li>Opcionalmente, agrega <strong>contexto adicional</strong> para mejorar el resultado:
  <ul>
    <li><em>"Enfocado en mujeres principiantes"</em></li>
    <li><em>"Con datos cientificos y referencias"</em></li>
    <li><em>"Incluir un plan de dieta semanal concreto"</em></li>
    <li><em>"Tono cercano e informal, con humor"</em></li>
  </ul>
</li>
<li>Haz clic en <strong>"Generar articulo"</strong></li>
<li>Espera unos segundos mientras la IA trabaja</li>
</ol>

<h2>Que se genera automaticamente</h2>

<ul>
<li><strong>Titulo</strong> optimizado para SEO</li>
<li><strong>Slug</strong> (URL) generado desde el titulo</li>
<li><strong>Contenido completo</strong> con formato HTML: encabezados, listas, negritas, etc.</li>
<li><strong>Imagen de portada</strong> generada con DALL-E (solo con OpenAI, no con Ollama)</li>
</ul>

<div class="kb-warning">
<strong>Importante: siempre revisa el contenido generado.</strong> La IA es una herramienta de asistencia, no un reemplazo. Lee el articulo completo, corrige cualquier dato incorrecto, anade tu experiencia personal, y ajusta el tono. Los mejores articulos combinan la eficiencia de la IA con tu toque personal.
</div>

<h2>Despues de generar</h2>

<ol>
<li>Lee el articulo de principio a fin</li>
<li>Corrige datos que puedan ser incorrectos o desactualizados</li>
<li>Anade anecdotas, opiniones o experiencias tuyas</li>
<li>Ajusta el tono si no coincide con tu estilo</li>
<li>Cambia el estado a <strong>"Publicado"</strong> cuando estes satisfecho</li>
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
    label: "Emails y newsletter",
    icon: "📧",
    description: "Envia newsletters, notificaciones y emails transaccionales",
    articles: [
      {
        id: "email-overview",
        title: "Tipos de email que envia tu panel",
        content: `
<p>Tu panel envia tres tipos de email a traves de <strong>Resend</strong>. Cada uno tiene un proposito diferente:</p>

<h2>1. Emails automaticos (transaccionales)</h2>

<p>Estos se envian <strong>solos</strong> cuando ocurre algo en tu web:</p>
<ul>
<li><strong>Confirmacion de reserva:</strong> El cliente recibe un email cuando agenda una cita contigo</li>
<li><strong>Notificacion de nueva reserva:</strong> Tu recibes un aviso cada vez que alguien reserva</li>
<li><strong>Notificacion de lead:</strong> Recibes un email cuando alguien rellena un formulario de una landing page</li>
</ul>

<h2>2. Newsletter (envios manuales)</h2>

<p>Las campanas de newsletter las envias tu manualmente cuando quieras comunicar algo a tus suscriptores:</p>
<ul>
<li>Promociones de servicios</li>
<li>Contenido exclusivo</li>
<li>Novedades o actualizaciones</li>
<li>Recordatorios de eventos</li>
</ul>

<h2>3. Notificaciones de contacto</h2>

<p>Cuando alguien rellena el formulario de contacto de tu web, recibes una notificacion por email.</p>

<div class="kb-info">
<strong>Requisito para que funcionen los emails:</strong> Necesitas tener la clave API de Resend configurada. Si no la has configurado aun, ve a <strong>Configuracion &gt; Email</strong>.
</div>
`,
      },
      {
        id: "newsletter-campaigns",
        title: "Crear campanas de newsletter",
        content: `
<h2>Como crear y enviar una campana</h2>

<ol>
<li>Abre <strong>Newsletter &gt; Campanas</strong></li>
<li>Haz clic en <strong>"Nueva campana"</strong></li>
<li>Rellena los campos:
  <ul>
    <li><strong>Asunto:</strong> La linea de asunto del email (lo primero que ve el destinatario)</li>
    <li><strong>Contenido:</strong> El cuerpo del email con formato HTML</li>
  </ul>
</li>
<li>Haz clic en <strong>"Guardar"</strong> para guardarlo como borrador</li>
<li>Cuando estes listo, haz clic en <strong>"Enviar"</strong></li>
</ol>

<h2>Buenas practicas</h2>

<ul>
<li><strong>Asunto:</strong> Maximo 50 caracteres. Que sea claro y directo. Evita palabras como "GRATIS", "OFERTA" o "URGENTE" — activan filtros de spam</li>
<li><strong>Contenido:</strong> Ofrece valor real en cada email. Si solo envias promociones, la gente se desuscribira</li>
<li><strong>Frecuencia:</strong> 1–2 emails por semana es lo ideal. Mas de eso puede cansar a tus suscriptores</li>
<li><strong>Desuscripcion:</strong> Se incluye automaticamente un enlace para darse de baja (es obligatorio por ley)</li>
</ul>

<div class="kb-warning">
<strong>Limite del plan gratuito de Resend:</strong> 100 emails/dia y 3,000/mes. Si tienes una lista grande, planifica los envios para no exceder estos limites.
</div>
`,
      },
      {
        id: "manage-subscribers",
        title: "Gestionar suscriptores",
        content: `
<h2>Como se suscriben los usuarios</h2>

<p>Los visitantes de tu web se suscriben a traves del <strong>formulario de newsletter</strong> que aparece en tu pagina publica. Al registrarse:</p>

<ol>
<li>Se guardan automaticamente como suscriptores activos</li>
<li>Aparecen en la lista de suscriptores del panel</li>
<li>Reciben tus campanas de newsletter cuando las envies</li>
</ol>

<h2>Ver y gestionar la lista</h2>

<ol>
<li>Abre <strong>Newsletter &gt; Suscriptores</strong></li>
<li>Veras la lista completa: email, estado (activo/inactivo) y fecha de suscripcion</li>
<li>Puedes activar o desactivar suscriptores individualmente</li>
</ol>

<h2>Desuscripcion</h2>

<p>Los suscriptores pueden darse de baja haciendo clic en el enlace <strong>"Desuscribirse"</strong> al final de cada email. Esto es un <strong>requisito legal</strong> (RGPD) y se incluye automaticamente en todos los emails.</p>

<div class="kb-info">
<strong>Buena practica:</strong> No te preocupes si alguien se desuscribe. Es mejor tener una lista pequena de personas realmente interesadas que una lista grande de gente que ignora tus emails. Los suscriptores desinteresados perjudican tus metricas de entregabilidad.
</div>
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
    description: "Tu base de datos centralizada de clientes y prospectos",
    articles: [
      {
        id: "contacts-overview",
        title: "Como funciona la gestion de contactos",
        content: `
<p>La seccion de <strong>Contactos</strong> centraliza a todas las personas que han interactuado con tu web en un unico lugar, sin importar de donde vengan.</p>

<h2>Como se crean los contactos</h2>

<p>Los contactos se generan <strong>automaticamente</strong> cuando alguien:</p>

<ul>
<li>Rellena el <strong>formulario de contacto</strong> de tu web</li>
<li>Realiza una <strong>reserva</strong> de cualquier servicio</li>
<li>Se registra a traves de un <strong>formulario de landing page</strong></li>
</ul>

<p>No necesitas crear contactos manualmente — el sistema los captura por ti.</p>

<h2>Informacion de cada contacto</h2>

<ul>
<li><strong>Nombre</strong></li>
<li><strong>Email</strong></li>
<li><strong>Telefono</strong> (si lo proporciono)</li>
<li><strong>Mensaje</strong> (si vino de un formulario con campo de texto)</li>
<li><strong>Fuente:</strong> De donde llego (formulario web, reserva, landing page)</li>
<li><strong>Fecha:</strong> Cuando se creo el contacto</li>
</ul>

<h2>Ver los contactos</h2>

<ol>
<li>Abre <strong>Contactos</strong> en el menu lateral</li>
<li>Veras una tabla con todos tus contactos ordenados por fecha</li>
<li>Haz clic en un contacto para ver sus detalles completos</li>
</ol>

<div class="kb-info">
<strong>Sobre los leads de landing pages:</strong> Los leads que llegan por formularios de landing page aparecen tanto en la seccion "Contactos" como asociados a la landing page especifica. Asi puedes verlos centralizados o filtrados por pagina.
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
    description: "Soluciones rapidas a los problemas mas comunes",
    articles: [
      {
        id: "images-not-uploading",
        title: "Las imagenes no se suben",
        content: `
<p>Si intentas subir una imagen y no funciona, revisa estas causas en orden (de mas comun a menos comun):</p>

<h2>1. El archivo es demasiado grande</h2>

<p><strong>Limite:</strong> 5 MB por imagen.</p>
<p><strong>Solucion:</strong> Comprime la imagen sin perder calidad visible. Herramientas gratuitas:</p>
<ul>
<li><a href="https://squoosh.app" target="_blank">Squoosh</a> (de Google, funciona en el navegador)</li>
<li><a href="https://tinypng.com" target="_blank">TinyPNG</a> (acepta JPG y PNG)</li>
</ul>

<h2>2. El formato no es compatible</h2>

<p><strong>Formatos aceptados:</strong> JPG, PNG y WebP.</p>
<p><strong>Solucion:</strong> Si tu imagen es HEIC (iPhone), BMP u otro formato, conviertela a JPG o WebP con <a href="https://cloudconvert.com" target="_blank">CloudConvert</a>.</p>

<h2>3. Problemas de permisos del servidor</h2>

<p><strong>Sintoma:</strong> Las imagenes pequenas tampoco se suben.</p>
<p><strong>Solucion:</strong> Contacta a tu administrador de sistemas para verificar que la carpeta <code>public/uploads/</code> tiene permisos de escritura.</p>

<h2>4. El servidor se quedo sin espacio</h2>

<p><strong>Solucion:</strong> Limpia archivos innecesarios o amplia el almacenamiento de tu VPS.</p>

<div class="kb-info">
<strong>Diagnostico rapido:</strong> Intenta subir una imagen JPG muy pequena (menos de 100 KB). Si esa funciona, el problema es de tamano. Si tampoco funciona, es un problema de servidor.
</div>
`,
      },
      {
        id: "emails-not-sending",
        title: "Los emails no se envian",
        content: `
<p>Si los emails de confirmacion, newsletter o notificaciones no llegan, revisa estas causas:</p>

<h2>1. Clave API de Resend no configurada</h2>

<p><strong>Verificacion:</strong> Abre <strong>Configuracion &gt; Email</strong> y comprueba que hay una clave API guardada.</p>
<p><strong>Solucion:</strong> Si esta vacio, sigue la guia de configuracion de Resend en esta documentacion.</p>

<h2>2. Clave API invalida o expirada</h2>

<p><strong>Solucion:</strong> Ve a <a href="https://resend.com/api-keys" target="_blank">resend.com/api-keys</a>, crea una nueva clave y pegala en la configuracion.</p>

<h2>3. Dominio del remitente no verificado</h2>

<p><strong>Sintoma:</strong> Los emails fallan o van a spam.</p>
<p><strong>Solucion:</strong> Verifica tu dominio en Resend, o usa <code>onboarding@resend.dev</code> como remitente temporal para pruebas.</p>

<h2>4. Has superado el limite de emails</h2>

<p><strong>Limites del plan gratuito:</strong> 100/dia y 3,000/mes.</p>
<p><strong>Solucion:</strong> Espera al dia siguiente, o considera actualizar tu plan en Resend.</p>

<h2>5. Los emails llegan pero van a spam</h2>

<p><strong>Solucion:</strong> Verifica tu dominio en Resend con los registros DNS (SPF, DKIM, DMARC). Esto le dice a los servidores de email que tus mensajes son legitimos y mejora enormemente la entregabilidad.</p>

<div class="kb-info">
<strong>Test rapido:</strong> Envia un email de prueba a tu propio correo desde Configuracion > Email. Si llega, el servicio funciona. Si no llega, revisa las causas anteriores en orden.
</div>
`,
      },
      {
        id: "ai-not-working",
        title: "La IA no genera contenido",
        content: `
<p>Si la generacion de articulos, ideas o imagenes falla, revisa estas causas:</p>

<h2>1. Clave API de OpenAI no configurada</h2>

<p><strong>Verificacion:</strong> Abre <strong>Configuracion &gt; IA</strong> y comprueba que hay una clave API guardada.</p>
<p><strong>Solucion:</strong> Si esta vacio, sigue la guia de configuracion de OpenAI en esta documentacion.</p>

<h2>2. Tu cuenta de OpenAI no tiene saldo</h2>

<p><strong>Solucion:</strong> Ve a <a href="https://platform.openai.com/settings/organization/billing" target="_blank">OpenAI Billing</a> y anade credito. El consumo es minimo (~$0.01 por articulo).</p>

<h2>3. La clave API fue revocada o expiro</h2>

<p><strong>Solucion:</strong> Crea una nueva clave en <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a> y actualizala en Configuracion &gt; IA.</p>

<h2>4. Ollama no esta ejecutandose (IA local)</h2>

<p><strong>Solo si usas IA local:</strong> Abre la terminal y ejecuta:</p>
<div class="kb-code">ollama serve</div>
<p>Verifica que responde en <code>http://localhost:11434</code>.</p>

<h2>5. El modelo de Ollama no esta descargado</h2>

<p><strong>Solucion:</strong> Descarga el modelo con:</p>
<div class="kb-code">ollama pull nombre-del-modelo</div>

<h2>6. El contenido generado es de baja calidad</h2>

<p>Si la IA genera contenido pero no es bueno, prueba estas mejoras:</p>
<ul>
<li>Mejora tu <strong>System Prompt</strong> en Configuracion &gt; IA (cuanto mas especifico, mejor)</li>
<li>Cambia a un <strong>modelo superior</strong> (gpt-4o o gpt-4.1 en vez de mini)</li>
<li>Agrega <strong>contexto adicional</strong> cada vez que generes un articulo</li>
</ul>
`,
      },
      {
        id: "booking-issues",
        title: "Problemas con las reservas",
        content: `
<h2>1. Los clientes no ven fechas disponibles</h2>

<p><strong>Causa mas comun:</strong> No has configurado tu disponibilidad.</p>
<p><strong>Solucion:</strong> Abre <strong>Reservas &gt; Disponibilidad</strong> y configura en que dias y horas aceptas citas. Sin disponibilidad, el calendario aparece totalmente en gris.</p>

<h2>2. El enlace de reserva no funciona</h2>

<p>Posibles causas:</p>
<ul>
<li><strong>Enlace desactivado:</strong> Verifica su estado en Reservas &gt; Enlaces</li>
<li><strong>Enlace expirado:</strong> Si le pusiste fecha de expiracion, puede haber pasado</li>
<li><strong>URL incorrecta:</strong> Comprueba que el slug coincide con el que creaste</li>
</ul>

<h2>3. No recibo notificaciones de nuevas reservas</h2>

<p><strong>Solucion:</strong></p>
<ul>
<li>Verifica que Resend esta bien configurado en <strong>Configuracion &gt; Email</strong></li>
<li>Comprueba que el "email de contacto" es correcto</li>
<li>Revisa la carpeta de spam de tu correo</li>
</ul>

<h2>4. El cliente no recibe la confirmacion</h2>

<p>Mismo problema que los emails no enviados. Revisa la configuracion de Resend y verifica que tu dominio esta correctamente configurado.</p>

<div class="kb-info">
<strong>El sistema previene dobles reservas automaticamente.</strong> Si dos personas intentan reservar el mismo horario, el segundo recibira un mensaje de error y vera las horas actualizadas.
</div>
`,
      },
      {
        id: "general-issues",
        title: "Otros problemas comunes",
        content: `
<h2>La pagina carga muy lento</h2>

<ul>
<li>Comprueba tu conexion a internet (prueba abriendo otras webs)</li>
<li>Limpia la cache del navegador: <code>Ctrl + Shift + Delete</code> (o <code>Cmd + Shift + Delete</code> en Mac)</li>
<li>Si el servidor esta lento, puede necesitar mas recursos (RAM/CPU)</li>
</ul>

<h2>Los cambios no aparecen en la web</h2>

<ul>
<li>Espera 10-30 segundos y recarga la pagina con <code>Ctrl + F5</code></li>
<li>Limpia la cache del navegador</li>
<li>Prueba en una ventana de incognito para descartar problemas de cache</li>
</ul>

<h2>No puedo iniciar sesion</h2>

<ul>
<li>Verifica que tu email y contrasena son correctos (ojo con mayusculas/minusculas)</li>
<li>Limpia las cookies del navegador</li>
<li>Prueba en un navegador diferente</li>
</ul>

<h2>Algo se ve mal en el movil</h2>

<ul>
<li>Todo el panel esta disenado para funcionar en movil</li>
<li>Prueba a rotar el dispositivo (horizontal/vertical)</li>
<li>Si persiste, cierra y vuelve a abrir el navegador</li>
</ul>

<div class="kb-info">
<strong>Si nada funciona:</strong> Haz una captura de pantalla del problema, anota que estabas haciendo en ese momento, y contacta con soporte tecnico. Cuanta mas informacion proporciones, mas rapido se podra resolver.
</div>
`,
      },
    ],
  },
];
