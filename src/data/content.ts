/**
 * Todo el texto visible del sitio, en los dos idiomas.
 *
 * Lo que NO vive aqui: URLs, imagenes y nombres de tecnologias. Los
 * nombres propios (Laravel, Docker, n8n) no se traducen, asi que se
 * quedan en site.ts junto al resto de datos independientes del idioma.
 */

export type Language = "en" | "es";

export interface Dictionary {
  nav: { home: string; about: string; services: string; projects: string };
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
    /** Un nombre por servicio, en el orden de `menuItems`. */
    items: string[];
  };
  projects: {
    eyebrow: string;
    title: string;
    cta: string;
    /** Por proyecto, en el orden de `projects`. */
    items: Array<{
      category: string;
      tagline: string;
      showcase: [string, string, string];
    }>;
  };
  footer: {
    eyebrow: string;
    headline: string;
    cta: string;
    groups: { navigation: string; professional: string; community: string; contact: string };
    links: { home: string; about: string; services: string; projects: string; email: string };
    rights: string;
  };
  languageToggle: { label: string };
}

const en: Dictionary = {
  nav: {
    home: "HOME",
    about: "ABOUT",
    services: "SERVICES",
    projects: "PROJECTS",
  },
  hero: {
    tagline:
      "Full-stack software engineering, smart automation, and digital communication that connects.",
    description:
      "I build complete web applications tailored to each project's stack (Laravel, React, Node), automate operational workflows with n8n, Python, and AI, and produce organic video content from script to screen.",
    philosophy:
      "Tool-agnostic engineering: I pick the architecture and stack each problem actually needs, instead of forcing every project through the same one.",
    badgeAvailability: "Available for Projects & Roles",
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
        body: "Beyond code, I produce organic content and live stream (criscx1905 / Tostu) on TikTok, Instagram, and Twitch, running the entire production pipeline. This allows me to explain complex technical architectures in clear, human, jargon-free terms.",
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
      "Full-Stack Web Development",
      "Workflow Automation",
      "AI & Document Extraction",
      "Audiovisual & Live Content",
      "Secure Systems & APIs",
    ],
  },
  projects: {
    eyebrow: "[ 03 ]",
    title: "Projects",
    cta: "Discuss this",
    items: [
      {
        category: "Full-Stack + AI",
        tagline: "Collaborative Environment Powered by AI",
        showcase: ["Realtime session", "AI pair review", "Workspace"],
      },
      {
        category: "Automation & OCR",
        tagline: "FCV Internship",
        showcase: ["Ingest pipeline", "Field mapping", "Validation run"],
      },
      {
        category: "Content Creation",
        tagline: "Tostu / criscx1905",
        showcase: ["Vertical edit", "Live set", "Community"],
      },
    ],
  },
  footer: {
    eyebrow: "[ Contact ]",
    headline: "Let's build something that ships.",
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
    home: "INICIO",
    about: "SOBRE MÍ",
    services: "SERVICIOS",
    projects: "PROYECTOS",
  },
  hero: {
    tagline:
      "Ingeniería de software full-stack, automatización inteligente y comunicación digital que conecta.",
    description:
      "Construyo aplicaciones web completas adaptadas al stack de cada proyecto (Laravel, React, Node), automatizo flujos operativos con n8n, Python e IA, y produzco contenido audiovisual de principio a fin.",
    philosophy:
      "Ingeniería agnóstica de herramientas: elijo la arquitectura y el stack que cada problema necesita, en lugar de forzar todos los proyectos por el mismo camino.",
    badgeAvailability: "Disponible para proyectos y roles",
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
        body: "Más allá del código, produzco contenido orgánico y hago streaming en directo (criscx1905 / Tostu) en TikTok, Instagram y Twitch, gestionando toda la cadena de producción. Eso me permite explicar arquitecturas técnicas complejas en términos claros, humanos y sin jerga.",
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
      "Desarrollo web full-stack",
      "Automatización de flujos",
      "IA y extracción documental",
      "Audiovisual y contenido en vivo",
      "Sistemas y APIs seguras",
    ],
  },
  projects: {
    eyebrow: "[ 03 ]",
    title: "Proyectos",
    cta: "Hablemos de esto",
    items: [
      {
        category: "Full-Stack + IA",
        tagline: "Entorno colaborativo impulsado por IA",
        showcase: ["Sesión en tiempo real", "Revisión con IA", "Espacio de trabajo"],
      },
      {
        category: "Automatización y OCR",
        tagline: "Prácticas en la FCV",
        showcase: ["Pipeline de ingesta", "Mapeo de campos", "Validación"],
      },
      {
        category: "Creación de contenido",
        tagline: "Tostu / criscx1905",
        showcase: ["Edición vertical", "Directo", "Comunidad"],
      },
    ],
  },
  footer: {
    eyebrow: "[ Contacto ]",
    headline: "Construyamos algo que salga a producción.",
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
