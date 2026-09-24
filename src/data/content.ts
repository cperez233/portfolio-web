/**
 * Todo el texto visible del sitio, en los dos idiomas.
 *
 * Lo que NO vive aqui: URLs, imagenes y nombres de tecnologias. Los
 * nombres propios (Laravel, Docker, n8n) no se traducen, asi que se
 * quedan en site.ts junto al resto de datos independientes del idioma.
 */

import type { DiagramId } from "./diagrams";

export type Language = "en" | "es";

/** Textos de un diagrama tecnico (la estructura vive en diagrams.ts). */
export interface DiagramCopy {
  /** Insignia de estado de la barra de la ventana. */
  status: string;
  /** Por clave de nodo. */
  nodes?: Record<string, { title: string; detail?: string }>;
  /** Etiqueta de cada tramo entre columnas, en orden. */
  links?: string[];
  /** Salida del terminal, en el orden de las lineas `output`. */
  log?: string[];
}

export interface Dictionary {
  /**
   * Title y description de la version de este idioma. Los usa el
   * servidor (metadata de cada layout) y el toggle, que al cambiar de
   * idioma sin recargar actualiza tambien document.title.
   */
  meta: { title: string; description: string; ogLocale: string };
  nav: { about: string; services: string; projects: string; contact: string };
  hero: {
    tagline: string;
    description: string;
    badgeAvailability: string;
    badgeLocation: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollLabel: string;
    /** Enlaces directos bajo los CTA. */
    links: { github: string; cv: string; email: string };
  };
  about: {
    eyebrow: string;
    title: string;
    blocks: Array<{ eyebrow: string; title: string; body: string }>;
    highlights: Array<{ label: string; detail: string }>;
  };
  services: {
    eyebrow: string;
    title: string;
    /** Un bloque por servicio, en el orden de `menuItems`. */
    items: Array<{ name: string; tag: string; description: string }>;
  };
  projects: {
    eyebrow: string;
    title: string;
    /** Formato case study: problema, solucion tecnica e impacto. */
    labels: { context: string; solution: string; impact: string };
    /** CTA de las tarjetas que enlazan a su repositorio. */
    repoCta: string;
    /** Por proyecto, en el orden de `projects`. */
    items: Array<{
      /** Titulo completo de la tarjeta; se traduce salvo nombres propios. */
      name: string;
      category: string;
      tagline: string;
      context: string;
      solution: string;
      impact: string;
      /** CTA de respaldo (WhatsApp) cuando el proyecto no tiene repoUrl. */
      cta: string;
      /** Micro-datos de impacto. Opcional: en 01 y 02 ya lo cuenta el stack. */
      metrics?: string[];
      /** Pies de las capturas, solo en proyectos con visual `gallery`. */
      showcase?: [string, string, string];
      /** Insignia de estado del panel de la galeria. */
      panelStatus?: string;
    }>;
  };
  footer: {
    eyebrow: string;
    headline: string;
    /** Linea de disponibilidad en clave comercial. */
    availability: string;
    cta: string;
    groups: { navigation: string; professional: string; community: string; contact: string };
    links: { home: string; about: string; services: string; projects: string; email: string };
    rights: string;
  };
  languageToggle: { label: string };
  /** Mensaje que se abre ya escrito en WhatsApp. */
  whatsappMessage: string;
  diagrams: Record<DiagramId, DiagramCopy>;
  miniProjects: {
    eyebrow: string;
    title: string;
    hint: string;
    /** Aviso para lector de pantalla en los enlaces externos. */
    newTab: string;
    /** Inicio del alt de cada captura: "<imageAlt> <nombre del sitio>". */
    imageAlt: string;
    /** Una linea por sitio, en el orden de `miniProjects`. */
    items: string[];
  };
}

const en: Dictionary = {
  meta: {
    title: "Cristian Pérez | Full-Stack Developer & Automation, Colombia",
    description:
      "Freelance full-stack developer in Bucaramanga, Colombia. Web apps, workflow automation and AI document extraction for small teams, plus video that sells them.",
    ogLocale: "en_US",
  },
  nav: {
    about: "About",
    services: "Services",
    projects: "Projects",
    contact: "Contact",
  },
  hero: {
    tagline: "Software that runs your business, and video that sells it.",
    description:
      "I design, build and explain the systems small teams depend on. Without the jargon.",
    badgeAvailability: "Available for contracts & consulting",
    badgeLocation: "Remote / Bucaramanga, Colombia",
    ctaPrimary: "Let's Talk on WhatsApp",
    ctaSecondary: "Explore Projects & Work",
    scrollLabel: "Scroll to about",
    links: { github: "GitHub", cv: "Download CV", email: "Email" },
  },
  about: {
    eyebrow: "[ 01 ] About",
    title: "About me",
    blocks: [
      {
        eyebrow: "01",
        title: "Engineering & Systems",
        body: "I build complete systems, start to finish. I don't marry one technology: I pick whatever fits the problem in front of me. And after working in cybersecurity, I check where the data goes before anything else.",
      },
      {
        eyebrow: "02",
        title: "Communication & Video",
        body: "I also write, present and edit video, which built an audience of 32K+ followers. The skill that keeps a stream watchable is the same one that makes a sales pitch land.",
      },
    ],
    highlights: [
      { label: "Tool-Agnostic", detail: "The right stack per problem, not per habit" },
      { label: "Security Mindset", detail: "Data flow auditing, input integrity" },
      { label: "Content & Streaming", detail: "TikTok / Instagram / Twitch" },
      { label: "GEO, SEO & AEO", detail: "Built to rank on Google and get cited by AI" },
    ],
  },
  services: {
    eyebrow: "[ 02 ]",
    title: "Services",
    items: [
      {
        name: "Full-Stack Web & Software Applications",
        tag: "LARAVEL / REACT / NEXT.JS / POSTGRESQL / DOCKER / PYTHON",
        description:
          "Web platforms, custom applications and the software your operation runs on, built from scratch: the database, the logic and the screens your team uses every day. Clean code and infrastructure ready to scale with the business.",
      },
      {
        name: "Workflow Automation & Integration",
        tag: "N8N / PYTHON / WEBHOOKS / APIS",
        description:
          "Your tools finally talk to each other, and repetitive tasks disappear. Automated pipelines that save dozens of hours and remove the errors of copying data by hand.",
      },
      {
        name: "Document AI & Data Extraction",
        tag: "AZURE DOC INTELLIGENCE / OCR / LLMS / PYTHON",
        description:
          "PDFs, records and paper documents turned into structured data you can search in seconds. Secure OCR and AI do the reading, so nobody transcribes by hand.",
      },
      {
        name: "Business & Technical Advisory",
        tag: "SALES FUNNEL TECH / PROCESS AUDIT / SECURITY & DATA",
        description:
          "An audit of your sales funnel, operations and technical security. A clear report on where revenue leaks, what slows you down and which data is at risk, with what to fix first.",
      },
      {
        name: "Technical Video & Product Storytelling",
        tag: "HIGH-RETENTION EDITING / SCRIPTING / STREAMING",
        description:
          "Technical products turned into high-retention video people get in thirty seconds. Strategic scripts and dynamic editing built to earn trust and close sales.",
      },
    ],
  },
  projects: {
    eyebrow: "[ 03 ]",
    title: "Projects",
    labels: {
      context: "Problem",
      solution: "Technical solution",
      impact: "Impact",
    },
    repoCta: "View on GitHub",
    items: [
      {
        name: "PairSync: Real-Time AI Pair Programming Platform",
        category: "Full-Stack + AI",
        tagline:
          "Collaborative coding rooms with an AI tutor and grades synced to Moodle.",
        context:
          "Two people coding together lose time re-explaining where they left off, and grading happens somewhere else.",
        solution:
          "Rooms joined with a 6-character code, swappable Driver/Navigator roles, a streaming AI tutor in the chat, and one-click grade sync to Moodle.",
        impact:
          "Pairs pick up exactly where they stopped, and the teacher grades without leaving the app.",
        cta: "Explore Project",
      },
      {
        name: "Automated Document OCR & Security Pipeline",
        category: "Cybersecurity Internship · FCV",
        tagline:
          "Ingestion, extraction and normalization pipeline for scanned institutional records.",
        context:
          "Hundreds of manual hours spent looking up physical records, with weak traceability.",
        solution:
          "Structured data extraction with Azure Document Intelligence, Python automation and data-integrity validation.",
        impact:
          "746 records searchable by ID, name or site, with low-confidence reads flagged for human review instead of silently accepted.",
        cta: "View Case",
      },
      {
        name: "Content Creation & Media Pipeline",
        category: "Digital Media & B2B Communication",
        tagline: "Tostu / criscx1905",
        context:
          "Good products lose sales in the explanation. The buyer never sees why it matters.",
        solution:
          "I write, present and edit the whole thing myself. It built an audience of 32K+ followers.",
        impact:
          "The same works for clients: demos and pitch videos anyone can follow, technical or not.",
        cta: "View Case",
        panelStatus: "live",
        metrics: [
          "+2M Organic Impressions",
          "High-Retention Pacing",
          "Multistream Production",
          "End-to-End Delivery",
        ],
        showcase: [
          "02. Community Growth & Organic Reach (32K+ Followers, 2M+ Likes)",
          "03. Live Broadcasting Architecture (OBS Multistream Setup)",
          "01. High-Retention Vertical Editing (After Effects Pipeline)",
        ],
      },
    ],
  },
  footer: {
    eyebrow: "[ Contact ]",
    headline: "Let's build something that ships.",
    availability:
      "Available for engineering contracts, automation systems, and high-impact digital consulting.",
    cta: "Start a conversation",
    groups: {
      navigation: "Navigation",
      professional: "Professional",
      community: "Content & Community",
      contact: "Direct Contact",
    },
    links: {
      home: "Home",
      about: "About",
      services: "Services",
      projects: "Projects",
      email: "Email",
    },
    rights: "All rights reserved.",
  },
  languageToggle: { label: "Change language" },
  whatsappMessage:
    "Hi Cristian, I saw your portfolio and I would like to talk about a project.",
  diagrams: {
    pairsync: {
      status: "running",
      nodes: {
        client: { title: "Browser", detail: "Blade + JS · Driver / Navigator" },
        laravel: { title: "Laravel 12", detail: "Rooms, roles, chat, grades" },
        langgraph: { title: "LangGraph", detail: "AI tutor · SSE stream" },
        moodle: { title: "Moodle", detail: "REST API · grade sync" },
        database: { title: "SQLite", detail: "Session state & chat history" },
      },
      links: ["Polling · 2s", "REST · SSE"],
    },
    fcv: {
      status: "done",
      nodes: {
        scans: { title: "Scanned records", detail: "Handwritten, multi-page PDFs" },
        azure: {
          title: "Azure Document Intelligence",
          detail: "OCR · handwriting + tables",
        },
        python: { title: "Python pipeline", detail: "Normalize · validate · flag" },
        index: { title: "Searchable index", detail: "Excel + offline search tool" },
      },
      links: ["one PDF per page", "structured fields", "reviewed rows"],
      log: [
        "Multi-page scans split into one PDF per page",
        "746 records indexed by ID, name and site",
        "Low-confidence reads flagged for human review",
        "Search tool in sync with the reviewed Excel",
      ],
    },
    "svc-fullstack": {
      status: "200 OK",
      nodes: {
        ui: { title: "Interface", detail: "React · Next.js" },
        api: { title: "API", detail: "Laravel · Python" },
        database: { title: "Database", detail: "PostgreSQL" },
      },
    },
    "svc-automation": {
      status: "synced",
      nodes: {
        webhook: { title: "Webhook", detail: "Event in" },
        n8n: { title: "n8n", detail: "Workflow" },
        python: { title: "Python", detail: "Transform" },
        apis: { title: "APIs", detail: "CRM · Sheets · email" },
      },
    },
    "svc-docai": {
      status: "extracting",
      nodes: {
        scans: { title: "PDFs & scans", detail: "Paper, forms" },
        ocr: { title: "OCR", detail: "Azure Doc Intelligence" },
        llm: { title: "LLM", detail: "Structures & validates" },
        search: { title: "Search", detail: "Seconds, not hours" },
      },
    },
    "svc-audit": {
      status: "2 findings",
      log: [
        "Funnel mapped from first click to paid invoice",
        "Leads lost between the web form and the CRM",
        "Customer data shared in a public spreadsheet",
        "Report ready · fixes ranked by revenue and risk",
      ],
    },
    "svc-media": {
      status: "rendering",
      nodes: {
        script: { title: "Script", detail: "Hook in 3 s" },
        record: { title: "Record", detail: "Multicam · OBS" },
        edit: { title: "Edit", detail: "High-retention pacing" },
        publish: { title: "Publish", detail: "Vertical + widescreen" },
      },
    },
  },
  miniProjects: {
    eyebrow: "Recent work",
    title: "Websites already live",
    hint: "Tap any of them to visit it.",
    newTab: "(opens in a new tab)",
    imageAlt: "Website built for",
    items: [
      "Hotel in Santa Marta · bookings over WhatsApp",
      "Footwear factory · wholesale catalogue",
      "Baby store · nationwide delivery",
      "Online shoe store",
      "Dog grooming · appointments over WhatsApp",
      "Liquor store · 24/7 delivery in Floridablanca",
    ],
  },
};

const es: Dictionary = {
  meta: {
    title: "Páginas web y software en Bucaramanga | Cristian Pérez",
    description:
      "Desarrollo páginas web, software a la medida y automatizaciones para negocios en Bucaramanga y toda Colombia. Mira sitios ya publicados y cotiza por WhatsApp.",
    ogLocale: "es_CO",
  },
  nav: {
    about: "Sobre mí",
    services: "Servicios",
    projects: "Proyectos",
    contact: "Contacto",
  },
  hero: {
    tagline: "Software que hace funcionar tu negocio, y video que lo vende.",
    description:
      "Diseño, construyo y explico los sistemas de los que depende un equipo pequeño. Sin jerga.",
    badgeAvailability: "Disponible para contratos y consultoría",
    badgeLocation: "Remoto / Bucaramanga, Colombia",
    ctaPrimary: "Hablemos por WhatsApp",
    ctaSecondary: "Ver proyectos y trabajo",
    scrollLabel: "Ir a sobre mí",
    links: { github: "GitHub", cv: "Descargar CV", email: "Correo" },
  },
  about: {
    eyebrow: "[ 01 ] Sobre mí",
    title: "Sobre mí",
    blocks: [
      {
        eyebrow: "01",
        title: "Ingeniería y sistemas",
        body: "Construyo sistemas completos, de principio a fin. No me caso con una tecnología: elijo la que le sirve al problema que tengo delante. Y después de trabajar en ciberseguridad, lo primero que reviso es por dónde pasan los datos.",
      },
      {
        eyebrow: "02",
        title: "Comunicación y video",
        body: "También escribo, presento y edito video, y así construí una audiencia de 32K+ seguidores. La habilidad que hace que alguien se quede viendo un directo es la que hace que una propuesta convenza.",
      },
    ],
    highlights: [
      { label: "Agnóstico a herramientas", detail: "El stack que pide el problema, no la costumbre" },
      { label: "Mentalidad de seguridad", detail: "Auditoría de flujos, integridad de datos" },
      { label: "Contenido y streaming", detail: "TikTok / Instagram / Twitch" },
      { label: "GEO, SEO y AEO", detail: "Pensado para posicionar en Google y ser citado por la IA" },
    ],
  },
  services: {
    eyebrow: "[ 02 ]",
    title: "Servicios",
    items: [
      {
        name: "Aplicaciones web y software full-stack",
        tag: "LARAVEL / REACT / NEXT.JS / POSTGRESQL / DOCKER / PYTHON",
        description:
          "Plataformas web, aplicaciones a medida y el software con el que opera tu negocio, desde cero: la base de datos, la lógica y las pantallas que tu equipo usa a diario. Código limpio e infraestructura lista para escalar la operación.",
      },
      {
        name: "Automatización e integración de flujos",
        tag: "N8N / PYTHON / WEBHOOKS / APIS",
        description:
          "Tus herramientas por fin se hablan entre ellas y las tareas repetitivas desaparecen. Pipelines automáticos que ahorran decenas de horas sin errores de copiar datos a mano.",
      },
      {
        name: "IA documental y extracción de datos",
        tag: "AZURE DOC INTELLIGENCE / OCR / LLMS / PYTHON",
        description:
          "PDFs, actas y documentos físicos convertidos en datos estructurados que se buscan al instante. OCR seguro e IA hacen la lectura, sin transcripción manual.",
      },
      {
        name: "Asesoría técnica y de negocio",
        tag: "EMBUDOS DE VENTA / AUDITORÍA DE PROCESOS / SEGURIDAD Y DATOS",
        description:
          "Auditoría de tu embudo de ventas, tus procesos y tu seguridad técnica. Un informe claro de dónde se pierden ingresos, dónde se frena todo y qué datos están en riesgo, con lo primero que hay que arreglar.",
      },
      {
        name: "Video técnico y storytelling de producto",
        tag: "EDICIÓN DE ALTA RETENCIÓN / GUION / STREAMING",
        description:
          "Productos técnicos convertidos en video de alta retención que se entiende en treinta segundos. Guion estratégico y edición dinámica pensados para generar confianza y cerrar ventas.",
      },
    ],
  },
  projects: {
    eyebrow: "[ 03 ]",
    title: "Proyectos",
    labels: {
      context: "Problema",
      solution: "Solución técnica",
      impact: "Impacto",
    },
    repoCta: "Ver en GitHub",
    items: [
      {
        name: "PairSync: Plataforma de pair programming con IA en tiempo real",
        category: "Desarrollo Full-Stack + IA",
        tagline:
          "Salas de código colaborativas con tutor de IA y notas sincronizadas con Moodle.",
        context:
          "Dos personas programando juntas pierden tiempo reexplicando dónde se quedaron, y la calificación pasa en otra herramienta.",
        solution:
          "Salas con código de 6 caracteres, roles Driver/Navigator intercambiables, un tutor de IA con respuesta en streaming en el chat y notas enviadas a Moodle con un clic.",
        impact:
          "La pareja retoma justo donde paró, y el profesor califica sin salir de la aplicación.",
        cta: "Explorar Proyecto",
      },
      {
        name: "Pipeline automatizado de OCR y seguridad documental",
        category: "Prácticas en ciberseguridad · FCV",
        tagline:
          "Pipeline de ingesta, extracción y normalización de registros institucionales escaneados.",
        context:
          "Cientos de horas manuales invertidas en consultar actas físicas y riesgo en trazabilidad.",
        solution:
          "Extracción analítica de datos estructurados con Azure Document Intelligence, automatización en Python y validación de integridad de datos.",
        impact:
          "746 actas buscables por cédula, nombre o sede, y las lecturas dudosas se marcan para revisión humana en vez de aceptarse en silencio.",
        cta: "Ver Caso",
      },
      {
        name: "Creación de Contenido y Cadena de Producción",
        category: "Medios Digitales y Comunicación B2B",
        tagline: "Tostu / criscx1905",
        context:
          "Los buenos productos pierden ventas en la explicación. El cliente nunca ve por qué le sirve.",
        solution:
          "Escribo, presento y edito todo yo. Así construí una audiencia de 32K+ seguidores.",
        impact:
          "Lo mismo sirve para clientes: demos y videos que entiende cualquiera, sea técnico o no.",
        cta: "Ver Caso",
        panelStatus: "en vivo",
        metrics: [
          "+2M impresiones orgánicas",
          "Ritmo de alta retención",
          "Producción multistream",
          "Entrega de principio a fin",
        ],
        showcase: [
          "02. Crecimiento de comunidad y alcance orgánico (32K+ seguidores, 2M+ likes)",
          "03. Arquitectura de directo (montaje multistream con OBS)",
          "01. Edición vertical de alta retención (pipeline en After Effects)",
        ],
      },
    ],
  },
  footer: {
    eyebrow: "[ Contacto ]",
    headline: "Construyamos algo que salga a producción.",
    availability:
      "Disponible para consultoría, desarrollo de software y producción digital enfocada en resultados.",
    cta: "Iniciar una conversación",
    groups: {
      navigation: "Navegación",
      professional: "Profesional",
      community: "Contenido y comunidad",
      contact: "Contacto directo",
    },
    links: {
      home: "Inicio",
      about: "Sobre mí",
      services: "Servicios",
      projects: "Proyectos",
      email: "Correo",
    },
    rights: "Todos los derechos reservados.",
  },
  languageToggle: { label: "Cambiar idioma" },
  whatsappMessage:
    "Hola Cristian, vi tu portafolio y me gustaría hablar de un proyecto.",
  diagrams: {
    pairsync: {
      status: "activo",
      nodes: {
        client: { title: "Navegador", detail: "Blade + JS · Driver / Navigator" },
        laravel: { title: "Laravel 12", detail: "Salas, roles, chat, notas" },
        langgraph: { title: "LangGraph", detail: "Tutor IA · stream SSE" },
        moodle: { title: "Moodle", detail: "API REST · sincroniza notas" },
        database: { title: "SQLite", detail: "Estado de sesión e historial" },
      },
      links: ["Polling · 2s", "REST · SSE"],
    },
    fcv: {
      status: "completado",
      nodes: {
        scans: { title: "Actas escaneadas", detail: "PDF manuscritos de varias páginas" },
        azure: {
          title: "Azure Document Intelligence",
          detail: "OCR · manuscrito + tablas",
        },
        python: { title: "Pipeline en Python", detail: "Normaliza · valida · marca" },
        index: { title: "Índice buscable", detail: "Excel + buscador sin servidor" },
      },
      links: ["un PDF por página", "campos estructurados", "filas revisadas"],
      log: [
        "Escaneos divididos en un PDF por página",
        "746 actas indexadas por cédula, nombre y sede",
        "Lecturas dudosas marcadas para revisión humana",
        "Buscador sincronizado con el Excel revisado",
      ],
    },
    "svc-fullstack": {
      status: "200 OK",
      nodes: {
        ui: { title: "Interfaz", detail: "React · Next.js" },
        api: { title: "API", detail: "Laravel · Python" },
        database: { title: "Base de datos", detail: "PostgreSQL" },
      },
    },
    "svc-automation": {
      status: "sincronizado",
      nodes: {
        webhook: { title: "Webhook", detail: "Entra un evento" },
        n8n: { title: "n8n", detail: "Flujo" },
        python: { title: "Python", detail: "Transforma" },
        apis: { title: "APIs", detail: "CRM · Sheets · correo" },
      },
    },
    "svc-docai": {
      status: "extrayendo",
      nodes: {
        scans: { title: "PDFs y escaneos", detail: "Papel, formularios" },
        ocr: { title: "OCR", detail: "Azure Doc Intelligence" },
        llm: { title: "LLM", detail: "Estructura y valida" },
        search: { title: "Búsqueda", detail: "Segundos, no horas" },
      },
    },
    "svc-audit": {
      status: "2 hallazgos",
      log: [
        "Embudo trazado del primer clic a la factura pagada",
        "Leads perdidos entre el formulario web y el CRM",
        "Datos de clientes en una hoja de cálculo pública",
        "Informe listo · arreglos ordenados por ingresos y riesgo",
      ],
    },
    "svc-media": {
      status: "renderizando",
      nodes: {
        script: { title: "Guion", detail: "Gancho en 3 s" },
        record: { title: "Grabación", detail: "Multicámara · OBS" },
        edit: { title: "Edición", detail: "Ritmo de alta retención" },
        publish: { title: "Publicación", detail: "Vertical + horizontal" },
      },
    },
  },
  miniProjects: {
    eyebrow: "Trabajo reciente",
    title: "Páginas web ya publicadas",
    hint: "Toca cualquiera para visitarla.",
    newTab: "(se abre en otra pestaña)",
    imageAlt: "Página web de",
    items: [
      "Hotel en Santa Marta · reservas por WhatsApp",
      "Fábrica de calzado · catálogo mayorista",
      "Tienda de bebés · envíos a todo el país",
      "Tienda online de calzado",
      "Peluquería canina · citas por WhatsApp",
      "Licorera · domicilio 24/7 en Floridablanca",
    ],
  },
};

export const dictionaries: Record<Language, Dictionary> = { en, es };
