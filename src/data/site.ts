/**
 * Datos independientes del idioma: URLs, imagenes, nombres propios.
 * Todo el texto traducible vive en content.ts.
 */

import type { DiagramId } from "./diagrams";

export interface SiteMeta {
  name: string;
  role: string;
  email: string;
  emailHref: string;
  location: string;
  githubUrl: string;
  /**
   * CV descargable, relativo a /public. El hero solo lo enlaza si el
   * archivo existe al compilar (lo comprueba page.tsx): un enlace de
   * descarga que devuelve 404 resta mas credibilidad que no tenerlo.
   */
  cvPath: string;
}

export const site: SiteMeta = {
  name: "Cristian Pérez",
  role: "Systems Engineer & Tech Creator",
  email: "crisperezm879@gmail.com",
  emailHref: "mailto:crisperezm879@gmail.com",
  location: "Bucaramanga, Colombia",
  githubUrl: "https://github.com/cperez233",
  cvPath: "/cv-cristian-perez.pdf",
};

export type NavKey = "about" | "services" | "projects" | "contact";

export interface NavLink {
  key: NavKey;
  href: string;
}

export const navLinks: NavLink[] = [
  { key: "about", href: "#about" },
  { key: "services", href: "#services" },
  { key: "projects", href: "#projects" },
  { key: "contact", href: "#contact" },
];

export const hero = {
  firstName: "CRISTIAN",
  lastName: "PÉREZ",
  secondaryCtaHref: "#projects",
} as const;

export interface ServiceItem {
  number: string;
  /**
   * Diagrama del panel de medios (ver data/diagrams.ts). Sustituye a las
   * fotos de stock: una foto generica de un teclado no demuestra nada, un
   * esquema de lo que se construye si.
   */
  diagram: DiagramId;
}

/**
 * Cinco servicios. Nombre, tag y descripcion viven en content.ts: el
 * tag de los servicios 04 y 05 son frases descriptivas, no nombres
 * propios, asi que tambien se traducen.
 */
export const menuItems: ServiceItem[] = [
  { number: "01", diagram: "svc-fullstack" },
  { number: "02", diagram: "svc-automation" },
  { number: "03", diagram: "svc-docai" },
  { number: "04", diagram: "svc-audit" },
  { number: "05", diagram: "svc-media" },
];

export type ProjectVisual =
  | { kind: "diagram"; diagram: DiagramId }
  /**
   * Tres capturas reales, en /public/projects, dentro de la misma ventana
   * oscura que los diagramas. `window` es la ruta de su barra.
   */
  | { kind: "gallery"; window: string; images: [string, string, string] };

export interface Project {
  number: string;
  /** Nombres propios de tecnologias: no se traducen. */
  stack: string[];
  visual: ProjectVisual;
  /** Repositorio publico. Sin el, el CTA de la tarjeta lleva a WhatsApp. */
  repoUrl?: string;
}

export const projects: Project[] = [
  {
    number: "01",
    // El stack que declara el propio repositorio: Laravel 12 con Blade y
    // JS plano en el cliente, agente LangGraph para el tutor de IA,
    // Moodle por su API REST y SQLite como base de datos por defecto.
    stack: [
      "Laravel 12",
      "Blade + JS",
      "Tailwind CSS",
      "LangGraph",
      "Moodle REST API",
      "SQLite",
      "Docker",
    ],
    visual: { kind: "diagram", diagram: "pairsync" },
    repoUrl: "https://github.com/cperez233/PairProgramming",
  },
  {
    number: "02",
    stack: [
      "Python",
      "Azure Document Intelligence",
      "OCR",
      "PyMuPDF",
      "openpyxl",
    ],
    visual: { kind: "diagram", diagram: "fcv" },
    repoUrl: "https://github.com/cperez233/digitalizacion-actas-fcv",
  },
  {
    number: "03",
    stack: ["TikTok", "Instagram", "Twitch", "OBS", "After Effects"],
    visual: {
      kind: "gallery",
      window: "criscx1905 / content",
      images: [
        "/projects/content-social.jpg",
        "/projects/content-streaming.jpg",
        "/projects/content-editing.jpg",
      ],
    },
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
      { label: "GitHub", href: site.githubUrl, external: true },
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
      /* Sin ?text: el mensaje traducido lo ponen los CTA grandes.
         Aqui es un enlace de directorio, no una llamada a la accion. */
      {
        label: "WhatsApp",
        href: "https://wa.me/573052669219",
        external: true,
      },
      { labelKey: "email", href: "mailto:crisperezm879@gmail.com" },
    ],
  },
];

export interface MiniProject {
  key: string;
  name: string;
  /** Lo que sale en la barra del navegador simulada. */
  domain: string;
  href: string;
  image: string;
}

/**
 * Sitios de la tira de mini proyectos. La linea descriptiva de cada uno
 * se traduce: vive en content.ts, en este mismo orden.
 */
export const miniProjects: MiniProject[] = [
  {
    key: "hotel-logistico",
    name: "Hotel Logístico",
    domain: "hotellogistico.com",
    href: "https://hotellogistico.com",
    image: "/sites/hotel-logistico.jpg",
  },
  {
    key: "leons",
    name: "Leons Footwear",
    domain: "calzadoleons.com",
    href: "https://calzadoleons.com",
    image: "/sites/leons.jpg",
  },
  {
    key: "rincon-del-bebe",
    name: "El Rincón del Bebé",
    domain: "elrincondelbebebga.com",
    href: "https://elrincondelbebebga.com/",
    image: "/sites/rincon-del-bebe.jpg",
  },
  {
    key: "louloz",
    name: "Louloz",
    domain: "louloz.com",
    href: "https://louloz.com",
    image: "/sites/louloz.jpg",
  },
  {
    key: "groomers-house",
    name: "The Groomer's House",
    domain: "the-groomers-house.vercel.app",
    href: "https://the-groomers-house.vercel.app/",
    image: "/sites/groomers-house.jpg",
  },
];

export const portrait = { local: "/perfil.png" } as const;
