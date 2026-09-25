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
  /**
   * WhatsApp Business, formato internacional E.164. Es la unica copia del
   * numero: los enlaces de WhatsApp, el JSON-LD y llms.txt salen de aqui.
   */
  phone: string;
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
  phone: "+573334337931",
  location: "Bucaramanga, Colombia",
  githubUrl: "https://github.com/cperez233",
  cvPath: "/cv-cristian-perez.pdf",
};

export type NavKey = "about" | "services" | "projects" | "pricing" | "contact";

export interface NavLink {
  key: NavKey;
  href: string;
}

export const navLinks: NavLink[] = [
  { key: "about", href: "#about" },
  { key: "services", href: "#services" },
  { key: "projects", href: "#projects" },
  { key: "pricing", href: "#pricing" },
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
 * Cinco servicios, en el orden de `services.items` (content.ts). La IA
 * documental va dentro de Automatizacion: para quien contrata son la
 * misma promesa, menos trabajo a mano.
 */
export const menuItems: ServiceItem[] = [
  { number: "01", diagram: "svc-fullstack" },
  { number: "02", diagram: "svc-seo" },
  { number: "03", diagram: "svc-automation" },
  { number: "04", diagram: "svc-audit" },
  { number: "05", diagram: "svc-media" },
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
    key: "fcv",
    stat: "746",
    shots: [
      // Recreadas en HTML (assets-src/fcv-mockups) con cedulas y nombres
      // enmascarados: las capturas reales tenian datos personales.
      desktopShot("/projects/fcv-buscador.jpg"),
      desktopShot("/projects/fcv-pipeline.jpg"),
      desktopShot("/projects/fcv-indice.jpg"),
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
  labelKey?: "home" | "about" | "services" | "projects" | "pricing" | "faq" | "email";
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
      { labelKey: "pricing", href: "#pricing" },
      { labelKey: "faq", href: "#faq" },
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
        href: `https://wa.me/${site.phone.slice(1)}`,
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
    key: "master-service-quality",
    name: "Master Service Quality",
    domain: "carros-2.vercel.app",
    href: "https://carros-2.vercel.app/",
    image: "/sites/master-service-quality.jpg",
  },
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

export type PlanKey = "landing" | "web" | "panel";

export interface Plan {
  key: PlanKey;
  /** Precio "desde", en pesos: lo ve la version en espanol. */
  cop: number;
  /** Precio "desde", en dolares: lo ve la version en ingles. */
  usd: number;
  /** El plan que se destaca. */
  featured?: boolean;
}

/**
 * Precios de referencia. Nombre, que incluye y plazo viven en content.ts;
 * aqui solo los numeros, porque los comparten la seccion de precios, las
 * preguntas frecuentes, el JSON-LD y llms.txt. Cambiar un precio aqui lo
 * cambia en todos a la vez.
 *
 * Cada idioma muestra su moneda: /es en pesos, / en dolares (quien lee en
 * ingles casi siempre esta fuera de Colombia).
 */
export const plans: Plan[] = [
  { key: "landing", cop: 690_000, usd: 290 },
  { key: "web", cop: 1_490_000, usd: 590, featured: true },
  { key: "panel", cop: 2_890_000, usd: 990 },
];

/**
 * Kit de marca (logo, colores, tipografias, plantillas para redes): va
 * aparte de los planes, con descuento si se suma a cualquiera de ellos.
 * Asi el plan mas barato sigue siendo barato para quien ya tiene logo.
 */
export const brandKit = {
  alone: { cop: 390_000, usd: 150 },
  withPlan: { cop: 290_000, usd: 110 },
} as const;

/** Revision completa de un sitio ya publicado (se descuenta si hay proyecto). */
export const fullAudit = { cop: 190_000, usd: 90 } as const;

export const currency: Record<"en" | "es", "USD" | "COP"> = { en: "USD", es: "COP" };

/** "$590.000" en /es, "$190" en /. */
export function formatPrice(amount: { cop: number; usd: number }, language: "en" | "es") {
  const code = currency[language];
  const value = code === "COP" ? amount.cop : amount.usd;
  return new Intl.NumberFormat(language === "es" ? "es-CO" : "en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  })
    .format(value)
    // es-CO escribe "$ 590.000"; en Colombia se lee "$590.000".
    .replace(/^\$\s/, "$");
}

export interface Testimonial {
  /** Caso o sitio al que pertenece: la cita se enlaza a el. */
  key: string;
  /** Quien lo dice y su negocio. Nombres propios: no se traducen. */
  author: string;
  business: string;
  href: string;
  /**
   * Solo se publica con `approved: true`, es decir, cuando el cliente ha
   * leido la frase y ha dicho que si. Una cita inventada en nombre de un
   * negocio real es justo lo que hace desconfiar de un portafolio.
   */
  approved: boolean;
}

/** El texto de cada cita vive en content.ts (testimonials.quotes), por key. */
export const testimonials: Testimonial[] = [
  {
    key: "hotel-logistico",
    author: "Hotel Logístico",
    business: "Santa Marta",
    href: "https://hotellogistico.com",
    approved: true,
  },
  {
    key: "msq",
    author: "Master Service Quality",
    business: "Barrancabermeja",
    href: "https://carros-2.vercel.app/",
    approved: true,
  },
  {
    key: "m10drinks",
    author: "M10 Drinks",
    business: "Floridablanca",
    href: "https://m10drinksversionfinal.netlify.app/",
    approved: true,
  },
];

export const portrait = { local: "/perfil.png" } as const;

/** Sustituye {landing}, {web} y {panel} por el precio de cada plan. */
export function fillPlanPrices(text: string, language: "en" | "es") {
  return plans.reduce(
    (result, plan) => result.replaceAll(`{${plan.key}}`, formatPrice(plan, language)),
    text,
  );
}
