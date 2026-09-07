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
    philosophy: string;
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
    tagline:
      "Full-stack software engineering, smart automation, and digital communication that connects.",
    description:
      "I build complete web applications tailored to each project's stack (Laravel, React, Node), automate operational workflows with n8n, Python, and AI, and produce organic video content from script to screen.",
    philosophy:
      "Tool-agnostic engineering: I pick the architecture and stack each problem actually needs, instead of forcing every project through the same one.",
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
        body: "My foundation is software engineering: I handle end-to-end full-stack projects, designing solid relational schemas, clean APIs, and responsive frontends (Laravel, React, Node, Docker). I stay tool-agnostic on purpose, choosing the architecture each problem actually calls for. My cybersecurity background at FCV ingrained the discipline of auditing data flows, validating input integrity, and keeping security top-of-mind from day one.",
      },
      {
        eyebrow: "02",
        title: "Communication & Video",
        body: "Beyond code, I run a full production pipeline - concept, script, on-camera delivery and editing - that has grown an organic audience of 32K+ followers on TikTok, Instagram and Twitch. For clients that becomes product demos, pitch videos and technical explainers a non-technical buyer can actually follow: the same skill that makes a stream watchable is what makes a B2B pitch land.",
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
          "Design and delivery of complete web applications, scalable and secure, from relational models through to high-performance interactive interfaces.",
      },
      {
        name: "Workflow Automation & Integration",
        tag: "N8N / PYTHON / WEBHOOKS / APIS",
        description:
          "Connecting business tools, databases and CRMs through automated pipelines that remove operational friction and repetitive manual work.",
      },
      {
        name: "AI Pipeline & Intelligent Document Extraction",
        tag: "AZURE DOC INTELLIGENCE / LANGCHAIN / OCR",
        description:
          "Language-model workflows and intelligent ingestion of unstructured data - physical records, complex PDFs, medical and legal forms - into databases you can query instantly.",
      },
      {
        name: "Technical & Business Process Audit",
        tag: "SECURITY / DATA INTEGRITY / WORKFLOW AUDITING",
        description:
          "A deep review of data flows, input validation, operational bottlenecks and security posture, so the technology protects the processes the business actually runs on.",
      },
      {
        name: "Audiovisual Production & Technical Communication",
        tag: "SCRIPTING / HIGH-RETENTION EDITING / STREAMING",
        description:
          "End-to-end vertical video and on-camera product demos that turn dense technical subjects into commercial messages a B2B audience remembers.",
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
          "Remote pairs lose time re-explaining context every time they switch machines or pick a session back up.",
        solution:
          "A shared workspace where session state, code and an AI reviewer live in one place, synced over WebSockets.",
        impact:
          "Pairs resume exactly where they left off, and review feedback arrives while the code is still fresh.",
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
          "Clinical and administrative documents arrived as scans and were transcribed by hand, one field at a time.",
        solution:
          "An ingest pipeline that runs OCR through Azure Document Intelligence, maps the fields, and flags anything that fails validation.",
        impact:
          "Manual transcription becomes a review step, and every extracted field carries a traceable confidence check.",
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
          "Technical products lose deals in the explanation, not in the build. Teams demo features in the vocabulary of whoever wrote them, and the buyer never sees the value.",
        solution:
          "An end-to-end production pipeline run solo: concept, script, on-camera delivery and high-retention vertical editing. The same pipeline behind an organic audience of 32K+ followers and 2M+ likes.",
        impact:
          "It transfers straight to client work: product demos, pitch videos and technical explainers a non-technical decision-maker can follow and act on.",
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
    tagline:
      "Ingeniería de software full-stack, automatización inteligente y comunicación digital que conecta.",
    description:
      "Construyo aplicaciones web completas adaptadas al stack de cada proyecto (Laravel, React, Node), automatizo flujos operativos con n8n, Python e IA, y produzco contenido audiovisual de principio a fin.",
    philosophy:
      "Ingeniería agnóstica de herramientas: elijo la arquitectura y el stack que cada problema necesita, en lugar de forzar todos los proyectos por el mismo camino.",
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
        body: "Mi base es la ingeniería de software: llevo proyectos full-stack de principio a fin, diseñando esquemas relacionales sólidos, APIs limpias y frontends responsivos (Laravel, React, Node, Docker). Me mantengo agnóstico a las herramientas a propósito, eligiendo la arquitectura que cada problema pide de verdad. Mi paso por ciberseguridad en la FCV me dejó la disciplina de auditar flujos de datos, validar la integridad de las entradas y pensar en seguridad desde el primer día.",
      },
      {
        eyebrow: "02",
        title: "Comunicación y video",
        body: "Más allá del código, gestiono una cadena de producción completa (concepto, guion, cámara y edición) que ha construido una audiencia orgánica de 32K+ seguidores en TikTok, Instagram y Twitch. Para un cliente eso se traduce en demos de producto, vídeos de pitch y explicaciones técnicas que un comprador no técnico sí entiende: la misma habilidad que hace ver un directo es la que hace aterrizar un pitch B2B.",
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
          "Diseño e implementación de aplicaciones web completas, escalables y seguras, desde los modelos relacionales hasta interfaces interactivas de alto rendimiento.",
      },
      {
        name: "Automatización e integración de flujos",
        tag: "N8N / PYTHON / WEBHOOKS / APIS",
        description:
          "Conexión de herramientas empresariales, bases de datos y CRMs mediante pipelines automatizados que eliminan fricción operativa y tareas manuales repetitivas.",
      },
      {
        name: "Pipeline de IA y extracción documental",
        tag: "AZURE DOC INTELLIGENCE / LANGCHAIN / OCR",
        description:
          "Modelos de lenguaje e ingesta inteligente de datos no estructurados (registros físicos, PDFs complejos, formularios médicos y legales) hacia bases de datos consultables al instante.",
      },
      {
        name: "Auditoría técnica y de procesos de negocio",
        tag: "SEGURIDAD / INTEGRIDAD DE DATOS / AUDITORÍA DE FLUJOS",
        description:
          "Evaluación profunda de flujos de datos, validación de entradas, cuellos de botella operativos y postura de seguridad, para que la tecnología proteja los procesos de los que vive el negocio.",
      },
      {
        name: "Producción audiovisual y comunicación técnica",
        tag: "GUION / EDICIÓN DE ALTA RETENCIÓN / STREAMING",
        description:
          "Producción integral de vídeo vertical y demostraciones de producto en cámara que convierten temas técnicos densos en mensajes comerciales que una audiencia B2B recuerda.",
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
          "Las parejas de trabajo en remoto pierden tiempo reexplicando el contexto cada vez que cambian de equipo o retoman una sesión.",
        solution:
          "Un espacio compartido donde el estado de la sesión, el código y un revisor con IA viven en el mismo sitio, sincronizados por WebSockets.",
        impact:
          "Se retoma exactamente donde se dejó, y la revisión llega cuando el código todavía está fresco.",
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
          "Los documentos clínicos y administrativos llegaban escaneados y se transcribían a mano, campo por campo.",
        solution:
          "Un pipeline de ingesta que pasa OCR con Azure Document Intelligence, mapea los campos y marca lo que no supera la validación.",
        impact:
          "La transcripción manual pasa a ser un paso de revisión, y cada campo extraído lleva una comprobación de confianza trazable.",
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
          "Los productos técnicos pierden ventas en la explicación, no en la construcción. Se demuestran en el vocabulario de quien los programó, y el cliente nunca llega a ver el valor.",
        solution:
          "Una cadena de producción completa en solitario: concepto, guion, presentación en cámara y edición vertical de alta retención. La misma que sostiene una audiencia orgánica de 32K+ seguidores y 2M+ likes.",
        impact:
          "Se traslada directo al trabajo con clientes: demos de producto, vídeos de pitch y explicaciones técnicas que un decisor no técnico puede seguir y accionar.",
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
