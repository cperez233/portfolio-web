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
 * Seis servicios. Nombre, tag y descripcion viven en content.ts: el
 * tag de los servicios 02, 05 y 06 son frases descriptivas, no nombres
 * propios, asi que tambien se traducen.
 */
export const menuItems: ServiceItem[] = [
  { number: "01", diagram: "svc-fullstack" },
  { number: "02", diagram: "svc-seo" },
  { number: "03", diagram: "svc-automation" },
  { number: "04", diagram: "svc-docai" },
  { number: "05", diagram: "svc-audit" },
  { number: "06", diagram: "svc-media" },
];

export interface CaseShot {
  src: string;
  width: number;
  height: number;
}

/**
 * Un caso de Proyectos. Todo el texto vive en content.ts; aqui solo lo
 * que no se traduce.
 */
export interface CaseStudy {
  key: string;
  /**
   * Capturas para celular: la mayoria de visitas llegan desde uno, asi
   * que si el proyecto tiene version movil se ensena esa, en vertical.
   * Sin ellas, el celular usa las de escritorio.
   */
  mobileShots?: CaseShot[];
  /** Capturas para escritorio, en horizontal. */
  shots: CaseShot[];
  /**
   * Cifra del resultado. Solo cuando es real: el caso que no tiene una
   * cuenta su resultado en texto.
   */
  stat?: string;
  /** Sitio publicado. */
  liveUrl?: string;
  /** Repositorio publico: enlace discreto para quien sea tecnico. */
  repoUrl?: string;
}

const desktopShot = (src: string): CaseShot => ({ src, width: 1600, height: 1000 });
const phoneShot = (src: string): CaseShot => ({ src, width: 780, height: 1688 });

export const cases: CaseStudy[] = [
  {
    key: "msq",
    mobileShots: [
      phoneShot("/projects/msq-mobile-hero.jpg"),
      phoneShot("/projects/msq-mobile-fleet.jpg"),
    ],
    shots: [
      desktopShot("/projects/msq-desktop-hero.jpg"),
      desktopShot("/projects/msq-desktop-fleet.jpg"),
      desktopShot("/projects/msq-desktop-included.jpg"),
    ],
    liveUrl: "https://carros-2.vercel.app/",
  },
  {
    key: "fcv",
    stat: "746",
    shots: [
      { src: "/projects/actas-buscador.jpg", width: 1317, height: 647 },
      { src: "/projects/actas-pipeline.jpg", width: 1317, height: 691 },
      { src: "/projects/actas-excel.jpg", width: 1317, height: 651 },
    ],
    repoUrl: "https://github.com/cperez233/digitalizacion-actas-fcv",
  },
  {
    key: "content",
    stat: "32K+",
    shots: [
      { src: "/projects/content-social.jpg", width: 2000, height: 1248 },
      { src: "/projects/content-editing.jpg", width: 2000, height: 1250 },
      { src: "/projects/content-streaming.jpg", width: 2000, height: 1248 },
    ],
  },
];

/**
 * Proyecto tecnico que ya no va como caso: a quien contrata no le cuenta
 * nada, pero a un perfil tecnico si. Queda como enlace al pie.
 */
export const moreWork = {
  repoUrl: "https://github.com/cperez233/PairProgramming",
} as const;

export type FooterGroupKey = "navigation" | "social" | "contact";

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
  /* Una sola columna de redes. Linktree se fue: repetia TikTok e
     Instagram, que ya estan aqui. */
  {
    key: "social",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/cristianperez879m/",
        external: true,
      },
      { label: "GitHub", href: site.githubUrl, external: true },
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
  {
    key: "m10drinks",
    name: "M10 Drinks",
    domain: "m10drinksversionfinal.netlify.app",
    href: "https://m10drinksversionfinal.netlify.app/",
    image: "/sites/m10drinks.jpg",
  },
];

export const portrait = { local: "/perfil.png" } as const;
