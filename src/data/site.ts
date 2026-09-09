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
}

export const site: SiteMeta = {
  name: "Cristian Pérez",
  role: "Full-stack engineer, automation & content",
  email: "crisperezm879@gmail.com",
  emailHref: "mailto:crisperezm879@gmail.com",
  location: "Bucaramanga, Colombia",
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
  /** Imagen tematica del servicio. Hace de poster si algun dia hay video. */
  image: string;
  /**
   * Video de fondo. No hay fuentes todavia, asi que ninguna entrada lo
   * define y el panel se queda en la imagen: cero peticiones rotas.
   */
  video?: string;
}

/** Imagenes curadas por servicio. Verificadas: las cinco responden 200. */
const UNSPLASH = {
  darkIde:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  nodeNetwork:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  dataWaves:
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  securityAudit:
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  /* Capturas reales del proyecto de digitalizacion de actas (FCV).
     Las dos que mostraban cedulas y nombres van censuradas. */
  actasPipeline: "/projects/actas-pipeline.jpg",
  actasBuscador: "/projects/actas-buscador.jpg",
  actasExcel: "/projects/actas-excel.jpg",
  productionStudio:
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
  /*
    Solo para el proyecto 02, que aun no tiene capturas propias. Los
    proyectos 01 y 03 ya usan imagenes reales desde /public/projects.
  */
  engineering:
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
} as const;

/**
 * Cinco servicios. Nombre, tag y descripcion viven en content.ts: el
 * tag de los servicios 04 y 05 son frases descriptivas, no nombres
 * propios, asi que tambien se traducen.
 */
export const menuItems: ServiceItem[] = [
  { number: "01", image: UNSPLASH.darkIde },
  { number: "02", image: UNSPLASH.nodeNetwork },
  { number: "03", image: UNSPLASH.actasPipeline },
  { number: "04", image: UNSPLASH.securityAudit },
  { number: "05", image: UNSPLASH.productionStudio },
];

export interface Project {
  number: string;
  /** El nombre visible se traduce: vive en content.ts. */
  stack: string;
  showcase: [string, string, string];
}

export const projects: Project[] = [
  {
    number: "01",
    stack: "Laravel, React, WebSockets, Claude API, Docker",
    showcase: [
      "/projects/pairsync-courses.jpg",
      "/projects/pairsync-session.jpg",
      "/projects/pairsync-landing.jpg",
    ],
  },
  {
    number: "02",
    stack: "Python, Azure Document Intelligence, OCR",
    showcase: [
      UNSPLASH.actasPipeline,
      UNSPLASH.actasExcel,
      UNSPLASH.actasBuscador,
    ],
  },
  {
    number: "03",
    stack: "TikTok, Instagram, Twitch community",
    showcase: [
      "/projects/content-social.jpg",
      "/projects/content-streaming.jpg",
      "/projects/content-editing.jpg",
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

/**
 * Tecnologias de la fila inferior del marquee. Nombres propios: no se
 * traducen, por eso viven aqui y no en el diccionario.
 */
export const marqueeTechnologies: string[] = [
  'Laravel',
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Python',
  'PostgreSQL',
  'Docker',
  'n8n',
  'LangChain',
  'Claude API',
  'Azure Doc Intelligence',
  'OCR',
  'WebSockets',
  'Linux',
  'OBS',
  'After Effects',
];

export const portrait = { local: "/perfil.png" } as const;
