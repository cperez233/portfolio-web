/* editorial-ui · Cristian Pérez · cristianperez.me */

import type { Body, Face, Frame } from "@/components/mini-stand/sprite";
import type { StandLines } from "@/components/mini-stand/lines";
import type { Dictionary, Language } from "@/data/content";

/*
  Lo que el efecto del relevo (portfolio-hero.tsx) le presta a cada
  entrada: el reloj del Stand, su dibujo, su globo, sus capas de efectos y
  el relevo al mini Stand. Cada entrada de esta carpeta es una funcion que
  programa su coreografia con esto y nada mas; lo que crea (capas,
  animaciones, clases) lo limpia el propio efecto, tambien si la saltas.
*/
export interface IntroKit {
  /** Programa en el reloj del Stand: ms desde el primer pintado. */
  at(ms: number, fn: () => void): void;
  /** Programa `ms` despues de ahora. */
  later(ms: number, fn: () => void): void;
  /** Guarda una animacion para cancelarla al desmontar o saltar. */
  keep(animation: Animation): Animation;
  /** Algo que deshacer al terminar, al desmontar o al saltar. */
  onCleanup(fn: () => void): void;
  /** Capa fija para efectos (sigue viva con el tiempo detenido). */
  fx(className?: string): HTMLElement;
  /**
   * Capa dentro del hero, delante del nombre y detras del retrato y del
   * Stand (que siguen a la vista). Mide la ventana: sus hijos van en px
   * de la ventana, como en fx.
   */
  behind(className?: string): HTMLElement;
  /** Corre `step(t)` cada cuadro durante `ms` (t de 0 a 1, ya suavizado); se corta al saltar. */
  tween(ms: number, step: (t: number) => void, ease?: (t: number) => number): void;

  /** Cambia el cuadro del Stand grande. */
  frame(name: Frame, extra?: { body?: Body; face?: Face }): void;
  /** Pecho del Stand grande, en px de la ventana. */
  heart(): { x: number; y: number } | null;
  /** La mano de una pose (point: el brazo estirado; high: el puno en alto). */
  hand(body: "point" | "high"): { x: number; y: number } | null;
  /** Alto del Stand grande en pantalla. */
  tall(): number;
  /** El Stand se echa hacia quien mira y vuelve. */
  lunge(amount: number, ms: number): void;
  /** Lo pone del otro lado del retrato (o mas arriba), en una pose torcida. */
  jumpAside(pose: Body, face: Face): void;

  /** Globo del Stand grande, escrito letra a letra. */
  talk(text: string, ms: number): void;
  hush(): void;
  /** Onomatopeya grande que no se sale de la pantalla. */
  shout(text: string, x: number, y: number, className: string, life: number): void;
  /** Sacude el hero entero. */
  shake(px: number, ms: number): void;

  /** El hero (lo que escala con el scroll), el nombre y el retrato. */
  stage: HTMLElement;
  letters(): HTMLElement[];
  portrait(): HTMLElement | null;
  /** El h1 (la oferta). */
  tagline(): HTMLElement | null;

  /** Termina la entrada: el grande viaja al mini Stand y se cambian. */
  relay(): void;

  vw: number;
  vh: number;
  small: boolean;
  language: Language;
  lines: StandLines["intro"];
  jojo: Dictionary["jojo"];
}

/** Una entrada: cuando arranca y su ultimo respaldo para el relevo (ms desde el primer pintado). */
export interface IntroDef {
  start: number;
  condense: number;
  /** Lo que hay que dejar listo desde ya, antes de que el copy suba (Star Finger esconde el h1). */
  prepare?(kit: IntroKit): void;
  run(kit: IntroKit): void;
}

/** Un elemento suelto en una capa, en px de la ventana. */
export function place(parent: HTMLElement, className: string, x: number, y: number, html = "") {
  const el = document.createElement("span");
  el.className = className;
  el.style.left = `${Math.round(x)}px`;
  el.style.top = `${Math.round(y)}px`;
  if (html) el.innerHTML = html;
  parent.appendChild(el);
  return el;
}

/** Texto que se escribe letra a letra en `el`; devuelve como cortarlo. */
export function typeInto(el: HTMLElement, text: string, step: number, onDone?: () => void) {
  let shown = 0;
  el.textContent = "";
  const timer = window.setInterval(() => {
    shown += 1;
    el.textContent = text.slice(0, shown);
    if (shown >= text.length) {
      window.clearInterval(timer);
      onDone?.();
    }
  }, step);
  return () => window.clearInterval(timer);
}

/** Curvas para tween. */
export const ease = {
  linear: (t: number) => t,
  out: (t: number) => 1 - (1 - t) ** 3,
  in: (t: number) => t ** 3,
  inOut: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  back: (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2,
};

/** Sustituye {n} en una frase. */
export const fill = (text: string, n: number | string) => text.replace(/\{n\}/g, String(n));
