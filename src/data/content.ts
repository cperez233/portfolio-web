/**
 * Todo el texto visible del sitio, en los dos idiomas.
 *
 * Lo que NO vive aqui: URLs, imagenes y nombres de tecnologias. Los
 * nombres propios (Laravel, Docker, n8n) no se traducen, asi que se
 * quedan en site.ts junto al resto de datos independientes del idioma.
 */

export type Language = "en" | "es";

export interface Dictionary {
  nav: { about: string; services: string; projects: string; contact: string };
  hero: {
    tagline: string;
    description: string;
    badgeAvailability: string;
    badgeLocation: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollLabel: string;
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
    labels: { context: string; solution: string; impact: string };
    /** Por proyecto, en el orden de `projects`. */
    items: Array<{
      /** El nombre tambien se traduce en los proyectos 02 y 03. */
      name: string;
      category: string;
      tagline: string;
      context: string;
      solution: string;
      impact: string;
      cta: string;
      /** Micro-datos visibles bajo la cabecera de la tarjeta. */
      metrics: string[];
      showcase: [string, string, string];
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
}

const en: Dictionary = {
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
      { label: "Bucaramanga, Colombia", detail: "Remote / Worldwide" },
    ],
  },
  services: {
    eyebrow: "[ 02 ]",
    title: "Services",
    items: [
      {
        name: "Full-Stack Systems & Web Architecture",
        tag: "LARAVEL / REACT / DOCKER / POSTGRESQL",
        description:
          "The whole system: the database, the logic, and the screens your team uses every day.",
      },
      {
        name: "Workflow Automation & Integration",
        tag: "N8N / PYTHON / WEBHOOKS / APIS",
        description:
          "Your tools finally talk to each other, so nobody copies data by hand again.",
      },
      {
        name: "AI Pipeline & Intelligent Document Extraction",
        tag: "AZURE DOC INTELLIGENCE / LANGCHAIN / OCR",
        description:
          "Paper, PDFs and forms turned into information you can search in seconds.",
      },
      {
        name: "Technical & Business Process Audit",
        tag: "SECURITY / DATA INTEGRITY / WORKFLOW AUDITING",
        description:
          "A clear report on where your data leaks, slows down or breaks - and what to fix first.",
      },
      {
        name: "Audiovisual Production & Technical Communication",
        tag: "SCRIPTING / HIGH-RETENTION EDITING / STREAMING",
        description:
          "Video that explains what you sell, so people get it in thirty seconds.",
      },
    ],
  },
  projects: {
    eyebrow: "[ 03 ]",
    title: "Projects",
    labels: { context: "Context", solution: "Solution", impact: "Impact" },
    items: [
      {
        name: "PairSync",
        category: "Full-Stack + AI",
        tagline: "Collaborative Environment Powered by AI",
        context:
          "Two people coding together lose time re-explaining where they left off.",
        solution:
          "One shared workspace where the code, the session and an AI helper stay in sync.",
        impact:
          "They pick up exactly where they stopped, and feedback arrives while it still matters.",
        cta: "Explore Project",
        metrics: [
          "Realtime Sync",
          "AI-Assisted Review",
          "Dockerised Delivery",
        ],
        showcase: [
          "02. Course Syllabus & Moodle Grade Integration",
          "03. Real-Time IDE, Mobile Preview & AI Tutor Chat",
          "01. Landing Page — Next-Gen AI Pairing Platform",
        ],
      },
      {
        name: "Document Extraction Automation",
        category: "Automation & Data Pipelines",
        tagline: "FCV Internship",
        context:
          "Medical records arrived as scans and were typed out by hand, field by field.",
        solution:
          "Software that reads the scans, fills the fields, and flags anything that looks wrong.",
        impact:
          "Typing turns into checking, and every field can be traced back to its source.",
        cta: "View Case",
        metrics: [
          "OCR Pipeline",
          "Field-Level Validation",
          "Azure Doc Intelligence",
        ],
        showcase: ["Ingest pipeline", "Field mapping", "Validation run"],
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
};

const es: Dictionary = {
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
      { label: "Bucaramanga, Colombia", detail: "Remoto / Global" },
    ],
  },
  services: {
    eyebrow: "[ 02 ]",
    title: "Servicios",
    items: [
      {
        name: "Sistemas full-stack y arquitectura web",
        tag: "LARAVEL / REACT / DOCKER / POSTGRESQL",
        description:
          "El sistema completo: la base de datos, la lógica y las pantallas que usa tu equipo a diario.",
      },
      {
        name: "Automatización e integración de flujos",
        tag: "N8N / PYTHON / WEBHOOKS / APIS",
        description:
          "Tus programas por fin se hablan entre ellos, y nadie vuelve a copiar datos a mano.",
      },
      {
        name: "Pipeline de IA y extracción documental",
        tag: "AZURE DOC INTELLIGENCE / LANGCHAIN / OCR",
        description:
          "Papeles, PDFs y formularios convertidos en información que se busca en segundos.",
      },
      {
        name: "Auditoría técnica y de procesos de negocio",
        tag: "SEGURIDAD / INTEGRIDAD DE DATOS / AUDITORÍA DE FLUJOS",
        description:
          "Un informe claro de dónde se te escapan datos, dónde se frena todo y qué arreglar primero.",
      },
      {
        name: "Producción audiovisual y comunicación técnica",
        tag: "GUION / EDICIÓN DE ALTA RETENCIÓN / STREAMING",
        description:
          "Video que explica lo que vendes, para que se entienda en treinta segundos.",
      },
    ],
  },
  projects: {
    eyebrow: "[ 03 ]",
    title: "Proyectos",
    labels: { context: "Contexto", solution: "Solución", impact: "Impacto" },
    items: [
      {
        name: "PairSync",
        category: "Desarrollo Full-Stack + IA",
        tagline: "Entorno Colaborativo Impulsado por IA",
        context:
          "Dos personas programando juntas pierden tiempo reexplicando dónde se quedaron.",
        solution:
          "Un espacio compartido donde el código, la sesión y un asistente con IA van sincronizados.",
        impact:
          "Se retoma justo donde se paró, y la revisión llega cuando todavía sirve.",
        cta: "Explorar Proyecto",
        metrics: [
          "Sincronía en vivo",
          "Revisión asistida por IA",
          "Entrega con Docker",
        ],
        showcase: [
          "02. Temario del curso e integración de notas con Moodle",
          "03. IDE en tiempo real, vista móvil y chat con tutor IA",
          "01. Landing — Plataforma de pairing con IA",
        ],
      },
      {
        name: "Automatización de Extracción Documental",
        category: "Automatización y Flujos de Datos",
        tagline: "Prácticas en la FCV",
        context:
          "Las historias clínicas llegaban escaneadas y se pasaban a mano, campo por campo.",
        solution:
          "Un programa que lee los escaneos, rellena los campos y marca lo que se ve mal.",
        impact:
          "Teclear se convierte en revisar, y cada dato se puede rastrear hasta su origen.",
        cta: "Ver Caso",
        metrics: [
          "Pipeline OCR",
          "Validación por campo",
          "Azure Doc Intelligence",
        ],
        showcase: ["Pipeline de ingesta", "Mapeo de campos", "Validación"],
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
};

export const dictionaries: Record<Language, Dictionary> = { en, es };
