/**
 * Directriz 5: el contenido vive en datos tipados, nunca incrustado en el JSX.
 * Directriz 2: cada texto se escribe en clave Pain / Person / Promise.
 *
 * Los textos de aqui son un punto de partida editorial, pensados para
 * sustituirse por los definitivos durante la fase de diseno.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface ProcessStep {
  id: string;
  index: string;
  title: string;
  /** Pain: el problema del cliente, en su idioma. */
  pain: string;
  /** Promise: el resultado tangible al cerrar este paso. */
  promise: string;
}

export interface SiteMeta {
  name: string;
  role: string;
  email: string;
  location: string;
}

export const site: SiteMeta = {
  name: "cperez233",
  role: "Diseno y desarrollo web para negocios que venden",
  email: "cperez233@unab.edu.co",
  location: "Colombia - trabajo remoto",
};

export const navLinks: NavLink[] = [
  { label: "Proceso", href: "#proceso" },
  { label: "Trabajo", href: "#trabajo" },
  { label: "Contacto", href: "#contacto" },
];

/** Copy del hero, estructurado explicitamente segun los 3 Ps. */
export const hero = {
  eyebrow: "Disponible para nuevos proyectos",
  /** Pain */
  headline: "Tu web no esta perdiendo trafico. Esta perdiendo clientes.",
  /** Person + Promise */
  subheadline:
    "Diseno y construyo sitios para fundadores y duenos de negocio que ya tienen demanda, pero cuya web no transmite el precio que cobran. Menos adornos, mas conversaciones de venta.",
  primaryCta: { label: "Ver como trabajo", href: "#proceso" },
  secondaryCta: { label: "Escribeme", href: "#contacto" },
} as const;

export const processSteps: ProcessStep[] = [
  {
    id: "diagnostico",
    index: "01",
    title: "Diagnostico",
    pain: "Recibes visitas, pero no sabes en que punto exacto se caen antes de escribirte.",
    promise:
      "Un mapa claro de las fugas de tu embudo y la lista priorizada de que arreglar primero.",
  },
  {
    id: "mensaje",
    index: "02",
    title: "Mensaje",
    pain: "Tu web habla de tus herramientas y tu cliente solo quiere saber si resuelves su problema.",
    promise:
      "Un mensaje construido sobre dolor, persona y promesa, listo para sostener el precio que cobras.",
  },
  {
    id: "diseno",
    index: "03",
    title: "Diseno",
    pain: "Tu marca se ve como una plantilla mas y compite por precio en lugar de por criterio.",
    promise:
      "Una identidad en pantalla que justifica tu tarifa antes de la primera llamada.",
  },
  {
    id: "construccion",
    index: "04",
    title: "Construccion",
    pain: "El sitio anterior tardaba en cargar y en movil se rompia justo donde estaba el boton.",
    promise:
      "Un sitio rapido, medible y solido en cualquier pantalla, que puedes editar sin depender de nadie.",
  },
];

export const cta = {
  /** Pain */
  headline: "Cada semana con la web actual es margen que se va a otro.",
  /** Person + Promise */
  body:
    "Si tu negocio ya factura y la web se quedo atras, hablemos. En una llamada corta te digo que arreglaria primero y que impacto esperar, cobre o no cobre por hacerlo.",
  action: { label: "Agendar una llamada", href: "#contacto" },
} as const;
