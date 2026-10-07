/* editorial-ui · Cristian Pérez · cristianperez.me */

import type { PowerId } from "./lines";

/**
 * Poderes prestados que el mini Stand usa sobre la pagina. Todos son
 * efectos visuales encima del contenido (capas fijas, clases que se
 * quitan solas): nada se borra ni se mueve de verdad, salvo los dos que
 * llevan a otra parte de la pagina (Bites the Dust y King Crimson), y
 * esos solo cuando quien visita lo pide en la conversacion.
 *
 * Con reduced motion cada poder hace lo minimo: sin destellos, sin
 * sacudidas, saltos instantaneos.
 */

export interface PowerContext {
  /** Punto de origen (el Stand), en px de la ventana. */
  x: number;
  y: number;
  reducedMotion: boolean;
  /** Elemento sobre el que esta posado (Crazy Diamond lo usa). */
  target: Element | null;
  /** Donde estaba el scroll hace unos segundos (Bites the Dust). */
  pastScroll: number;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function layer(className: string) {
  const node = document.createElement("div");
  node.className = className;
  node.setAttribute("aria-hidden", "true");
  document.body.appendChild(node);
  return node;
}

function scrollToY(y: number, immediate: boolean) {
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.3, force: true });
  else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

function sections() {
  return [...document.querySelectorAll("main > section[id], main > div > section[id], footer[id]")].filter(
    (el) => (el as HTMLElement).offsetHeight > 0,
  );
}

/** ZA WARUDO: esfera que invierte la pagina y congela todos los bucles. */
async function zaWarudo(ctx: PowerContext) {
  const root = document.documentElement;
  /*
    Dos capas: la esfera mezcla en "difference" con la pagina, y para eso
    la mezcla va en la propia capa fija (una capa con z-index aisla a sus
    hijos y la esfera se mezclaria con nada: se veria blanca). El texto
    va en otra capa, sin mezclar.
  */
  const blend = ctx.reducedMotion ? null : layer("power-zw power-zw-blend");
  if (blend) {
    const sphere = document.createElement("span");
    sphere.className = "power-zw-sphere";
    sphere.style.left = `${ctx.x}px`;
    sphere.style.top = `${ctx.y}px`;
    blend.appendChild(sphere);
  }
  const node = layer("power-zw");
  const text = document.createElement("span");
  text.className = "power-zw-text";
  text.textContent = "時よ止まれ!";
  node.appendChild(text);
  root.classList.add("time-stopped");
  await wait(ctx.reducedMotion ? 1200 : 2600);
  root.classList.remove("time-stopped");
  node.classList.add("is-leaving");
  blend?.classList.add("is-leaving");
  await wait(400);
  node.remove();
  blend?.remove();
}

/** Crazy Diamond: lo rompe a golpes y lo deja como nuevo. */
async function crazyDiamond(ctx: PowerContext) {
  const target = (ctx.target ?? document.querySelector("main h2")) as HTMLElement | null;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const node = layer("power-cd");
  Object.assign(node.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  // Grietas desde un punto de impacto, dibujadas en SVG.
  const ix = rect.width * 0.62;
  const iy = rect.height * 0.5;
  const cracks = Array.from({ length: 7 }, (_, i) => {
    const angle = (i / 7) * Math.PI * 2 + 0.4;
    const len = Math.max(rect.width, rect.height) * (0.35 + (i % 3) * 0.12);
    const mx = ix + Math.cos(angle) * len * 0.5 + (i % 2 ? 8 : -8);
    const my = iy + Math.sin(angle) * len * 0.5;
    return `M${ix},${iy} L${mx},${my} L${ix + Math.cos(angle) * len},${iy + Math.sin(angle) * len}`;
  });
  node.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${rect.width} ${rect.height}" preserveAspectRatio="none">${cracks
    .map((d) => `<path d="${d}" pathLength="1"/>`)
    .join("")}</svg><span class="power-cd-sfx">ドラララ!</span>`;
  if (!ctx.reducedMotion) target.classList.add("power-shatter");
  await wait(1300);
  target.classList.remove("power-shatter");
  node.classList.add("is-healing");
  if (!ctx.reducedMotion) target.classList.add("power-healed");
  await wait(800);
  target.classList.remove("power-healed");
  node.remove();
}

/** Echoes: onomatopeyas pegadas a lo que hay en pantalla. */
async function echoes(ctx: PowerContext) {
  const words = ["ドドド", "バァーン", "ゴゴゴ", "ズキュウウン", "メメタァ", "ドギャーン"];
  const candidates = [...document.querySelectorAll("main h2, main h3, main a.accent-fill, footer a.accent-fill, main img")]
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.top > 70 && r.bottom < window.innerHeight - 20 && r.width > 40)
    .slice(0, 6);
  const nodes = candidates.map((rect, i) => {
    const node = layer("power-echo");
    node.textContent = words[i % words.length];
    node.style.left = `${Math.min(window.innerWidth - 140, rect.left + rect.width * (0.2 + (i % 3) * 0.25))}px`;
    node.style.top = `${rect.top - 14}px`;
    node.style.setProperty("--echo-rotate", `${((i * 37) % 30) - 15}deg`);
    node.style.animationDelay = ctx.reducedMotion ? "0s" : `${i * 120}ms`;
    return node;
  });
  await wait(3400);
  nodes.forEach((node) => node.classList.add("is-leaving"));
  await wait(450);
  nodes.forEach((node) => node.remove());
}

/** Hermit Purple: espinas moradas que salen del Stand. Las frases las pone el Stand. */
async function hermit(ctx: PowerContext) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const node = layer("power-hermit");
  const vines = [0, 1, 2, 3].map((i) => {
    const tx = i % 2 ? w * (0.1 + i * 0.12) : w * (0.85 - i * 0.15);
    const ty = i < 2 ? h * 0.1 : h * 0.92;
    const cx = (ctx.x + tx) / 2 + (i % 2 ? 120 : -120);
    const cy = (ctx.y + ty) / 2 + (i < 2 ? -80 : 80);
    return `<path d="M${ctx.x},${ctx.y} Q${cx},${cy} ${tx},${ty}" pathLength="1"/>`;
  });
  node.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${vines.join("")}</svg>`;
  await wait(ctx.reducedMotion ? 1500 : 2600);
  node.classList.add("is-leaving");
  await wait(500);
  node.remove();
}

/** Bites the Dust: rebobina hasta donde estabas hace unos segundos. */
async function bitesTheDust(ctx: PowerContext) {
  const node = layer("power-btd");
  node.innerHTML = `<span class="power-btd-text">BITES THE DUST</span>`;
  await wait(ctx.reducedMotion ? 200 : 450);
  // Si no hay a donde volver, a la seccion anterior.
  let target = ctx.pastScroll;
  if (Math.abs(target - window.scrollY) < window.innerHeight * 0.5) {
    const above = sections().filter((el) => el.getBoundingClientRect().top < -40);
    target = above.length ? above[above.length - 1].getBoundingClientRect().top + window.scrollY : 0;
  }
  scrollToY(target, ctx.reducedMotion);
  await wait(ctx.reducedMotion ? 600 : 1500);
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
}

/** King Crimson: se salta el tiempo hasta la siguiente seccion. */
async function kingCrimson(ctx: PowerContext) {
  const node = layer("power-kc");
  await wait(ctx.reducedMotion ? 100 : 380);
  const next = sections().find((el) => el.getBoundingClientRect().top > 60);
  if (next) scrollToY(next.getBoundingClientRect().top + window.scrollY, true);
  await wait(ctx.reducedMotion ? 300 : 700);
  node.classList.add("is-leaving");
  await wait(450);
  node.remove();
}

const POWERS: Record<PowerId, (ctx: PowerContext) => Promise<void>> = {
  zawarudo: zaWarudo,
  crazydiamond: crazyDiamond,
  echoes,
  hermit,
  bitesthedust: bitesTheDust,
  kingcrimson: kingCrimson,
};

export const POWER_IDS = Object.keys(POWERS) as PowerId[];

export function runPower(id: PowerId, ctx: PowerContext) {
  return POWERS[id](ctx);
}
