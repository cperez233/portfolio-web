/**
 * Bus minimo para que el mini Stand reaccione a lo que pasa en la pagina
 * sin acoplar componentes: quien dispara solo emite un CustomEvent.
 */
export type StandEvent =
  | "timestop"
  | "ora"
  | "muda"
  | "tbc"
  | "barrage"
  | "arrow"
  | "themeLight"
  | "themeDark"
  | "language"
  | "whatsapp"
  | "copy"
  | "return"
  | "fastScroll"
  | "stare"
  | "audit"
  | "sent"
  | "bottom"
  | "chapter"
  | "faq"
  | "hesitate"
  | "typing"
  | "resize"
  | "thrown"
  | "dropped"
  /** Lo sobas con el raton (ir y venir encima de el). */
  | "pet"
  | "rightclick"
  /** El raton se sale de la ventana. */
  | "leave"
  | "offline"
  | "online"
  /** Seleccionas un buen trozo de texto. */
  | "select"
  | "print"
  /** Lanzas la tira de sitios con fuerza (mini-projects.tsx). */
  | "spin"
  /** Abres un servicio. */
  | "service"
  /** Miras precios: cambias de plan o te quedas sobre uno. */
  | "plan"
  /** Lees una resena (te quedas encima o abres a quien la dijo). */
  | "review"
  /** Abres un sitio publicado en otra pestana. */
  | "visit"
  | "github"
  /** Deslizas las capturas de un caso. */
  | "gallery";

export function emitStandEvent(kind: StandEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StandEvent>("jojo:event", { detail: kind }));
}
