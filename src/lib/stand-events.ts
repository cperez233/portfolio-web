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
  | "bottom";

export function emitStandEvent(kind: StandEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StandEvent>("jojo:event", { detail: kind }));
}
