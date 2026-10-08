/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Herramientas comunes de los poderes del mini Stand: capas fijas,
 * onomatopeyas, temblores y la busqueda de lo que hay en pantalla.
 */

export const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Capa fija decorativa. live: sigue animando con el tiempo detenido. */
export function layer(className: string, live = false) {
  const node = document.createElement("div");
  node.className = live ? `${className} power-live` : className;
  node.setAttribute("aria-hidden", "true");
  document.body.appendChild(node);
  return node;
}

export function scrollToY(y: number, immediate: boolean, duration = 1.3) {
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration, force: true });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

export function sections() {
  return [...document.querySelectorAll("main > section[id], main > div > section[id], footer[id]")].filter(
    (el) => (el as HTMLElement).offsetHeight > 0,
  );
}

const SKIP = "header, nav, [role='dialog'], .stand-layer, [aria-hidden='true'], [class*='power-']";

/**
 * Elementos de la pagina que se ven ahora mismo (sin menu ni dialogos),
 * sin repetir uno que ya este dentro de otro elegido.
 */
export function onScreen(selector: string, max: number) {
  const h = window.innerHeight;
  const picked: HTMLElement[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    if (picked.length >= max) break;
    if (el.closest(SKIP)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 12 || r.bottom < 70 || r.top > h - 30) continue;
    if (picked.some((other) => other.contains(el) || el.contains(other))) continue;
    picked.push(el);
  }
  return picked;
}

/**
 * Todo lo que se ve, como "piezas": se muestrea la pantalla en una
 * cuadricula y, en cada punto, se sube desde el elemento de encima hasta
 * el bloque mas grande que siga siendo una pieza (una tarjeta, un titulo,
 * una imagen), nunca una seccion entera. Asi se rompe todo lo visible,
 * cajas incluidas, y no solo lo que encaje en una lista de etiquetas.
 */
export function piecesOnScreen(max = 32) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const area = w * h;
  const cols = w < 640 ? 4 : 7;
  const rows = 6;
  const found = new Set<HTMLElement>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5) / cols) * w;
      const y = 80 + ((r + 0.5) / rows) * (h - 100);
      const hit = document
        .elementsFromPoint(x, y)
        .find((el) => el instanceof HTMLElement && !el.closest(SKIP) && el.closest("main, footer")) as HTMLElement | undefined;
      if (!hit) continue;
      let piece: HTMLElement | null = null;
      for (let el: HTMLElement | null = hit; el && !/^(MAIN|FOOTER|BODY|SECTION)$/.test(el.tagName); el = el.parentElement) {
        const rect = el.getBoundingClientRect();
        if (rect.width * rect.height > area * 0.2 || rect.width > w * 0.92) break;
        if (rect.width >= 16 && rect.height >= 10) piece = el;
      }
      if (piece) found.add(piece);
    }
  }
  // Sin anidados: si se rompe la tarjeta, su texto va con ella.
  const list = [...found];
  return list.filter((el) => !list.some((other) => other !== el && other.contains(el))).slice(0, max);
}

/** El elemento mas "golpeable" cerca del centro de la pantalla. */
export function centerTarget() {
  const pieces = piecesOnScreen(24);
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  let best: HTMLElement | null = null;
  let score = -Infinity;
  for (const el of pieces) {
    const r = el.getBoundingClientRect();
    const size = Math.min(r.width * r.height, 160000);
    const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
    const value = size / 1000 - d / 6;
    if (value > score) {
      score = value;
      best = el;
    }
  }
  return best;
}

/** Onomatopeya suelta en un punto de la pantalla. */
export function pop(text: string, x: number, y: number, className = "power-pop-word", life = 900) {
  const node = layer(className, true);
  node.textContent = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.setProperty("--pop-rotate", `${Math.round(rand(-12, 12))}deg`);
  window.setTimeout(() => node.remove(), life);
  return node;
}

/** Sacude el contenido (no la capa del Stand, que es fija). */
export function quake(ms: number, reducedMotion: boolean, strong = false) {
  const main = document.querySelector("main");
  if (!main || reducedMotion) return;
  const className = strong ? "power-quake-strong" : "power-quake";
  main.classList.add(className);
  window.setTimeout(() => main.classList.remove(className), ms);
}

/** Clase temporal en un elemento, con limpieza garantizada. */
export function flash(el: Element, className: string, ms: number) {
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}

/** Variables CSS en un elemento que se borran al terminar. */
export function setVars(el: HTMLElement, vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) el.style.setProperty(key, value);
  return () => {
    for (const key of Object.keys(vars)) el.style.removeProperty(key);
  };
}

/** Pone la capa del Stand por encima de los efectos mientras dura. */
export function standInFront(on: boolean) {
  document.documentElement.classList.toggle("stand-front", on);
}

/** Acelera (o invierte) todas las animaciones de la pagina; devuelve como deshacerlo. */
export function retime(rate: number, except?: Element) {
  const touched = new Set<Animation>();
  const apply = (next: number) => {
    for (const animation of document.getAnimations()) {
      // Solo lo que esta corriendo: invertir una entrada ya terminada la esconderia.
      if (animation.playState !== "running") continue;
      const target = (animation.effect as KeyframeEffect | null)?.target;
      if (target && (except?.contains(target) || target.closest?.(".stand-layer, .power-live"))) continue;
      animation.updatePlaybackRate(next);
      touched.add(animation);
    }
  };
  apply(rate);
  return {
    set: apply,
    restore() {
      touched.forEach((animation) => animation.updatePlaybackRate(1));
    },
  };
}
