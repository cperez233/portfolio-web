/**
 * Datos independientes del idioma: URLs, imagenes, nombres propios.
 * Todo el texto traducible vive en content.ts.
 */

export interface SiteMeta {
  name: string;
  role: string;
  email: string;
  emailHref: string;
  location: string;
  whatsapp: string;
}

export const site: SiteMeta = {
  name: "Cristian Pérez",
  role: "Full-stack engineer, automation & content",
  email: "crisperezm879@gmail.com",
  emailHref: "mailto:crisperezm879@gmail.com",
  location: "Bucaramanga, Colombia",
  whatsapp:
    "https://wa.me/573052669219?text=Hi%20Cristian,%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project",
};

export type NavKey = "home" | "about" | "services" | "projects";

export interface NavLink {
  key: NavKey;
  href: string;
}

export const navLinks: NavLink[] = [
  { key: "home", href: "#" },
  { key: "about", href: "#about" },
  { key: "services", href: "#services" },
  { key: "projects", href: "#projects" },
];

export const hero = {
  firstName: "CRISTIAN",
  lastName: "PÉREZ",
  secondaryCtaHref: "#projects",
} as const;

export interface ServiceItem {
  number: string;
  /** Stack: nombres propios, iguales en ambos idiomas. */
  location: string;
  /** Miniatura tematica del servicio. */
  image: string;
  /** Video de fondo. Sin fuentes todavia: cae a la miniatura. */
  video?: string;
}

const UNSPLASH = {
  darkIde:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  dataInterface:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  minimalTech:
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  dataWaves:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  engineering:
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
  circuits:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  studioAudio:
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
  videoProduction:
    "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=1200&q=80",
  contentLights:
    "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=1200&q=80",
} as const;

/** Cinco servicios, cada uno con una miniatura que refleja su tema. */
export const menuItems: ServiceItem[] = [
  { number: "01", location: "LARAVEL / REACT / DOCKER", image: UNSPLASH.darkIde },
  { number: "02", location: "N8N / PYTHON / WEBHOOKS", image: UNSPLASH.circuits },
  {
    number: "03",
    location: "LANGCHAIN / CLAUDE / AZURE",
    image: UNSPLASH.dataWaves,
  },
  {
    number: "04",
    location: "TIKTOK / TWITCH / EDITING",
    image: UNSPLASH.studioAudio,
  },
  {
    number: "05",
    location: "AUDITING / INTEGRITY / DB",
    image: UNSPLASH.engineering,
  },
];

export interface Project {
  number: string;
  name: string;
  stack: string;
  showcase: [string, string, string];
}

export const projects: Project[] = [
  {
    number: "01",
    name: "PairSync",
    stack: "Laravel, React, WebSockets, Claude API, Docker",
    showcase: [UNSPLASH.darkIde, UNSPLASH.dataInterface, UNSPLASH.minimalTech],
  },
  {
    number: "02",
    name: "Document Extraction Automation",
    stack: "Python, Azure Document Intelligence, OCR",
    showcase: [UNSPLASH.dataWaves, UNSPLASH.engineering, UNSPLASH.circuits],
  },
  {
    number: "03",
    name: "Organic Content & Live Streaming",
    stack: "TikTok, Instagram, Twitch community",
    showcase: [
      UNSPLASH.studioAudio,
      UNSPLASH.videoProduction,
      UNSPLASH.contentLights,
    ],
  },
];

export type FooterGroupKey =
  | "navigation"
  | "professional"
  | "community"
  | "contact";

export interface FooterLink {
  /** Clave de traduccion, o `label` fijo para nombres propios. */
  labelKey?: "home" | "about" | "services" | "projects" | "email";
  label?: string;
  href: string;
  external?: boolean;
}

export interface FooterGroup {
  key: FooterGroupKey;
  links: FooterLink[];
}

export const footerGroups: FooterGroup[] = [
  {
    key: "navigation",
    links: [
      { labelKey: "home", href: "#" },
      { labelKey: "about", href: "#about" },
      { labelKey: "services", href: "#services" },
      { labelKey: "projects", href: "#projects" },
    ],
  },
  {
    key: "professional",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/cristianperez879m/",
        external: true,
      },
      { label: "GitHub", href: "https://github.com/cperez233", external: true },
    ],
  },
  {
    key: "community",
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
    key: "contact",
    links: [
      {
        label: "WhatsApp",
        href: "https://wa.me/573052669219?text=Hi%20Cristian,%20I%20saw%20your%20portfolio",
        external: true,
      },
      { labelKey: "email", href: "mailto:crisperezm879@gmail.com" },
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

export const portrait = { local: "/perfil.png" } as const;
