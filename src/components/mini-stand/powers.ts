/* editorial-ui · Cristian Pérez · cristianperez.me */

import type { PowerId, StandLines } from "./lines";
import { stopTime } from "@/lib/time-stop";
import {
  centerTarget,
  layer,
  onScreen,
  piecesOnScreen,
  pop,
  quake,
  rand,
  retime,
  scrollToY,
  sections,
  setVars,
  standInFront,
  wait,
} from "./power-kit";

/**
 * Poderes prestados que el mini Stand usa sobre la pagina. Todos son
 * efectos visuales encima del contenido (capas fijas, clases que se
 * quitan solas, siempre en un finally): nada se borra ni se mueve de
 * verdad, salvo los dos que llevan a otra parte de la pagina (Bites the
 * Dust y King Crimson), y esos solo cuando quien visita lo pide.
 *
 * Varios tienen variantes (Star Platinum, Gold Experience, Echoes): el
 * Stand elige una distinta cada vez.
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
  /** Variante elegida (ver POWER_VARIANTS). */
  variant?: string;
  /** Hermit Purple: filas de la foto de espiritu. */
  photo?: { title: string; rows: [string, string][] };
  /** Made in Heaven: el universo anterior. */
  universe?: StandLines["universe"];
  /** Made in Heaven: el Stand frena el reinicio (habla y posa). */
  onStop?: () => void;
}

export const POWER_VARIANTS: Partial<Record<PowerId, string[]>> = {
  starplatinum: ["rush", "finger", "world"],
  goldexperience: ["garden", "tree", "frog", "butterflies", "snake"],
  echoes: ["act1", "act2", "act3"],
};

let uid = 0;

/* ------------------------------------------------------------------ */
/* ZA WARUDO                                                           */
/* ------------------------------------------------------------------ */

/**
 * ZA WARUDO: esfera que invierte la pagina y detiene el tiempo de verdad
 * (lib/time-stop): nadie se mueve, tampoco quien visita. El Stand si: lo
 * que hace mientras tanto (burlarse, lanzar cuchillos, cambiar de sitio)
 * vive en mini-stand, porque tambien pasa con el toque del retrato.
 */
async function zaWarudo(ctx: PowerContext) {
  const ms = ctx.reducedMotion ? 1600 : 4800;
  const resumed = stopTime(ms);
  /*
    Dos capas: la esfera mezcla en "difference" con la pagina, y para eso
    la mezcla va en la propia capa fija (una capa con z-index aisla a sus
    hijos y la esfera se mezclaria con nada: se veria blanca). El texto
    va en otra capa, sin mezclar. Se crean despues de detener el tiempo
    para que sus animaciones no queden en pausa.
  */
  const blend = ctx.reducedMotion ? null : layer("power-zw power-zw-blend", true);
  if (blend) {
    const sphere = document.createElement("span");
    sphere.className = "power-zw-sphere";
    sphere.style.left = `${ctx.x}px`;
    sphere.style.top = `${ctx.y}px`;
    sphere.style.animationDuration = `${ms + 300}ms`;
    blend.appendChild(sphere);
  }
  const node = layer("power-zw", true);
  node.innerHTML = `<span class="power-zw-text">時よ止まれ!</span>`;
  await resumed;
  node.innerHTML = `<span class="power-zw-text is-resume">時は動き出す</span>`;
  await wait(700);
  node.classList.add("is-leaving");
  blend?.classList.add("is-leaving");
  await wait(400);
  node.remove();
  blend?.remove();
}

/* ------------------------------------------------------------------ */
/* Star Platinum                                                       */
/* ------------------------------------------------------------------ */

function impact(x: number, y: number, big = false) {
  const node = layer(big ? "power-impact is-big" : "power-impact", true);
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.rotate = `${Math.round(rand(0, 90))}deg`;
  window.setTimeout(() => node.remove(), 500);
}

function fist(node: HTMLElement, fromX: number, fromY: number, toX: number, toY: number, delay: number, ms = 260) {
  const el = document.createElement("span");
  el.className = "power-fist";
  el.style.left = `${toX}px`;
  el.style.top = `${toY}px`;
  el.style.setProperty("--dx", `${Math.round(fromX - toX)}px`);
  el.style.setProperty("--dy", `${Math.round(fromY - toY)}px`);
  el.style.setProperty("--fa", `${Math.atan2(toY - fromY, toX - fromX).toFixed(2)}rad`);
  el.style.animationDelay = `${delay}ms`;
  el.style.animationDuration = `${ms}ms`;
  node.appendChild(el);
  window.setTimeout(() => el.remove(), delay + ms + 50);
}

function speedLines(x: number, y: number) {
  const node = layer("power-speedlines", true);
  node.style.setProperty("--sx", `${x}px`);
  node.style.setProperty("--sy", `${y}px`);
  return node;
}

/** Rush: los punos viajan del Stand al blanco, que tiembla y al final sale volando. */
async function oraRush(ctx: PowerContext, target: HTMLElement, count: number, step: number) {
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const node = layer("power-sp", true);
  const lines = ctx.reducedMotion ? null : speedLines(cx, cy);
  const aura = document.createElement("span");
  aura.className = "power-sp-aura";
  aura.style.left = `${ctx.x}px`;
  aura.style.top = `${ctx.y}px`;
  node.appendChild(aura);
  target.classList.add("power-hit");
  for (let i = 0; i < count; i++) {
    const tx = r.left + r.width * rand(0.1, 0.9);
    const ty = r.top + r.height * rand(0.15, 0.85);
    const fromX = ctx.x + rand(-30, 30);
    const fromY = ctx.y + rand(-30, 30);
    fist(node, fromX, fromY, tx, ty, i * step);
    window.setTimeout(() => {
      impact(tx, ty);
      if (i % 6 === 0) pop("オラ", tx + rand(-40, 40), ty - rand(10, 50), "power-pop-word is-purple", 600);
    }, i * step + 200);
  }
  quake(count * step + 300, ctx.reducedMotion);
  await wait(count * step + 260);
  // El ultimo: オラァ! y sale despedido.
  impact(cx, cy, true);
  pop("オラァ!", cx, cy - 30, "power-pop-word is-purple is-big", 1100);
  target.classList.remove("power-hit");
  const dx = cx - ctx.x;
  const dy = cy - ctx.y;
  const d = Math.max(1, Math.hypot(dx, dy));
  const clear = setVars(target, {
    "--knock-x": `${((dx / d) * 46).toFixed(0)}px`,
    "--knock-y": `${((dy / d) * 30).toFixed(0)}px`,
    "--knock-r": `${rand(-6, 6).toFixed(1)}deg`,
  });
  target.classList.add("power-knocked");
  await wait(320);
  target.classList.remove("power-knocked");
  target.classList.add("power-healed-soft");
  await wait(700);
  target.classList.remove("power-healed-soft");
  clear();
  node.classList.add("is-leaving");
  lines?.classList.add("is-leaving");
  await wait(350);
  node.remove();
  lines?.remove();
}

/** Star Finger: el dedo se estira hasta el blanco y lo pincha. */
async function starFinger(ctx: PowerContext, target: HTMLElement) {
  const r = target.getBoundingClientRect();
  const tx = r.left + r.width / 2;
  const ty = r.top + r.height / 2;
  const node = layer("power-sp", true);
  const finger = document.createElement("span");
  finger.className = "power-finger";
  finger.style.left = `${ctx.x}px`;
  finger.style.top = `${ctx.y}px`;
  finger.style.setProperty("--len", `${Math.hypot(tx - ctx.x, ty - ctx.y).toFixed(0)}px`);
  finger.style.rotate = `${Math.atan2(ty - ctx.y, tx - ctx.x).toFixed(3)}rad`;
  node.appendChild(finger);
  await wait(ctx.reducedMotion ? 50 : 260);
  impact(tx, ty, true);
  pop("ズギュン!", tx, ty - 40, "power-pop-word is-purple is-big", 1000);
  target.classList.add("power-poked");
  quake(250, ctx.reducedMotion);
  await wait(650);
  finger.classList.add("is-back");
  target.classList.remove("power-poked");
  await wait(320);
  node.remove();
}

/** Star Platinum: The World: tiempo detenido, golpes que caen al reanudarse. */
async function starWorld(ctx: PowerContext, target: HTMLElement) {
  const r = target.getBoundingClientRect();
  const resumed = stopTime(ctx.reducedMotion ? 900 : 2200);
  const tint = layer("power-spw", true);
  tint.innerHTML = `<span class="power-spw-text">スタープラチナ・ザ・ワールド</span>`;
  const node = layer("power-sp", true);
  const points: [number, number][] = [];
  const count = ctx.reducedMotion ? 3 : 12;
  for (let i = 0; i < count; i++) {
    const tx = r.left + r.width * rand(0.1, 0.9);
    const ty = r.top + r.height * rand(0.15, 0.85);
    points.push([tx, ty]);
    // Con el tiempo quieto, los punos quedan clavados en el aire.
    const held = document.createElement("span");
    held.className = "power-fist is-held";
    held.style.left = `${tx + rand(-40, 40)}px`;
    held.style.top = `${ty + rand(-40, 40)}px`;
    held.style.setProperty("--fa", `${Math.atan2(ty - ctx.y, tx - ctx.x).toFixed(2)}rad`);
    held.style.animationDelay = `${i * 110}ms`;
    node.appendChild(held);
  }
  await resumed;
  tint.classList.add("is-leaving");
  node.querySelectorAll(".power-fist").forEach((el) => el.remove());
  // Todos los golpes llegan a la vez: ドドドド.
  points.forEach(([x, y], i) => window.setTimeout(() => impact(x, y), i * 25));
  pop("ドドドド!", r.left + r.width / 2, r.top - 10, "power-pop-word is-purple is-big", 1100);
  target.classList.add("power-hit");
  quake(500, ctx.reducedMotion, true);
  await wait(600);
  target.classList.remove("power-hit");
  tint.remove();
  node.remove();
}

async function starPlatinum(ctx: PowerContext) {
  const target = centerTarget();
  if (!target) return;
  if (ctx.variant === "finger") return starFinger(ctx, target);
  if (ctx.variant === "world") return starWorld(ctx, target);
  return oraRush(ctx, target, ctx.reducedMotion ? 6 : 34, 50);
}

/* ------------------------------------------------------------------ */
/* Crazy Diamond                                                       */
/* ------------------------------------------------------------------ */

/** Telarana de grietas desde un punto, hasta los bordes de la pantalla. */
function crackWeb(x: number, y: number) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const reach = Math.hypot(w, h);
  const branches = 12;
  const rays: [number, number][][] = [];
  const paths: string[] = [];
  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2 + Math.random() * 0.35;
    const points: [number, number][] = [[x, y]];
    let r = 0;
    while (r < reach) {
      r += rand(50, 140);
      const jitter = rand(-0.14, 0.14);
      points.push([x + Math.cos(angle + jitter) * r, y + Math.sin(angle + jitter) * r]);
    }
    rays.push(points);
    paths.push(`M${points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" L")}`);
  }
  // Anillos entre ramas vecinas: lo que hace que parezca vidrio roto.
  for (const ring of [1, 2, 3, 5]) {
    for (let i = 0; i < branches; i++) {
      const a = rays[i][ring];
      const b = rays[(i + 1) % branches][ring];
      if (a && b && Math.random() < 0.8) paths.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
    }
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths
    .map((d, i) => `<path d="${d}" pathLength="1" style="animation-delay:${i < branches ? 0 : 0.22}s"/>`)
    .join("")}</svg>`;
}

/** Recorte de pieza rota: un poligono con un mordisco en un borde. */
function jagged() {
  const bite = rand(0.15, 0.4);
  const at = Math.floor(rand(0, 4));
  const edges = [
    `0% 0%, ${rand(30, 45)}% 0%, ${rand(45, 55)}% ${bite * 100}%, ${rand(55, 70)}% 0%, 100% 0%, 100% 100%, 0% 100%`,
    `0% 0%, 100% 0%, 100% ${rand(30, 45)}%, ${100 - bite * 100}% ${rand(45, 55)}%, 100% ${rand(55, 70)}%, 100% 100%, 0% 100%`,
    `0% 0%, 100% 0%, 100% 100%, ${rand(55, 70)}% 100%, ${rand(45, 55)}% ${100 - bite * 100}%, ${rand(30, 45)}% 100%, 0% 100%`,
    `0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${rand(55, 70)}%, ${bite * 100}% ${rand(45, 55)}%, 0% ${rand(30, 45)}%`,
  ];
  return `polygon(${edges[at]})`;
}

/**
 * Crazy Diamond: rompe a golpes todo lo que hay en pantalla (telarana de
 * grietas y cada pieza visible saltando, con un mordisco) y lo arregla
 * pieza a pieza.
 */
async function crazyDiamond(ctx: PowerContext) {
  const pieces = piecesOnScreen(36);
  const h = window.innerHeight;
  const ix = Math.min(window.innerWidth - 40, Math.max(40, ctx.x));
  const iy = Math.min(h - 60, Math.max(90, ctx.y));
  const node = layer("power-cd", true);
  node.innerHTML = crackWeb(ix, iy);

  if (!ctx.reducedMotion) {
    for (let i = 0; i < 9; i++) {
      window.setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = rand(40, 170);
        pop("ドラ", ix + Math.cos(angle) * dist, iy + Math.sin(angle) * dist * 0.6, "power-pop-word is-pink", 700);
        impact(ix + Math.cos(angle) * dist * 0.5, iy + Math.sin(angle) * dist * 0.4);
      }, i * 80);
    }
  }
  quake(1000, ctx.reducedMotion, true);

  const main = document.querySelector("main");
  const clears: (() => void)[] = [];
  try {
    await wait(ctx.reducedMotion ? 150 : 560);
    pop("ドラァ!", ix, iy - 40, "power-pop-word is-pink is-big", 1300);
    if (!ctx.reducedMotion) {
      main?.classList.add("power-cd-broken");
      pieces.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - ix;
        const dy = r.top + r.height / 2 - iy;
        const d = Math.max(60, Math.hypot(dx, dy));
        // Lo cercano al golpe salta mas.
        const push = rand(16, 30) * Math.min(1.8, 420 / d + 0.6);
        clears.push(
          setVars(el, {
            "--cd-x": `${((dx / d) * push).toFixed(1)}px`,
            "--cd-y": `${((dy / d) * push + 8).toFixed(1)}px`,
            "--cd-r": `${rand(-7, 7).toFixed(1)}deg`,
            "--cd-clip": i % 3 === 2 ? "none" : jagged(),
            "--cd-delay": `${Math.round(Math.min(260, d / 4))}ms`,
            "--cd-heal-delay": `${Math.round(i * 22)}ms`,
          }),
        );
        el.classList.add("power-broken");
      });
    }
    await wait(1400);
    // Arreglado: pieza a pieza, con un brillo rosa.
    node.classList.add("is-healing");
    for (const el of pieces) {
      el.classList.remove("power-broken");
      if (!ctx.reducedMotion) el.classList.add("power-healed");
    }
    main?.classList.remove("power-cd-broken");
    if (!ctx.reducedMotion) {
      pieces.slice(0, 10).forEach((el, i) => {
        const r = el.getBoundingClientRect();
        window.setTimeout(() => pop("✦", r.left + r.width * Math.random(), r.top + r.height / 2, "power-sparkle", 900), i * 60);
      });
    }
    await wait(900 + pieces.length * 22);
  } finally {
    main?.classList.remove("power-cd-broken");
    for (const el of pieces) el.classList.remove("power-broken", "power-healed");
    clears.forEach((clear) => clear());
    node.remove();
  }
}

/* ------------------------------------------------------------------ */
/* Gold Experience                                                     */
/* ------------------------------------------------------------------ */

const FROG = `<svg viewBox="0 0 64 52" width="112" height="91"><g stroke="#161418" stroke-width="3" stroke-linejoin="round"><path d="M8 44 Q2 50 14 50 L20 44Z" fill="#4f9e44"/><path d="M56 44 Q62 50 50 50 L44 44Z" fill="#4f9e44"/><ellipse cx="32" cy="34" rx="24" ry="15" fill="#6fbf5b"/><circle cx="19" cy="17" r="9" fill="#6fbf5b"/><circle cx="45" cy="17" r="9" fill="#6fbf5b"/><circle cx="19" cy="16" r="5" fill="#ece6d8"/><circle cx="45" cy="16" r="5" fill="#ece6d8"/></g><circle cx="20" cy="16" r="2.4" fill="#161418"/><circle cx="46" cy="16" r="2.4" fill="#161418"/><path d="M22 36 Q32 42 42 36" fill="none" stroke="#161418" stroke-width="2.5" stroke-linecap="round"/><circle cx="25" cy="31" r="1.6" fill="#161418"/><circle cx="39" cy="31" r="1.6" fill="#161418"/></svg>`;

const BUTTERFLY = (a: string, b: string) =>
  `<svg viewBox="0 0 40 32" width="58" height="46"><g stroke="#161418" stroke-width="2" stroke-linejoin="round"><g class="wing-l"><path d="M20 16 Q6 0 3 8 Q0 18 20 18Z" fill="${a}"/><path d="M20 18 Q6 30 9 24 Q4 20 20 18Z" fill="${b}"/></g><g class="wing-r"><path d="M20 16 Q34 0 37 8 Q40 18 20 18Z" fill="${a}"/><path d="M20 18 Q34 30 31 24 Q36 20 20 18Z" fill="${b}"/></g></g><rect x="18.5" y="9" width="3" height="16" rx="1.5" fill="#161418"/></svg>`;

/** Jardin: hojas, flores y mariquitas que brotan de lo que se ve. */
async function geGarden(ctx: PowerContext) {
  const sources = onScreen("main img, main h2, main h3, main p, main a.accent-fill, footer h2", 8);
  const origins = sources.length ? sources.map((el) => el.getBoundingClientRect()) : [new DOMRect(ctx.x - 20, ctx.y - 20, 40, 40)];
  const node = layer("power-ge", true);
  const kinds = ["power-leaf", "power-bug", "power-leaf", "power-flower"];
  origins.forEach((r, i) => {
    for (let j = 0; j < 5; j++) {
      const item = document.createElement("span");
      item.className = kinds[(i + j) % kinds.length];
      item.style.left = `${r.left + r.width * rand(0.15, 0.85)}px`;
      item.style.top = `${r.top + r.height * rand(0.3, 0.8)}px`;
      item.style.setProperty("--gx", `${Math.round(rand(-60, 60))}px`);
      item.style.setProperty("--gy", `${Math.round(rand(-180, -60))}px`);
      item.style.setProperty("--gr", `${Math.round(rand(-270, 270))}deg`);
      item.style.animationDelay = ctx.reducedMotion ? "0s" : `${i * 110 + j * 70}ms`;
      node.appendChild(item);
    }
  });
  await wait(ctx.reducedMotion ? 1500 : 2900);
  node.classList.add("is-leaving");
  await wait(450);
  node.remove();
}

/** Un arbol entero que crece desde el borde de abajo. */
async function geTree(ctx: PowerContext) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const node = layer("power-ge", true);
  const tree = document.createElement("div");
  tree.className = "power-tree";
  const size = Math.min(h * 0.72, 520);
  tree.style.height = `${size}px`;
  tree.style.width = `${size * 0.8}px`;
  // Del lado contrario al Stand, para que el lo mire crecer.
  const side = ctx.x > w / 2 ? rand(0.12, 0.3) : rand(0.6, 0.82);
  tree.style.left = `${w * side - size * 0.4}px`;
  const leaves = [
    [160, 120, 62, "#6fbf5b"],
    [100, 165, 50, "#4f9e44"],
    [225, 160, 52, "#4f9e44"],
    [80, 100, 40, "#86d16f"],
    [250, 95, 42, "#86d16f"],
    [165, 60, 46, "#6fbf5b"],
    [130, 215, 36, "#6fbf5b"],
    [205, 220, 36, "#86d16f"],
  ];
  const fruits = [
    [120, 130],
    [200, 120],
    [160, 85],
    [95, 175],
    [235, 175],
  ];
  tree.innerHTML = `<svg viewBox="0 0 320 400" preserveAspectRatio="xMidYMax meet">
    <g class="trunk" fill="none" stroke-linecap="round">
      <path d="M160 400 C152 330 170 270 160 200 M160 280 C190 260 215 230 228 180 M158 250 C130 230 110 205 100 170 M162 215 C150 170 158 120 165 80" stroke="#161418" stroke-width="26" pathLength="1"/>
      <path d="M160 400 C152 330 170 270 160 200 M160 280 C190 260 215 230 228 180 M158 250 C130 230 110 205 100 170 M162 215 C150 170 158 120 165 80" stroke="#8a5a34" stroke-width="18" pathLength="1"/>
    </g>
    ${leaves
      .map(
        ([x, y, r, c], i) =>
          `<circle class="crown" cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#161418" stroke-width="4" style="animation-delay:${0.9 + i * 0.09}s"/>`,
      )
      .join("")}
    ${fruits
      .map(
        ([x, y], i) =>
          `<g class="fruit" style="animation-delay:${1.6 + i * 0.12}s"><circle cx="${x}" cy="${y}" r="9" fill="#e3b341" stroke="#161418" stroke-width="3"/><path d="M${x} ${y - 9} l2 -5" stroke="#161418" stroke-width="2"/></g>`,
      )
      .join("")}
  </svg>`;
  node.appendChild(tree);
  window.setTimeout(() => pop("ニョキ", w * side, h - size * 0.9, "power-pop-word is-green", 900), 600);
  await wait(ctx.reducedMotion ? 1200 : 3200);
  // Caen unas hojas antes de que el arbol vuelva a la tierra.
  for (let i = 0; i < 10; i++) {
    const leaf = document.createElement("span");
    leaf.className = "power-leaf is-falling";
    leaf.style.left = `${w * side + rand(-size * 0.35, size * 0.35)}px`;
    leaf.style.top = `${h - size * rand(0.55, 0.95)}px`;
    leaf.style.setProperty("--gx", `${Math.round(rand(-80, 80))}px`);
    leaf.style.animationDelay = `${i * 80}ms`;
    node.appendChild(leaf);
  }
  await wait(900);
  tree.classList.add("is-leaving");
  await wait(700);
  node.remove();
}

/** Una caja de la pagina se vuelve rana, salta un rato y vuelve a ser caja. */
async function geFrog(ctx: PowerContext) {
  const candidates = piecesOnScreen(24).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height > 6000 && r.width * r.height < 200000;
  });
  const target = candidates[Math.floor(Math.random() * candidates.length)] ?? centerTarget();
  if (!target) return geGarden(ctx);
  const r = target.getBoundingClientRect();
  const node = layer("power-ge", true);
  const frog = document.createElement("span");
  frog.className = "power-frog";
  frog.innerHTML = FROG;
  let fx = r.left + r.width / 2;
  let fy = r.top + r.height / 2;
  frog.style.transform = `translate(${fx}px, ${fy}px)`;
  try {
    pop("ゴールド・E", fx, fy - 30, "power-pop-word is-gold", 900);
    target.classList.add("power-ge-morph");
    await wait(450);
    node.appendChild(frog);
    // Tres saltos por la pantalla, y de vuelta.
    const w = window.innerWidth;
    const hops = 4;
    for (let i = 0; i < hops; i++) {
      const back = i === hops - 1;
      const nx = back ? r.left + r.width / 2 : Math.min(w - 50, Math.max(50, fx + rand(-220, 220)));
      const ny = back ? r.top + r.height / 2 : Math.min(window.innerHeight - 60, Math.max(110, fy + rand(-90, 90)));
      frog.animate(
        [
          { transform: `translate(${fx}px, ${fy}px) scale(1.1, 0.85)` },
          { transform: `translate(${(fx + nx) / 2}px, ${Math.min(fy, ny) - 90}px) scale(0.9, 1.15)`, offset: 0.5 },
          { transform: `translate(${nx}px, ${ny}px) scale(1.15, 0.85)` },
        ],
        { duration: ctx.reducedMotion ? 1 : 520, easing: "ease-in-out", fill: "forwards" },
      );
      await wait(ctx.reducedMotion ? 120 : 560);
      fx = nx;
      fy = ny;
      if (!back) pop("ケロ", fx, fy - 40, "power-pop-word is-green", 700);
      await wait(180);
    }
    frog.classList.add("is-leaving");
    target.classList.remove("power-ge-morph");
    target.classList.add("power-healed-soft");
    await wait(600);
  } finally {
    target.classList.remove("power-ge-morph", "power-healed-soft");
    node.remove();
  }
}

/** Mariposas que salen de las imagenes y los titulos. */
async function geButterflies(ctx: PowerContext) {
  const sources = onScreen("main img, main h2, main h3, footer h2", 5);
  const origins = sources.length ? sources.map((el) => el.getBoundingClientRect()) : [new DOMRect(ctx.x - 20, ctx.y - 20, 40, 40)];
  const node = layer("power-ge", true);
  const colors = [
    ["#e3b341", "#e891c4"],
    ["#8fd3f4", "#e3b341"],
    ["#e891c4", "#b388eb"],
    ["#86d16f", "#e3b341"],
  ];
  for (let i = 0; i < 14; i++) {
    const r = origins[i % origins.length];
    const [a, b] = colors[i % colors.length];
    const fly = document.createElement("span");
    fly.className = "power-butterfly";
    fly.innerHTML = BUTTERFLY(a, b);
    fly.style.left = `${r.left + r.width * rand(0.2, 0.8)}px`;
    fly.style.top = `${r.top + r.height * rand(0.2, 0.8)}px`;
    fly.style.setProperty("--b1x", `${Math.round(rand(-120, 120))}px`);
    fly.style.setProperty("--b1y", `${Math.round(rand(-140, -40))}px`);
    fly.style.setProperty("--b2x", `${Math.round(rand(-260, 260))}px`);
    fly.style.setProperty("--b2y", `${Math.round(rand(-420, -220))}px`);
    fly.style.animationDelay = ctx.reducedMotion ? "0s" : `${i * 90}ms`;
    node.appendChild(fly);
  }
  await wait(ctx.reducedMotion ? 1400 : 3600);
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
}

/** Un titulo se vuelve serpiente: ondula y una serpiente lo cruza. */
async function geSnake(ctx: PowerContext) {
  const target = onScreen("main h2, main h3, footer h2", 1)[0];
  if (!target) return geButterflies(ctx);
  const r = target.getBoundingClientRect();
  const node = layer("power-ge", true);
  const snake = document.createElement("span");
  snake.className = "power-snake";
  const len = Math.min(window.innerWidth * 0.5, Math.max(220, r.width * 0.6));
  const wave = Array.from({ length: 9 }, (_, i) => `${(i * len) / 8},${i % 2 ? 10 : 30}`).join(" ");
  snake.innerHTML = `<svg width="${len + 40}" height="44" viewBox="0 0 ${len + 40} 44"><polyline points="${wave}" fill="none" stroke="#161418" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${wave}" fill="none" stroke="#6fbf5b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 6"/><circle cx="${len + 8}" cy="20" r="13" fill="#6fbf5b" stroke="#161418" stroke-width="3"/><circle cx="${len + 13}" cy="16" r="3" fill="#161418"/><path d="M${len + 20} 24 l12 2 l-4 -4 m4 4 l-4 4" stroke="#d8443c" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
  snake.style.left = `${r.left}px`;
  snake.style.top = `${r.bottom - 26}px`;
  snake.style.setProperty("--travel", `${Math.round(r.width + 60)}px`);
  snake.style.setProperty("--start", `${Math.round(-len - 40)}px`);
  node.appendChild(snake);
  target.classList.add("power-ge-wave");
  pop("シャー", r.left + r.width * 0.7, r.top - 10, "power-pop-word is-green", 1000);
  try {
    await wait(ctx.reducedMotion ? 1200 : 3000);
  } finally {
    target.classList.remove("power-ge-wave");
  }
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
}

async function goldExperience(ctx: PowerContext) {
  switch (ctx.variant) {
    case "tree":
      return geTree(ctx);
    case "frog":
      return geFrog(ctx);
    case "butterflies":
      return geButterflies(ctx);
    case "snake":
      return geSnake(ctx);
    default:
      return geGarden(ctx);
  }
}

/* ------------------------------------------------------------------ */
/* Echoes                                                              */
/* ------------------------------------------------------------------ */

/** Cada sonido le hace algo distinto al elemento donde se pega. */
const SOUNDS: [string, string][] = [
  ["ドドド", "power-fx-rumble"],
  ["ボヨヨン", "power-fx-bounce"],
  ["ドクン", "power-fx-pulse"],
  ["ジジジ", "power-fx-glitch"],
  ["キラーン", "power-fx-shine"],
  ["グラグラ", "power-fx-wobble"],
  ["ズキュウウン", "power-fx-pulse"],
  ["メメタァ", "power-fx-bounce"],
];

function sticker(text: string, rect: DOMRect, i: number, reducedMotion: boolean, interactive: boolean) {
  const node = layer(interactive ? "power-echo is-tap" : "power-echo", true);
  node.textContent = text;
  node.style.left = `${Math.min(window.innerWidth - 150, Math.max(10, rect.left + rect.width * rand(0.1, 0.6)))}px`;
  node.style.top = `${Math.max(70, rect.top - 18)}px`;
  node.style.setProperty("--echo-rotate", `${Math.round(rand(-15, 15))}deg`);
  node.style.animationDelay = reducedMotion ? "0s" : `${i * 140}ms`;
  return node;
}

/** ACT 1 y ACT 2: sonidos pegados que hacen reaccionar lo que tocan. */
async function echoesSounds(ctx: PowerContext, interactive: boolean) {
  const targets = onScreen("main h2, main h3, main img, main a.accent-fill, main p, footer h2, footer a.accent-fill", 6);
  const order = [...SOUNDS].sort(() => Math.random() - 0.5);
  let touched = 0;
  const stickers = targets.map((el, i) => {
    const [word, effect] = order[i % order.length];
    const node = sticker(word, el.getBoundingClientRect(), i, ctx.reducedMotion, interactive);
    const ring = () => {
      if (!ctx.reducedMotion) {
        el.classList.remove(effect);
        void el.offsetWidth;
        el.classList.add(effect);
      }
      node.classList.remove("is-ringing");
      void node.offsetWidth;
      node.classList.add("is-ringing");
    };
    if (interactive) {
      let rang = false;
      const onTouch = () => {
        ring();
        if (!rang) {
          rang = true;
          touched += 1;
        }
      };
      node.addEventListener("pointerdown", onTouch);
      node.addEventListener("pointerenter", (event) => event.pointerType === "mouse" && onTouch());
    } else window.setTimeout(ring, 350 + i * 260);
    return { el, node, effect };
  });
  await wait(interactive ? 7000 : 3800);
  stickers.forEach(({ node }) => node.classList.add("is-leaving"));
  await wait(450);
  stickers.forEach(({ el, node, effect }) => {
    el.classList.remove(effect);
    node.remove();
  });
  return interactive && touched === stickers.length && touched > 0;
}

/** ACT 3: 3 FREEZE. El blanco se vuelve pesadisimo y se hunde. */
async function echoesFreeze(ctx: PowerContext) {
  const target = centerTarget();
  if (!target) return;
  const r = target.getBoundingClientRect();
  const node = layer("power-echo-freeze", true);
  node.style.left = `${r.left}px`;
  node.style.top = `${r.bottom}px`;
  node.style.width = `${r.width}px`;
  node.innerHTML = `<span class="power-freeze-label">3 FREEZE</span>`;
  pop("ズシッ!!", r.left + r.width / 2, r.top - 20, "power-pop-word is-green is-big", 1200);
  target.classList.add("power-heavy");
  quake(400, ctx.reducedMotion, true);
  try {
    await wait(ctx.reducedMotion ? 1000 : 2600);
  } finally {
    target.classList.remove("power-heavy");
  }
  target.classList.add("power-healed-soft");
  node.classList.add("is-leaving");
  await wait(600);
  target.classList.remove("power-healed-soft");
  node.remove();
}

async function echoes(ctx: PowerContext) {
  if (ctx.variant === "act3") return echoesFreeze(ctx);
  return echoesSounds(ctx, ctx.variant === "act2");
}

/* ------------------------------------------------------------------ */
/* Soft & Wet                                                          */
/* ------------------------------------------------------------------ */

interface Bubble {
  el: HTMLSpanElement;
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  target?: HTMLElement;
  stole?: string;
  popped: boolean;
  gone: boolean;
}

/**
 * Soft & Wet: burbujas ladronas. Algunas van a un elemento y le roban
 * algo (el color de un titulo, una imagen entera); reventarlas lo
 * devuelve. Las demas solo flotan. Devuelve true si no se escapo ninguna
 * ladrona.
 */
async function softWet(ctx: PowerContext) {
  const node = layer("power-sw", true);
  const w = window.innerWidth;
  const h = window.innerHeight;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const targets = [
    ...onScreen("main img", 2),
    ...onScreen("main h2, main h3, footer h2", 3),
  ].slice(0, w < 640 ? 3 : 4);
  const bubbles: Bubble[] = [];
  const decor = w < 640 ? 4 : 7;
  const total = targets.length + decor;
  for (let i = 0; i < total; i++) {
    const el = document.createElement("span");
    el.className = "power-bubble";
    const thief = i < targets.length;
    const size = thief ? rand(70, 92) : rand(36, 70);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    node.appendChild(el);
    bubbles.push({
      el,
      x: thief ? ctx.x : rand(size, w - size),
      y: thief ? ctx.y : h + rand(20, 260),
      size,
      speed: rand(55, 110),
      sway: rand(10, 40),
      phase: rand(0, 6),
      target: thief ? targets[i] : undefined,
      popped: false,
      gone: false,
    });
  }

  const steal = (b: Bubble) => {
    const el = b.target!;
    if (el instanceof HTMLImageElement) {
      b.el.style.backgroundImage = `url("${el.currentSrc || el.src}")`;
      b.el.classList.add("has-loot", "has-img");
      el.classList.add("power-stolen-img");
      b.stole = "img";
    } else {
      const words = (el.textContent ?? "").trim().split(/\s+/).slice(0, 2).join(" ").slice(0, 14);
      b.el.dataset.loot = words;
      b.el.classList.add("has-loot");
      el.classList.add("power-stolen-color");
      b.stole = "color";
    }
    pop("スッ", b.x, b.y - b.size / 2, "power-pop-word is-blue", 600);
  };
  const giveBack = (b: Bubble) => {
    if (!b.stole || !b.target) return;
    b.target.classList.remove("power-stolen-img", "power-stolen-color");
    b.target.classList.add("power-healed-soft");
    const t = b.target;
    window.setTimeout(() => t.classList.remove("power-healed-soft"), 700);
    b.stole = undefined;
  };
  const burst = (b: Bubble) => {
    if (b.popped || b.gone) return;
    b.popped = true;
    b.el.classList.add("is-popped");
    pop("パチン", b.x, b.y, "power-pop-word is-blue", 700);
    giveBack(b);
    window.setTimeout(() => b.el.remove(), 300);
  };
  bubbles.forEach((b) => {
    b.el.addEventListener("pointerdown", () => burst(b));
    if (fine) b.el.addEventListener("pointerenter", () => burst(b));
  });

  const start = performance.now();
  let last = start;
  let raf = 0;
  const duration = ctx.reducedMotion ? 6000 : 10500;
  await new Promise<void>((resolve) => {
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let alive = 0;
      for (const b of bubbles) {
        if (b.popped || b.gone) continue;
        alive += 1;
        if (b.target && !b.stole && b.el.dataset.done !== "1") {
          // Va hacia lo que quiere robar.
          const r = b.target.getBoundingClientRect();
          const tx = r.left + r.width / 2;
          const ty = r.top + r.height / 2;
          b.x += (tx - b.x) * Math.min(1, dt * 1.8);
          b.y += (ty - b.y) * Math.min(1, dt * 1.8);
          if (Math.hypot(tx - b.x, ty - b.y) < 24) {
            steal(b);
            b.el.dataset.done = "1";
          }
        } else {
          b.y -= b.speed * dt;
          b.x += Math.sin(now / 600 + b.phase) * b.sway * dt;
        }
        if (b.y < -b.size - 20) {
          // Se escapo: lo robado sigue robado hasta el final.
          b.gone = true;
          b.el.remove();
        }
        b.el.style.transform = `translate3d(${(b.x - b.size / 2).toFixed(1)}px, ${(b.y - b.size / 2).toFixed(1)}px, 0)`;
      }
      if (now - start > duration || alive === 0) resolve();
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });
  cancelAnimationFrame(raf);
  const thieves = bubbles.filter((b) => b.target);
  const perfect = thieves.length > 0 && thieves.every((b) => b.popped);
  bubbles.forEach(giveBack);
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
  return perfect;
}

/* ------------------------------------------------------------------ */
/* Hermit Purple                                                       */
/* ------------------------------------------------------------------ */

/** Puntos de una curva con ondulacion (para que la espina tenga espinas). */
function vinePoints(x1: number, y1: number, x2: number, y2: number, bend: number) {
  const cx = (x1 + x2) / 2 + bend;
  const cy = (y1 + y2) / 2 - Math.abs(bend) * 0.6;
  const points: string[] = [];
  const n = 22;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    const wob = Math.sin(t * Math.PI * 5) * 7 * Math.sin(t * Math.PI);
    points.push(`${(x + wob).toFixed(1)},${(y - wob).toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * Hermit Purple: enredaderas moradas con espinas que salen del Stand y
 * enmarcan una foto de espiritu (念写) que se revela con los datos de la
 * visita, como la camara de Joseph.
 */
async function hermit(ctx: PowerContext) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const id = `hp${++uid}`;
  const node = layer("power-hermit", true);
  const cardW = Math.min(280, w - 48);
  const cardH = cardW * 1.18;
  const px = w / 2 - cardW / 2;
  const py = Math.max(80, h * 0.46 - cardH / 2);
  const ends: [number, number][] = [
    [px, py + 20],
    [px + cardW, py + cardH * 0.3],
    [px + cardW * 0.3, py + cardH],
    [px + cardW, py + cardH - 10],
  ];
  onScreen("main h2, main h3, main img", 2).forEach((el) => {
    const r = el.getBoundingClientRect();
    ends.push([r.left + r.width * 0.8, r.top + r.height / 2]);
  });
  const vines = ends.map(([x, y], i) => vinePoints(ctx.x, ctx.y, x, y, (i % 2 ? 1 : -1) * rand(60, 160)));
  // Una enredadera que rodea el marco de la foto.
  const frame = `${px - 8},${py - 8} ${px + cardW + 8},${py - 4} ${px + cardW + 6},${py + cardH + 8} ${px - 6},${py + cardH + 6} ${px - 8},${py - 8}`;
  const leaves = ends
    .flatMap(([x, y], i) => [
      [ctx.x + (x - ctx.x) * 0.45 + (i % 2 ? 14 : -14), ctx.y + (y - ctx.y) * 0.45],
      [ctx.x + (x - ctx.x) * 0.8, ctx.y + (y - ctx.y) * 0.8 + (i % 2 ? -12 : 12)],
    ])
    .map(
      ([x, y], i) =>
        `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="9" ry="5" transform="rotate(${(i * 47) % 180} ${x.toFixed(0)} ${y.toFixed(0)})" style="animation-delay:${1 + i * 0.05}s"/>`,
    )
    .join("");
  node.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="${id}g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#c9a3f2"/><stop offset="1" stop-color="#6d3fb3"/></linearGradient>
      <marker id="${id}t" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="5" markerHeight="5" markerUnits="strokeWidth" orient="auto"><path d="M1 9 L5 0 L9 9Z" fill="#161418"/><path d="M3 9 L5 3 L7 9Z" fill="#b388eb"/></marker>
    </defs>
    <g class="power-vine-ink">${vines.map((p) => `<polyline points="${p}" pathLength="1"/>`).join("")}<polyline points="${frame}" pathLength="1"/></g>
    <g class="power-vine" stroke="url(#${id}g)">${vines.map((p) => `<polyline points="${p}" pathLength="1"/>`).join("")}<polyline points="${frame}" pathLength="1"/></g>
    <g class="power-thorns" marker-mid="url(#${id}t)">${vines.map((p) => `<polyline points="${p}"/>`).join("")}</g>
    <g class="power-vine-leaves">${leaves}</g>
  </svg>`;
  if (ctx.photo) {
    const card = document.createElement("div");
    card.className = "power-polaroid";
    Object.assign(card.style, { left: `${px}px`, top: `${py}px`, width: `${cardW}px`, height: `${cardH}px` });
    const rows = ctx.photo.rows
      .map(([label, value]) => `<span class="power-polaroid-row"><span>${label}</span><b>${value}</b></span>`)
      .join("");
    card.innerHTML = `<div class="power-polaroid-photo"><span class="power-polaroid-kanji">念写</span><div class="power-polaroid-rows">${rows}</div></div><p class="power-polaroid-caption">${ctx.photo.title}</p>`;
    node.appendChild(card);
  }
  await wait(ctx.reducedMotion ? 2600 : 5600);
  node.classList.add("is-leaving");
  await wait(500);
  node.remove();
}

/* ------------------------------------------------------------------ */
/* Made in Heaven                                                      */
/* ------------------------------------------------------------------ */

/**
 * Made in Heaven: el tiempo acelera hasta que el sol sale y se pone en
 * un parpadeo y el universo empieza a reiniciarse... hacia la pagina de
 * antes (vino tinto, seria, sin Stands). El Stand lo frena justo a tiempo.
 */
async function madeInHeaven(ctx: PowerContext) {
  const node = layer("power-mih", true);
  node.innerHTML = `<span class="power-mih-sky"></span><span class="power-mih-lines"></span><span class="power-mih-orbit"><i class="sun"></i><i class="moon"></i></span><span class="power-mih-clock"><i></i><i></i></span><span class="power-mih-text">時は加速する</span>`;
  const sky = node.querySelector<HTMLElement>(".power-mih-sky")!;
  const fast = ctx.reducedMotion ? null : retime(4, node);
  let interval = 0;
  let rate = 4;
  if (fast) {
    interval = window.setInterval(() => {
      rate = Math.min(14, rate + 1.5);
      fast.set(rate);
      sky.style.animationDuration = `${Math.max(0.12, 1.2 / rate)}s`;
    }, 300);
  }
  standInFront(true);
  const universe = ctx.universe;
  try {
    await wait(ctx.reducedMotion ? 1200 : 3000);
    if (!universe) return;
    // El universo se reinicia: aparece la pagina de antes.
    const old = layer("power-universe", true);
    old.innerHTML = `
      <div class="pu-nav"><span class="pu-logo">Cristian Pérez</span><span class="pu-links"><i></i><i></i><i></i></span></div>
      <div class="pu-hero">
        <span class="pu-badge"><i></i>${universe.badge}</span>
        <p class="pu-tagline">${universe.tagline}</p>
        <span class="pu-ctas"><i></i><i></i></span>
      </div>
      <code class="pu-label">// ${universe.label}</code>
      <div class="pu-load"><span class="pu-load-text">${universe.loading} <b>0%</b></span><span class="pu-bar"><i></i></span></div>`;
    const pct = old.querySelector("b")!;
    const bar = old.querySelector<HTMLElement>(".pu-bar i")!;
    for (let p = 0; p <= 87; p += 3) {
      pct.textContent = `${p}%`;
      bar.style.width = `${p}%`;
      await wait(ctx.reducedMotion ? 10 : 55);
    }
    // ¡ALTO! El Stand lo frena.
    window.clearInterval(interval);
    fast?.restore();
    ctx.onStop?.();
    pct.textContent = "ERROR";
    old.classList.add("is-glitch");
    pop("ドーン!", window.innerWidth / 2, window.innerHeight * 0.4, "power-pop-word is-big", 1100);
    await wait(ctx.reducedMotion ? 300 : 1100);
    old.style.setProperty("--ox", `${ctx.x}px`);
    old.style.setProperty("--oy", `${ctx.y}px`);
    old.classList.add("is-leaving");
    node.classList.add("is-leaving");
    await wait(650);
    old.remove();
  } finally {
    window.clearInterval(interval);
    fast?.restore();
    standInFront(false);
    node.remove();
  }
}

/* ------------------------------------------------------------------ */
/* Bites the Dust                                                      */
/* ------------------------------------------------------------------ */

const KILLER_QUEEN = `<svg viewBox="0 0 48 48" width="48" height="48"><g stroke="#161418" stroke-width="3" stroke-linejoin="round"><path d="M8 20 L6 4 L18 12Z M40 20 L42 4 L30 12Z" fill="#e891c4"/><circle cx="24" cy="24" r="17" fill="#e891c4"/><path d="M12 30 Q24 44 36 30" fill="#ece6d8"/></g><path d="M15 21 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M25 21 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" fill="#161418"/><path d="M22 27 l2 3 l2 -3Z" fill="#161418"/><path d="M17 33 v4 M21 34 v4 M25 34 v4 M29 33 v4" stroke="#161418" stroke-width="2"/></svg>`;

/**
 * Bites the Dust, como en la Parte 4: Killer Queen (en chiquito) entra
 * en un ojo, "カチッ", explota, y el tiempo se rebobina: la pantalla va
 * para atras a tirones, con el reloj girando al reves y las animaciones
 * de la pagina corriendo hacia atras, hasta donde estabas hace un rato.
 * Al volver, el Stand repite lo que habia dicho (deja vu).
 */
async function bitesTheDust(ctx: PowerContext) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const node = layer("power-btd-intro", true);
  standInFront(true);
  let rewind: ReturnType<typeof retime> | null = null;
  const tape = layer("power-btd", true);
  tape.classList.add("is-hidden");
  try {
    if (!ctx.reducedMotion) {
      // 1. Killer Queen entra en el ojo.
      node.innerHTML = `<span class="power-eye"><svg viewBox="0 0 200 100" width="200" height="100"><path d="M6 50 Q100 -20 194 50 Q100 120 6 50Z" fill="#ece6d8" stroke="#161418" stroke-width="6"/><circle cx="100" cy="50" r="30" fill="#b388eb" stroke="#161418" stroke-width="5"/><circle class="pupil" cx="100" cy="50" r="13" fill="#161418"/></svg></span><span class="power-kq">${KILLER_QUEEN}</span>`;
      const kq = node.querySelector<HTMLElement>(".power-kq")!;
      kq.style.setProperty("--from-x", `${ctx.x - w / 2}px`);
      kq.style.setProperty("--from-y", `${ctx.y - h * 0.42}px`);
      await wait(1100);
      // 2. カチッ: el interruptor.
      pop("カチッ", w / 2 + 70, h * 0.3, "power-pop-word is-pink is-big", 900);
      await wait(380);
      // 3. Explosion.
      node.innerHTML = `<span class="power-btd-boom"></span>`;
      quake(500, ctx.reducedMotion, true);
      await wait(450);
    }
    // 4. Rebobinar: a tirones, como una cinta.
    tape.classList.remove("is-hidden");
    tape.innerHTML = `<span class="power-btd-vortex"></span><span class="power-btd-clock"><i></i><i></i></span><span class="power-btd-rew">◀◀ REW</span><span class="power-btd-text">BITES THE DUST</span>`;
    node.innerHTML = "";
    rewind = ctx.reducedMotion ? null : retime(-3, tape);
    let target = ctx.pastScroll;
    if (Math.abs(target - window.scrollY) < h * 0.5) {
      const above = sections().filter((el) => el.getBoundingClientRect().top < -40);
      target = above.length ? above[above.length - 1].getBoundingClientRect().top + window.scrollY : 0;
    }
    const from = window.scrollY;
    const steps = ctx.reducedMotion ? 1 : 7;
    for (let i = 1; i <= steps; i++) {
      // Cada tiron retrocede un trozo; en medio, un temblor de imagen.
      const t = i / steps;
      scrollToY(from + (target - from) * (1 - (1 - t) ** 2), true);
      tape.classList.remove("is-jolt");
      void tape.offsetWidth;
      tape.classList.add("is-jolt");
      await wait(ctx.reducedMotion ? 300 : 230);
    }
    await wait(ctx.reducedMotion ? 200 : 500);
    rewind?.restore();
    rewind = null;
    tape.classList.add("is-flash");
    await wait(300);
    tape.classList.add("is-leaving");
    await wait(400);
  } finally {
    rewind?.restore();
    standInFront(false);
    node.remove();
    tape.remove();
  }
}

/* ------------------------------------------------------------------ */
/* King Crimson                                                        */
/* ------------------------------------------------------------------ */

/** King Crimson: se salta el tiempo hasta la siguiente seccion. */
async function kingCrimson(ctx: PowerContext) {
  const node = layer("power-kc", true);
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
