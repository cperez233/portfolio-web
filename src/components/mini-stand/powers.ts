/* editorial-ui · Cristian Pérez · cristianperez.me */

import type { PowerId } from "./lines";

/**
 * Poderes prestados que el mini Stand usa sobre la pagina. Todos son
 * efectos visuales encima del contenido (capas fijas, clases que se
 * quitan solas, siempre en un finally): nada se borra ni se mueve de
 * verdad, salvo los dos que
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

/**
 * Elementos de la pagina que se ven ahora mismo (sin menu ni dialogos),
 * sin repetir uno que ya este dentro de otro elegido.
 */
function onScreen(selector: string, max: number) {
  const h = window.innerHeight;
  const picked: HTMLElement[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(selector)) {
    if (picked.length >= max) break;
    if (el.closest("header, nav, [role='dialog'], .stand-layer, [aria-hidden='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 12 || r.bottom < 70 || r.top > h - 30) continue;
    if (picked.some((other) => other.contains(el) || el.contains(other))) continue;
    picked.push(el);
  }
  return picked;
}

/** Onomatopeya suelta en un punto de la pantalla. */
function pop(text: string, x: number, y: number, className = "power-pop-word", life = 900) {
  const node = layer(className);
  node.textContent = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.setProperty("--pop-rotate", `${Math.round(Math.random() * 24 - 12)}deg`);
  window.setTimeout(() => node.remove(), life);
  return node;
}

/** Sacude el contenido (no la capa del Stand, que es fija). */
function quake(ms: number, reducedMotion: boolean) {
  const main = document.querySelector("main");
  if (!main || reducedMotion) return;
  main.classList.add("power-quake");
  window.setTimeout(() => main.classList.remove("power-quake"), ms);
}

/** Telarana de grietas desde un punto, hasta los bordes de la pantalla. */
function crackWeb(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const reach = Math.hypot(w, h);
  const branches = 11;
  const rays: [number, number][][] = [];
  const paths: string[] = [];
  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2 + Math.random() * 0.35;
    const points: [number, number][] = [[x, y]];
    let r = 0;
    while (r < reach) {
      r += 50 + Math.random() * 90;
      const jitter = (Math.random() - 0.5) * 0.28;
      points.push([x + Math.cos(angle + jitter) * r, y + Math.sin(angle + jitter) * r]);
    }
    rays.push(points);
    paths.push(`M${points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" L")}`);
  }
  // Anillos entre ramas vecinas: lo que hace que parezca vidrio roto.
  for (const ring of [1, 2, 4]) {
    for (let i = 0; i < branches; i++) {
      const a = rays[i][ring];
      const b = rays[(i + 1) % branches][ring];
      if (a && b && Math.random() < 0.75) paths.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
    }
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths
    .map((d, i) => `<path d="${d}" pathLength="1" style="animation-delay:${i < branches ? 0 : 0.25}s"/>`)
    .join("")}</svg>`;
}

/**
 * Crazy Diamond: rompe a golpes lo que tienes en pantalla (una telarana
 * de grietas sobre todo y los elementos visibles saltando en pedazos) y
 * lo deja como nuevo. Antes rompia solo el titulo donde estaba posado, y
 * si ese titulo no estaba a la vista no se veia nada.
 */
async function crazyDiamond(ctx: PowerContext) {
  const pieces = onScreen("main h2, main h3, main p, main img, main a.accent-fill, main li, main button, footer h2, footer p", 12);
  const h = window.innerHeight;
  // El golpe cae donde esta el Stand, pero dentro de la pantalla.
  const ix = Math.min(window.innerWidth - 40, Math.max(40, ctx.x));
  const iy = Math.min(h - 60, Math.max(90, ctx.y));
  const node = layer("power-cd");
  node.innerHTML = crackWeb(ix, iy);

  // Rafaga de DORA alrededor del impacto.
  if (!ctx.reducedMotion) {
    for (let i = 0; i < 7; i++) {
      window.setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 120;
        pop("ドラ", ix + Math.cos(angle) * dist, iy + Math.sin(angle) * dist * 0.6, "power-pop-word is-pink", 700);
      }, i * 90);
    }
  }
  quake(900, ctx.reducedMotion);

  const main = document.querySelector("main");
  try {
    await wait(ctx.reducedMotion ? 150 : 520);
    pop("ドラァ!", ix, iy - 40, "power-pop-word is-pink is-big", 1300);
    if (!ctx.reducedMotion) {
      main?.classList.add("power-cd-broken");
      for (const el of pieces) {
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - ix;
        const dy = r.top + r.height / 2 - iy;
        const d = Math.max(60, Math.hypot(dx, dy));
        const push = 18 + Math.random() * 26;
        el.style.setProperty("--cd-x", `${((dx / d) * push).toFixed(1)}px`);
        el.style.setProperty("--cd-y", `${((dy / d) * push + 6).toFixed(1)}px`);
        el.style.setProperty("--cd-r", `${(Math.random() * 10 - 5).toFixed(1)}deg`);
        el.classList.add("power-broken");
      }
    }
    await wait(1300);
    // Arreglado: todo vuelve a su sitio con un brillo rosa.
    node.classList.add("is-healing");
    for (const el of pieces) {
      el.classList.remove("power-broken");
      if (!ctx.reducedMotion) el.classList.add("power-healed");
    }
    main?.classList.remove("power-cd-broken");
    if (!ctx.reducedMotion) {
      pieces.slice(0, 6).forEach((el, i) => {
        const r = el.getBoundingClientRect();
        window.setTimeout(() => pop("✦", r.left + r.width * Math.random(), r.top + r.height / 2, "power-sparkle", 900), i * 70);
      });
    }
    await wait(900);
  } finally {
    main?.classList.remove("power-cd-broken");
    for (const el of pieces) {
      el.classList.remove("power-broken", "power-healed");
      el.style.removeProperty("--cd-x");
      el.style.removeProperty("--cd-y");
      el.style.removeProperty("--cd-r");
    }
    node.remove();
  }
}

/** Star Platinum: rafaga de punos desde el Stand. */
async function starPlatinum(ctx: PowerContext) {
  const node = layer("power-sp");
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Golpea hacia el centro de la pantalla.
  const aim = Math.atan2(h / 2 - ctx.y, w / 2 - ctx.x);
  const count = ctx.reducedMotion ? 6 : 28;
  for (let i = 0; i < count; i++) {
    const fist = document.createElement("span");
    fist.className = "power-fist";
    const angle = aim + (Math.random() - 0.5) * 1.1;
    const dist = 90 + Math.random() * Math.min(260, w * 0.35);
    fist.style.left = `${ctx.x}px`;
    fist.style.top = `${ctx.y}px`;
    fist.style.setProperty("--fx", `${(Math.cos(angle) * dist).toFixed(0)}px`);
    fist.style.setProperty("--fy", `${(Math.sin(angle) * dist).toFixed(0)}px`);
    fist.style.setProperty("--fa", `${angle.toFixed(2)}rad`);
    fist.style.animationDelay = `${i * 48}ms`;
    node.appendChild(fist);
  }
  const text = document.createElement("span");
  text.className = "power-sp-text";
  text.textContent = "オラオラオラオラ!";
  node.appendChild(text);
  quake(count * 48 + 300, ctx.reducedMotion);
  await wait(count * 48 + 450);
  pop("オラァ!", w / 2, h * 0.42, "power-pop-word is-big", 1100);
  await wait(700);
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
}

/** Gold Experience: le da vida a la pagina (hojas y mariquitas). */
async function goldExperience(ctx: PowerContext) {
  const sources = onScreen("main img, main h2, main h3, main p, main a.accent-fill, footer h2", 8);
  const origins = sources.length
    ? sources.map((el) => el.getBoundingClientRect())
    : [new DOMRect(ctx.x - 20, ctx.y - 20, 40, 40)];
  const node = layer("power-ge");
  const kinds = ["power-leaf", "power-bug", "power-leaf", "power-flower"];
  origins.forEach((r, i) => {
    for (let j = 0; j < 5; j++) {
      const item = document.createElement("span");
      item.className = kinds[(i + j) % kinds.length];
      item.style.left = `${r.left + r.width * (0.15 + Math.random() * 0.7)}px`;
      item.style.top = `${r.top + r.height * (0.3 + Math.random() * 0.5)}px`;
      item.style.setProperty("--gx", `${Math.round((Math.random() - 0.5) * 120)}px`);
      item.style.setProperty("--gy", `${Math.round(-60 - Math.random() * 120)}px`);
      item.style.setProperty("--gr", `${Math.round((Math.random() - 0.5) * 540)}deg`);
      item.style.animationDelay = ctx.reducedMotion ? "0s" : `${i * 110 + j * 70}ms`;
      node.appendChild(item);
    }
  });
  await wait(ctx.reducedMotion ? 1500 : 2900);
  node.classList.add("is-leaving");
  await wait(450);
  node.remove();
}

/**
 * Soft & Wet: burbujas que suben por la pantalla y se revientan al
 * tocarlas. Devuelve true si no se escapo ninguna.
 */
async function softWet(ctx: PowerContext) {
  const node = layer("power-sw");
  const w = window.innerWidth;
  const total = w < 640 ? 6 : 9;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let popped = 0;
  let finish: (all: boolean) => void = () => {};
  const done = new Promise<boolean>((resolve) => (finish = resolve));
  for (let i = 0; i < total; i++) {
    const bubble = document.createElement("span");
    bubble.className = "power-bubble";
    const size = 46 + Math.random() * 40;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${((i + 0.5) / total) * (w - size) + (Math.random() - 0.5) * 30}px`;
    bubble.style.setProperty("--sway", `${Math.round((Math.random() - 0.5) * 80)}px`);
    bubble.style.animationDelay = ctx.reducedMotion ? "0s" : `${Math.round(Math.random() * 1400)}ms`;
    bubble.style.animationDuration = `${6 + Math.random() * 2.5}s`;
    const burst = () => {
      if (bubble.classList.contains("is-popped")) return;
      const r = bubble.getBoundingClientRect();
      bubble.classList.add("is-popped");
      pop("パチン", r.left + r.width / 2, r.top + r.height / 2, "power-pop-word is-blue", 700);
      window.setTimeout(() => bubble.remove(), 300);
      popped += 1;
      if (popped === total) finish(true);
    };
    bubble.addEventListener("pointerdown", burst);
    if (fine) bubble.addEventListener("pointerenter", burst);
    node.appendChild(bubble);
  }
  const timer = window.setTimeout(() => finish(false), 9200);
  const all = await done;
  window.clearTimeout(timer);
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
  return all;
}

/** Made in Heaven: el tiempo acelera; todas las animaciones van a 5x. */
async function madeInHeaven(ctx: PowerContext) {
  const node = layer("power-mih");
  node.innerHTML = `<span class="power-mih-lines"></span><span class="power-mih-clock"><i></i><i></i></span><span class="power-mih-text">時は加速する</span>`;
  const sped = new Set<Animation>();
  const speedUp = () => {
    for (const animation of document.getAnimations()) {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      if (target && node.contains(target)) continue;
      animation.playbackRate = 5;
      sped.add(animation);
    }
  };
  let interval = 0;
  if (!ctx.reducedMotion) {
    speedUp();
    interval = window.setInterval(speedUp, 250);
  }
  try {
    await wait(ctx.reducedMotion ? 1400 : 3400);
  } finally {
    window.clearInterval(interval);
    sped.forEach((animation) => {
      animation.playbackRate = 1;
    });
  }
  node.classList.add("is-leaving");
  await wait(400);
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

/** Cada poder termina cuando acaba su efecto; true si salio "redondo". */
const POWERS: Record<PowerId, (ctx: PowerContext) => Promise<boolean | void>> = {
  zawarudo: zaWarudo,
  starplatinum: starPlatinum,
  crazydiamond: crazyDiamond,
  goldexperience: goldExperience,
  echoes,
  softwet: softWet,
  hermit,
  madeinheaven: madeInHeaven,
  bitesthedust: bitesTheDust,
  kingcrimson: kingCrimson,
};

export const POWER_IDS = Object.keys(POWERS) as PowerId[];

export function runPower(id: PowerId, ctx: PowerContext) {
  return POWERS[id](ctx);
}
