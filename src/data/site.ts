/**
 * El contenido vive aqui como datos tipados, nunca incrustado en el JSX.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteMeta {
  name: string;
  role: string;
  email: string;
  location: string;
  whatsapp: string;
  whatsappPlain: string;
}

export interface ServiceItem {
  name: string;
  /** Stack, mostrado como subtitulo en mayusculas. */
  location: string;
  number: string;
  /** Video de fondo. Sin fuente todavia: cae al poster degradado. */
  video?: string;
  tone: "wine" | "plum" | "clay" | "slate" | "ink";
}

export interface ProjectShowcase {
  label: string;
  tone: "wine" | "plum" | "clay" | "slate";
}

export interface Project {
  number: string;
  category: string;
  name: string;
  tagline: string;
  stack: string;
  showcase: [ProjectShowcase, ProjectShowcase, ProjectShowcase];
}

export const site: SiteMeta = {
  name: "Cristian Perez",
  role: "Full-stack engineer, automation & content",
  email: "crisperezm879@gmail.com",
  location: "Bucaramanga, Colombia",
  whatsapp:
    "https://wa.me/573052669219?text=Hi%20Cristian,%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project",
  whatsappPlain: "https://wa.me/573052669219",
};

export const navLinks: NavLink[] = [
  { label: "HOME", href: "#" },
  { label: "ABOUT", href: "#about" },
  { label: "SERVICES", href: "#services" },
  { label: "PROJECTS", href: "#projects" },
  { label: "CONTACT", href: "#contact" },
];

export const hero = {
  firstName: "CRISTIAN",
  lastName: "PÉREZ",
  tagline:
    "Full-stack software engineering, smart automation, and digital communication that connects.",
  description:
    "I build complete web applications tailored to each project's stack (Laravel, React, Node), automate operational workflows with n8n, Python, and AI, and produce organic video content from script to screen.",
  badges: {
    availability: "Available for Projects & Roles",
    location: "Remote / Bucaramanga, Colombia",
  },
  secondaryCta: { label: "Explore Projects & Work", href: "#projects" },
} as const;

export interface AboutBlock {
  eyebrow: string;
  title: string;
  body: string;
}

export const aboutBlocks: AboutBlock[] = [
  {
    eyebrow: "01",
    title: "Engineering & Systems",
    body: "My foundation is software engineering: I handle end-to-end full-stack projects, designing solid relational schemas, clean APIs, and responsive frontends (Laravel, React, Node, Docker). My cybersecurity background at FCV ingrained the discipline of auditing data flows, validating input integrity, and keeping security top-of-mind from day one.",
  },
  {
    eyebrow: "02",
    title: "Communication & Video",
    body: "Beyond code, I produce organic content and live stream (criscx1905 / Tostu) on TikTok, Instagram, and Twitch, running the entire production pipeline. This allows me to explain complex technical architectures in clear, human, jargon-free terms.",
  },
];

export interface Highlight {
  label: string;
  detail: string;
}

export const aboutHighlights: Highlight[] = [
  { label: "Full-Stack Focus", detail: "Laravel / React / Node / Docker" },
  { label: "Security Mindset", detail: "Data flow auditing, input integrity" },
  { label: "Content & Streaming", detail: "TikTok / Instagram / Twitch" },
  { label: "Bucaramanga, Colombia", detail: "Remote / Worldwide" },
];

export const menuItems: ServiceItem[] = [
  {
    name: "Full-Stack Web Development",
    location: "LARAVEL / REACT / DOCKER",
    number: "01",
    tone: "wine",
  },
  {
    name: "Workflow Automation",
    location: "N8N / PYTHON / WEBHOOKS",
    number: "02",
    tone: "plum",
  },
  {
    name: "AI & Document Extraction",
    location: "LANGCHAIN / CLAUDE / AZURE",
    number: "03",
    tone: "ink",
  },
  {
    name: "Audiovisual & Live Content",
    location: "TIKTOK / TWITCH / EDITING",
    number: "04",
    tone: "clay",
  },
  {
    name: "Secure Systems & APIs",
    location: "AUDITING / INTEGRITY / DB",
    number: "05",
    tone: "slate",
  },
];

export const projects: Project[] = [
  {
    number: "01",
    category: "Full-Stack + AI",
    name: "PairSync",
    tagline: "Collaborative Environment Powered by AI",
    stack: "Laravel, React, WebSockets, Claude API, Docker",
    showcase: [
      { label: "Realtime session", tone: "plum" },
      { label: "AI pair review", tone: "slate" },
      { label: "Workspace", tone: "plum" },
    ],
  },
  {
    number: "02",
    category: "Automation & OCR",
    name: "Document Extraction Automation",
    tagline: "FCV Internship",
    stack: "Python, Azure Document Intelligence, OCR",
    showcase: [
      { label: "Ingest pipeline", tone: "clay" },
      { label: "Field mapping", tone: "slate" },
      { label: "Validation run", tone: "clay" },
    ],
  },
  {
    number: "03",
    category: "Content Creation",
    name: "Organic Content & Live Streaming",
    tagline: "Tostu / criscx1905",
    stack: "TikTok, Instagram, Twitch community",
    showcase: [
      { label: "Vertical edit", tone: "wine" },
      { label: "Live set", tone: "slate" },
      { label: "Community", tone: "wine" },
    ],
  },
];

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export const footerGroups: FooterLinkGroup[] = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "#" },
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Projects", href: "#projects" },
    ],
  },
  {
    title: "Professional",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/cristianperez879m/",
        external: true,
      },
      {
        label: "GitHub",
        href: "https://github.com/cperez233",
        external: true,
      },
    ],
  },
  {
    title: "Content & Community",
    links: [
      { label: "Linktree", href: "https://linktr.ee/crxscx", external: true },
      {
        label: "TikTok",
        href: "https://www.tiktok.com/@criscx1905",
        external: true,
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/criscx1905/",
        external: true,
      },
    ],
  },
  {
    title: "Direct Contact",
    links: [
      {
        label: "WhatsApp",
        href: "https://wa.me/573052669219?text=Hi%20Cristian,%20I%20saw%20your%20portfolio",
        external: true,
      },
      { label: "Email", href: "mailto:crisperezm879@gmail.com" },
    ],
  },
];

/** Marquee fila 1. Assets alojados por motionsites.ai (terceros). */
export const marqueeRowOne: string[] = [
  "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif",
  "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif",
  "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif",
  "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif",
  "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif",
  "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif",
  "https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif",
  "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif",
  "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif",
  "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif",
  "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif",
];

/** Marquee fila 2. */
export const marqueeRowTwo: string[] = [
  "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif",
  "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif",
  "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif",
  "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif",
  "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif",
  "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif",
  "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif",
  "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif",
  "https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif",
  "https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif",
];

/** Retrato del hero. */
export const portrait = {
  local: "/perfil.png",
} as const;
