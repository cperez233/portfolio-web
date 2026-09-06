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
  tone: "lime" | "violet" | "amber" | "slate" | "teal";
}

export interface ProjectShowcase {
  label: string;
  tone: "lime" | "violet" | "amber" | "slate";
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

export const aboutText =
  "My foundation is software engineering: I handle end-to-end full-stack projects, designing solid relational schemas, clean APIs, and responsive frontends. I don't anchor myself to a single tool: while I have deep experience with Laravel and React, I adapt to whatever stack best fits the problem (JS/TS ecosystems, Python, containerized Docker setups). Additionally, my cybersecurity internship at FCV ingrained in me the habit of auditing data flows and keeping security top-of-mind. Beyond code, I produce organic content and live stream (criscx1905 / Tostu), turning complex technical architectures into clear, relatable stories.";

export const menuItems: ServiceItem[] = [
  {
    name: "Full-Stack Web Development",
    location: "LARAVEL / REACT / DOCKER",
    number: "01",
    tone: "lime",
  },
  {
    name: "Workflow Automation",
    location: "N8N / PYTHON / WEBHOOKS",
    number: "02",
    tone: "violet",
  },
  {
    name: "AI & Document Extraction",
    location: "LANGCHAIN / CLAUDE / AZURE",
    number: "03",
    tone: "teal",
  },
  {
    name: "Audiovisual & Live Content",
    location: "TIKTOK / TWITCH / EDITING",
    number: "04",
    tone: "amber",
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
      { label: "Realtime session", tone: "violet" },
      { label: "AI pair review", tone: "slate" },
      { label: "Workspace", tone: "violet" },
    ],
  },
  {
    number: "02",
    category: "Automation & OCR",
    name: "Document Extraction Automation",
    tagline: "FCV Internship",
    stack: "Python, Azure Document Intelligence, OCR",
    showcase: [
      { label: "Ingest pipeline", tone: "amber" },
      { label: "Field mapping", tone: "slate" },
      { label: "Validation run", tone: "amber" },
    ],
  },
  {
    number: "03",
    category: "Content Creation",
    name: "Organic Content & Live Streaming",
    tagline: "Tostu / criscx1905",
    stack: "TikTok, Instagram, Twitch community",
    showcase: [
      { label: "Vertical edit", tone: "lime" },
      { label: "Live set", tone: "slate" },
      { label: "Community", tone: "lime" },
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
    title: "Direct Contact",
    links: [
      {
        label: "WhatsApp",
        href: "https://wa.me/573052669219",
        external: true,
      },
      { label: "Email", href: "mailto:crisperezm879@gmail.com" },
    ],
  },
];

/**
 * Perfiles sociales. Los href son marcadores: sustituir por las URLs
 * reales de cada perfil antes de publicar.
 */
export const socialLinks: { label: string; href: string }[] = [
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Twitch", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Instagram", href: "#" },
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
