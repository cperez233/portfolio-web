/**
 * Directriz 5: el contenido vive en datos tipados, nunca incrustado en el JSX.
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
}

export interface Service {
  number: string;
  name: string;
  description: string;
  stack: string;
}

export interface ProjectShowcase {
  /** Etiqueta del tile de muestra. Sustituir por capturas reales. */
  label: string;
  tone: "violet" | "amber" | "slate";
}

export interface Project {
  number: string;
  category: string;
  name: string;
  tagline: string;
  cta: { label: string; href: string };
  showcase: [ProjectShowcase, ProjectShowcase, ProjectShowcase];
}

export const site: SiteMeta = {
  name: "Cristian Perez",
  role: "Full-stack software engineer & creator",
  email: "cperez233@unab.edu.co",
  location: "Colombia - Remote / Worldwide",
  whatsapp:
    "https://wa.me/573052669219?text=Hi%20Cristian,%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project",
};

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const hero = {
  /** Dos lineas: en una sola, 14 caracteres a 13vw desbordan el ancho. */
  headingLines: ["CRISTIAN", "PÉREZ"] as const,
  badge: "Available for Projects",
  statement:
    "Full-stack software engineer & creator building high-performance architectures, smart automation (n8n/AI), and organic content.",
} as const;

export const aboutText =
  "My foundation is software engineering: I handle end-to-end full-stack projects, designing solid relational schemas, clean APIs, and responsive frontends (Laravel, React, Node, Docker). My cybersecurity background at FCV ingrained the discipline of auditing data flows, validating input integrity, and keeping security top-of-mind. Beyond code, I produce organic content and live stream (criscx1905 / Tostu), translating complex technical architectures into clear, relatable stories for clients and communities.";

export const services: Service[] = [
  {
    number: "01",
    name: "Custom Full-Stack & Web Development",
    description:
      "End-to-end web apps: database design, robust backend business logic, internal dashboards, dynamic interfaces.",
    stack: "Laravel, React, Node.js, PostgreSQL, Docker",
  },
  {
    number: "02",
    name: "Workflow Automation & Orchestration",
    description:
      "Automated pipelines connecting third-party tools and databases to cut manual tasks.",
    stack: "n8n, Python, Webhooks, RESTful APIs",
  },
  {
    number: "03",
    name: "AI Integration & Document Processing",
    description:
      "Language model workflows and practical extraction pipelines (OCR, data parsing, semantic queries).",
    stack: "LangChain, Claude API, Azure Doc Intelligence, Python",
  },
  {
    number: "04",
    name: "Audiovisual Production, Scripting & Video",
    description:
      "Turnkey video production for social platforms: concept development, scripting, presenting on camera, fast-paced vertical editing.",
    stack: "TikTok, Instagram, Twitch",
  },
];

export const projects: Project[] = [
  {
    number: "01",
    category: "Full-Stack + AI",
    name: "PairSync",
    tagline: "Collaborative Environment Powered by AI",
    cta: { label: "Live Project", href: "#contact" },
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
    tagline: "FCV Internship - Python, Azure Document Intelligence",
    cta: { label: "View Case", href: "#contact" },
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
    tagline: "Tostu / criscx1905 - TikTok, Instagram, Twitch",
    cta: { label: "View Case", href: "#contact" },
    showcase: [
      { label: "Vertical edit", tone: "slate" },
      { label: "Live set", tone: "violet" },
      { label: "Community", tone: "slate" },
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

const FIGMA_ASSETS =
  "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7";

export interface FloatingAsset {
  src: string;
  alt: string;
  className: string;
}

/** Assets 3D de las esquinas del about. Alojados por figma.site (terceros). */
export const aboutAssets: FloatingAsset[] = [
  {
    src: `${FIGMA_ASSETS}/moon_icon.11395d36.png`,
    alt: "",
    className: "left-0 top-0 w-16 sm:w-24 md:w-32",
  },
  {
    src: `${FIGMA_ASSETS}/p59_1.4659672e.png`,
    alt: "",
    className: "bottom-0 left-0 w-16 sm:w-24 md:w-32",
  },
  {
    src: `${FIGMA_ASSETS}/lego_icon-1.703bb594.png`,
    alt: "",
    className: "right-0 top-0 w-16 sm:w-24 md:w-32",
  },
  {
    src: `${FIGMA_ASSETS}/Group_134-1.2e04f3ce.png`,
    alt: "",
    className: "bottom-0 right-0 w-16 sm:w-24 md:w-32",
  },
];

/** Retrato del hero: local, con fallback remoto de Figma. */
export const portrait = {
  local: "/perfil.png",
  fallback:
    "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png",
} as const;
