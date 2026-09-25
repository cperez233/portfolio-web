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
    /**
     * Cada bloque lleva sus rasgos debajo. Antes iban en una lista suelta
     * al final de la seccion y no se sabia a que texto respondian.
     */
    blocks: Array<{
      title: string;
      body: string;
      traits: Array<{ label: string; detail: string }>;
    }>;
    /**
     * Datos de la columna lateral. Solo el texto: los valores salen de
     * datos reales (about.tsx), no se escriben a mano.
     */
    facts: {
      sites: string;
      audience: string;
      languages: string;
      /** Enlace del dato de sitios a la seccion de trabajo reciente. */
      sitesLink: string;
    };
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
    /** Una linea bajo el titulo: que va a encontrar quien lee. */
    intro: string;
    labels: { problem: string; solution: string; result: string };
    /** Enlaces del pie de cada caso. */
    liveCta: string;
    repoCta: string;
    /** CTA a WhatsApp del caso: pedir algo parecido. */
    askCta: string;
    /** Enlace al resto de sitios (#sites). `{n}` es el numero de sitios. */
    moreSites: string;
    /** Pie de la seccion con el proyecto tecnico que no va como caso. */
    moreWork: { lead: string; name: string; detail: string };
    /** Por caso, en el orden de `cases` (site.ts). */
    items: Array<{
      client: string;
      category: string;
      title: string;
      problem: string;
      solution: string;
      result: string;
      /** Texto bajo la cifra, en casos con `stat`. */
      statLabel?: string;
      /** Texto alternativo de cada captura, en el orden de las capturas. */
      shotAlts: string[];
    }>;
  };
  footer: {
    eyebrow: string;
    headline: string;
    /** Linea de disponibilidad en clave comercial. */
    availability: string;
    cta: string;
    groups: { navigation: string; social: string; contact: string };
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
    badgeAvailability: "Open to new projects",
    badgeLocation: "Bucaramanga, Colombia · remote",
    ctaPrimary: "Let's Talk on WhatsApp",
    ctaSecondary: "Explore Projects & Work",
    scrollLabel: "Scroll to about",
    links: { github: "GitHub", cv: "Download CV", email: "Email" },
  },
  about: {
    eyebrow: "Who's behind it",
    title: "About me",
    blocks: [
      {
        title: "Engineering & Systems",
        body: "I build complete systems, start to finish. I don't marry one technology: I pick whatever fits the problem in front of me. And after working in cybersecurity, I check where the data goes before anything else.",
        traits: [
          { label: "Tool-Agnostic", detail: "The right stack per problem, not per habit" },
          { label: "Security Mindset", detail: "Data flow auditing, input integrity" },
        ],
      },
      {
        title: "Communication & Video",
        body: "I also write, present and edit video, which built an audience of 32K+ followers. The skill that keeps a stream watchable is the same one that makes a sales pitch land.",
        traits: [
          { label: "Content & Streaming", detail: "TikTok / Instagram / Twitch" },
        ],
      },
    ],
    facts: {
      sites: "websites live for businesses in Colombia",
      audience: "followers built with my own content",
      languages: "I work in Spanish and English",
      sitesLink: "See them",
    },
  },
  services: {
    eyebrow: "What I build",
    title: "Services",
    items: [
      {
        name: "Full-Stack Web & Software Applications",
        tag: "Laravel / React / Next.js / PostgreSQL / Docker / Python",
        description:
          "Web platforms, custom applications and the software your operation runs on, built from scratch: the database, the logic and the screens your team uses every day.",
      },
      {
        name: "SEO, GEO & AEO for Google and AI",
        tag: "Technical SEO / Schema.org / Local SEO / AI answers",
        description:
          "Your business showing up when someone searches Google and when they ask ChatGPT, Perplexity or AI Overviews. Clean structure, schema markup, local SEO and content written to be quoted, measured in Search Console.",
      },
      {
        name: "Workflow Automation & Integration",
        tag: "n8n / Python / Webhooks / APIs",
        description:
          "Your tools finally talk to each other, and repetitive tasks disappear. Automated pipelines that save dozens of hours and remove the errors of copying data by hand.",
      },
      {
        name: "Document AI & Data Extraction",
        tag: "Azure Doc Intelligence / OCR / LLMs / Python",
        description:
          "PDFs, records and paper documents turned into structured data you can search in seconds. Secure OCR and AI do the reading, so nobody transcribes by hand.",
      },
      {
        name: "Business & Technical Advisory",
        tag: "Sales funnel / Process audit / Security & data",
        description:
          "An audit of your sales funnel, operations and technical security. A clear report on where revenue leaks, what slows you down and which data is at risk, with what to fix first.",
      },
      {
        name: "Technical Video & Product Storytelling",
        tag: "High-retention editing / Scripting / Streaming",
        description:
          "Technical products turned into high-retention video people get in thirty seconds. Strategic scripts and dynamic editing built to earn trust and close sales.",
      },
    ],
  },
  projects: {
    eyebrow: "Real cases",
    title: "Projects",
    intro: "What each business needed, what I built, and what changed.",
    labels: { problem: "The problem", solution: "What I built", result: "Result" },
    liveCta: "Visit the site",
    repoCta: "Code on GitHub",
    askCta: "I want something like this",
    moreSites: "Plus {n} websites live for businesses",
    moreWork: {
      lead: "More on GitHub:",
      name: "PairSync",
      detail: "pair programming platform with an AI tutor",
    },
    items: [
      {
        client: "Master Service Quality",
        category: "Website · vehicle rental",
        title: "Trucks you can quote from your phone",
        problem:
          "A company that rents pickups and SUVs by the month to contractors in Barrancabermeja needed clients to see vehicles, prices and what's included without calling.",
        solution:
          "A mobile-first site: every truck with its monthly rate, what the price covers and what it doesn't, and a WhatsApp quote with the chosen vehicle already in the message. Plus local SEO and GEO, so it shows up on Google and in AI answers when someone looks for truck rental in Barrancabermeja.",
        result:
          "The client picks a truck and quotes it in two taps, with the price already on screen.",
        shotAlts: [
          "Master Service Quality homepage on a phone",
          "Trucks with monthly rates",
          "What the monthly rate includes",
        ],
      },
      {
        client: "FCV",
        category: "Document AI · cybersecurity internship",
        title: "Paper records, searchable in seconds",
        problem:
          "Hundreds of scanned records. Finding a single one meant opening PDFs one by one.",
        solution:
          "A system that reads the scans with AI, pulls out name, ID number and site, and builds a search tool. Doubtful reads get flagged for a person to check.",
        result: "What used to mean opening PDFs one by one is now typing an ID number.",
        statLabel: "records searchable by ID, name or site",
        shotAlts: [
          "Record search tool",
          "Pipeline processing the scans",
          "Index of reviewed records",
        ],
      },
      {
        client: "criscx1905",
        category: "Content & video",
        title: "Video that explains and sells",
        problem:
          "A good product loses sales when nobody understands in thirty seconds why they need it.",
        solution:
          "I write, record, edit and stream everything myself on TikTok, Instagram and Twitch.",
        result:
          "Over 2M organic impressions. The same skill goes into demos and videos for clients.",
        statLabel: "followers built with my own content",
        shotAlts: [
          "TikTok profile with 32K+ followers",
          "Editing in After Effects",
          "Multistream setup in OBS",
        ],
      },
    ],
  },
  footer: {
    eyebrow: "Contact",
    headline: "Tell me what your business needs.",
    availability:
      "A website, a system that saves your team hours, or a video that explains your product. I reply on WhatsApp.",
    cta: "Message me on WhatsApp",
    groups: {
      navigation: "Navigation",
      social: "Social",
      contact: "Contact",
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
    "svc-fullstack": {
      status: "200 OK",
      nodes: {
        ui: { title: "Interface", detail: "React · Next.js" },
        api: { title: "API", detail: "Laravel · Python" },
        database: { title: "Database", detail: "PostgreSQL" },
      },
    },
    "svc-seo": {
      status: "indexed",
      nodes: {
        site: { title: "Your site", detail: "Fast · clean HTML" },
        schema: { title: "Schema", detail: "JSON-LD · llms.txt" },
        google: { title: "Google", detail: "Search · Maps" },
        ai: { title: "AI answers", detail: "ChatGPT · Perplexity" },
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
    badgeAvailability: "Disponible para proyectos nuevos",
    badgeLocation: "Bucaramanga, Colombia · remoto",
    ctaPrimary: "Hablemos por WhatsApp",
    ctaSecondary: "Ver proyectos y trabajo",
    scrollLabel: "Ir a sobre mí",
    links: { github: "GitHub", cv: "Descargar CV", email: "Correo" },
  },
  about: {
    eyebrow: "Quién hay detrás",
    title: "Sobre mí",
    blocks: [
      {
        title: "Ingeniería y sistemas",
        body: "Construyo sistemas completos, de principio a fin. No me caso con una tecnología: elijo la que le sirve al problema que tengo delante. Y después de trabajar en ciberseguridad, lo primero que reviso es por dónde pasan los datos.",
        traits: [
          { label: "Agnóstico a herramientas", detail: "El stack que pide el problema, no la costumbre" },
          { label: "Mentalidad de seguridad", detail: "Auditoría de flujos, integridad de datos" },
        ],
      },
      {
        title: "Comunicación y video",
        body: "También escribo, presento y edito video, y así construí una audiencia de 32K+ seguidores. La habilidad que hace que alguien se quede viendo un directo es la que hace que una propuesta convenza.",
        traits: [
          { label: "Contenido y streaming", detail: "TikTok / Instagram / Twitch" },
        ],
      },
    ],
    facts: {
      sites: "páginas web en línea para negocios en Colombia",
      audience: "seguidores construidos con contenido propio",
      languages: "trabajo en español e inglés",
      sitesLink: "Verlas",
    },
  },
  services: {
    eyebrow: "Lo que hago",
    title: "Servicios",
    items: [
      {
        name: "Aplicaciones web y software full-stack",
        tag: "Laravel / React / Next.js / PostgreSQL / Docker / Python",
        description:
          "Plataformas web, aplicaciones a medida y el software con el que opera tu negocio, desde cero: la base de datos, la lógica y las pantallas que tu equipo usa a diario.",
      },
      {
        name: "SEO, GEO y AEO para Google y la IA",
        tag: "SEO técnico / Schema.org / SEO local / Respuestas de IA",
        description:
          "Que tu negocio aparezca cuando alguien busca en Google y cuando le pregunta a ChatGPT, Perplexity o a los AI Overviews. Estructura limpia, datos estructurados, SEO local y contenido escrito para ser citado, medido en Search Console.",
      },
      {
        name: "Automatización e integración de flujos",
        tag: "n8n / Python / Webhooks / APIs",
        description:
          "Tus herramientas por fin se hablan entre ellas y las tareas repetitivas desaparecen. Pipelines automáticos que ahorran decenas de horas sin errores de copiar datos a mano.",
      },
      {
        name: "IA documental y extracción de datos",
        tag: "Azure Doc Intelligence / OCR / LLMs / Python",
        description:
          "PDFs, actas y documentos físicos convertidos en datos estructurados que se buscan al instante. OCR seguro e IA hacen la lectura, sin transcripción manual.",
      },
      {
        name: "Asesoría técnica y de negocio",
        tag: "Embudos de venta / Auditoría de procesos / Seguridad y datos",
        description:
          "Auditoría de tu embudo de ventas, tus procesos y tu seguridad técnica. Un informe claro de dónde se pierden ingresos, dónde se frena todo y qué datos están en riesgo, con lo primero que hay que arreglar.",
      },
      {
        name: "Video técnico y storytelling de producto",
        tag: "Edición de alta retención / Guion / Streaming",
        description:
          "Productos técnicos convertidos en video de alta retención que se entiende en treinta segundos. Guion estratégico y edición dinámica pensados para generar confianza y cerrar ventas.",
      },
    ],
  },
  projects: {
    eyebrow: "Casos reales",
    title: "Proyectos",
    intro: "Qué necesitaba cada negocio, qué construí y qué cambió.",
    labels: { problem: "El problema", solution: "Lo que hice", result: "Resultado" },
    liveCta: "Ver la página",
    repoCta: "Código en GitHub",
    askCta: "Quiero algo así",
    moreSites: "Y {n} páginas web en línea para negocios",
    moreWork: {
      lead: "Más en GitHub:",
      name: "PairSync",
      detail: "plataforma de programación en pareja con tutor de IA",
    },
    items: [
      {
        client: "Master Service Quality",
        category: "Página web · renta de camionetas",
        title: "Camionetas que se cotizan desde el celular",
        problem:
          "Una empresa que renta camionetas por mes a contratistas en Barrancabermeja necesitaba que sus clientes vieran vehículos, precios y qué incluye sin tener que llamar.",
        solution:
          "Una página pensada para celular: cada camioneta con su tarifa mensual, lo que cubre el precio y lo que no, y cotización por WhatsApp con el vehículo ya escrito en el mensaje. Además, SEO local y GEO para que aparezca en Google y en las respuestas de la IA cuando alguien busca renta de camionetas en Barrancabermeja.",
        result:
          "El cliente elige la camioneta y la cotiza en dos toques, con el precio ya en pantalla.",
        shotAlts: [
          "Inicio de Master Service Quality en un celular",
          "Camionetas con tarifas mensuales",
          "Lo que incluye la tarifa mensual",
        ],
      },
      {
        client: "FCV",
        category: "IA documental · prácticas en ciberseguridad",
        title: "Actas en papel, encontradas en segundos",
        problem:
          "Cientos de actas escaneadas. Encontrar una sola era abrir PDFs uno por uno.",
        solution:
          "Un sistema que lee los escaneos con IA, saca nombre, cédula y sede, y arma un buscador. Las lecturas dudosas se marcan para que una persona las revise.",
        result: "Lo que antes era abrir PDFs uno por uno ahora es escribir una cédula.",
        statLabel: "actas que se encuentran por cédula, nombre o sede",
        shotAlts: [
          "Buscador de actas",
          "Pipeline procesando los escaneos",
          "Índice de actas revisadas",
        ],
      },
      {
        client: "criscx1905",
        category: "Contenido y video",
        title: "Video que explica y vende",
        problem:
          "Un buen producto pierde ventas cuando nadie entiende en treinta segundos por qué lo necesita.",
        solution:
          "Escribo, grabo, edito y transmito todo yo, en TikTok, Instagram y Twitch.",
        result:
          "Más de 2M de impresiones orgánicas. Lo mismo aplico a demos y videos para clientes.",
        statLabel: "seguidores construidos con contenido propio",
        shotAlts: [
          "Perfil de TikTok con 32K+ seguidores",
          "Edición en After Effects",
          "Montaje multistream en OBS",
        ],
      },
    ],
  },
  footer: {
    eyebrow: "Contacto",
    headline: "Cuéntame qué necesita tu negocio.",
    availability:
      "Una página web, un sistema que le ahorre horas a tu equipo o un video que explique tu producto. Respondo por WhatsApp.",
    cta: "Escríbeme por WhatsApp",
    groups: {
      navigation: "Navegación",
      social: "Redes",
      contact: "Contacto",
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
    "svc-fullstack": {
      status: "200 OK",
      nodes: {
        ui: { title: "Interfaz", detail: "React · Next.js" },
        api: { title: "API", detail: "Laravel · Python" },
        database: { title: "Base de datos", detail: "PostgreSQL" },
      },
    },
    "svc-seo": {
      status: "indexado",
      nodes: {
        site: { title: "Tu sitio", detail: "Rápido · HTML limpio" },
        schema: { title: "Schema", detail: "JSON-LD · llms.txt" },
        google: { title: "Google", detail: "Búsqueda · Maps" },
        ai: { title: "Respuestas IA", detail: "ChatGPT · Perplexity" },
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
