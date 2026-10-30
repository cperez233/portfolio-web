/* editorial-ui · Cristian Pérez · cristianperez.me */

import type { PowerId, StandLines } from "./lines";
import { stopTime } from "@/lib/time-stop";
import { playSfx } from "@/lib/sfx";
import { createGlass } from "@/components/ui/hero-crack";
import { grow, paint, svgEl, type Limb, type Painted } from "@/components/ui/hero-intros/gold-art";
import { BOOM_MS, PRIME_MS, createBoom } from "@/components/ui/hero-intros/boom";
import { CUT_MS, btdCut } from "@/components/ui/hero-intros/btd-cut";
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
  /** ZA WARUDO: cuanto dura el tiempo detenido (por defecto 3.6s). */
  ms?: number;
  /** El Stand grita el nombre del ataque (Bites the Dust, antes de activarse). */
  call?: () => void;
  /** King Crimson: el tiempo ya se salto y la pantalla sigue a oscuras; el Stand se muda ahora. */
  onSkip?: () => void;
}

export const POWER_VARIANTS: Partial<Record<PowerId, string[]>> = {
  starplatinum: ["rush", "finger", "world"],
  goldexperience: ["garden", "tree", "frog", "butterflies", "snake"],
  bitesthedust: ["bomb", "rewind"],
  echoes: ["act1", "act2", "act3"],
};

let uid = 0;

/* ------------------------------------------------------------------ */
/* ZA WARUDO                                                           */
/* ------------------------------------------------------------------ */

/**
 * ZA WARUDO: esfera que invierte la pagina y detiene el tiempo de verdad
 * (lib/time-stop): nadie se mueve, tampoco quien visita. El Stand si: lo
 * que hace mientras tanto (posar, burlarse, cambiar de sitio)
 * vive en mini-stand, porque tambien pasa con el toque del retrato.
 */
async function zaWarudo(ctx: PowerContext) {
  const ms = ctx.ms ?? (ctx.reducedMotion ? 1600 : 3600);
  const resumed = stopTime(ms, "stand");
  playSfx("warudo");
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
  playSfx("resume");
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

export function impact(x: number, y: number, big = false) {
  const node = layer(big ? "power-impact is-big" : "power-impact", true);
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.rotate = `${Math.round(rand(0, 90))}deg`;
  window.setTimeout(() => node.remove(), 500);
}

export function fist(node: HTMLElement, fromX: number, fromY: number, toX: number, toY: number, delay: number, ms = 260) {
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
  return el;
}

export function speedLines(x: number, y: number) {
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

/**
 * Star Platinum: The World, como el de DIO: con el tiempo detenido no se ve
 * nada (la esfera y el nombre, y el Stand quieto). Al reanudarse ya paso todo:
 * el Stand aparece de pronto junto a su blanco (mini-stand, por el evento de
 * time-stop) y la rafaga de ORAs ya esta hecha, los golpes de golpe y el
 * blanco ya abollado y empujado.
 */
async function starWorld(ctx: PowerContext, target: HTMLElement) {
  const r = target.getBoundingClientRect();
  const ms = ctx.reducedMotion ? 900 : 2200;
  const resumed = stopTime(ms, "platinum", target);
  /*
    El negativo de ZA WARUDO, pero suyo: la esfera nace del Stand, se
    abre de golpe y es violeta (el color de Star Platinum), asi que la
    pagina queda en negativo tenido de violeta y no en blanco y negro.
    Misma tecnica de dos capas que zaWarudo.
  */
  const blend = ctx.reducedMotion ? null : layer("power-spw power-zw-blend", true);
  if (blend) {
    const sphere = document.createElement("span");
    sphere.className = "power-zw-sphere is-platinum";
    sphere.style.left = `${ctx.x}px`;
    sphere.style.top = `${ctx.y}px`;
    // Los ultimos 500 ms (fuera del tiempo detenido) la esfera se recoge.
    sphere.style.animationDuration = `${ms + 500}ms`;
    blend.appendChild(sphere);
  }
  const tint = layer("power-spw", true);
  tint.innerHTML = `<span class="power-spw-text">スタープラチナ・ザ・ワールド</span>`;
  await resumed;
  // El tiempo vuelve y la rafaga ya esta hecha: los golpes llegan todos a la vez.
  tint.innerHTML = `<span class="power-spw-text is-resume">そして時は動き出す</span>`;
  window.setTimeout(() => tint.classList.add("is-leaving"), 450);
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const count = ctx.reducedMotion ? 4 : 22;
  for (let i = 0; i < count; i++) {
    const x = r.left + r.width * rand(0.05, 0.95);
    const y = r.top + r.height * rand(0.1, 0.9);
    window.setTimeout(() => {
      impact(x, y);
      if (!ctx.reducedMotion && i % 4 === 0) pop("オラ", x + rand(-30, 30), y - rand(10, 40), "power-pop-word is-purple", 800);
    }, rand(0, 70));
  }
  quake(520, ctx.reducedMotion, true);
  impact(cx, cy, true);
  pop("オラァ!", cx, cy - 30, "power-pop-word is-purple is-big", 1100);
  // Ya abollado y empujado, lejos de donde aparece el Stand; despues se arregla solo.
  target.classList.add("power-hit");
  await wait(180);
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
  tint.remove();
  blend?.remove();
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
  // Cada golpe de la rafaga deja su estrella de grietas donde pega (antes
  // solo saltaba el destello y parecia que algunos no rompian nada).
  const glass = ctx.reducedMotion ? null : createGlass();

  if (!ctx.reducedMotion) {
    for (let i = 0; i < 9; i++) {
      window.setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = rand(40, 170);
        const hx = ix + Math.cos(angle) * dist * 0.5;
        const hy = iy + Math.sin(angle) * dist * 0.4;
        pop("ドラ", ix + Math.cos(angle) * dist, iy + Math.sin(angle) * dist * 0.6, "power-pop-word is-pink", 700);
        impact(hx, hy);
        glass?.hit(hx, hy, rand(70, 110));
      }, i * 80);
    }
  }
  quake(1000, ctx.reducedMotion, true);
  playSfx("crack");

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
    if (glass) glass.heal(ix, iy, 700);
    else playSfx("heal");
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
    glass?.cancel();
    node.remove();
  }
}

/* ------------------------------------------------------------------ */
/* Gold Experience                                                     */
/* ------------------------------------------------------------------ */

/*
  Dibujos de Gold Experience, pintados como los de la intro (gold-art.ts):
  sin contorno de tinta, con volumen de luz y sombra. Las ramas, hojas,
  flores y frutas del arbol y del jardin salen de gold-art.ts; aqui van la
  rana, la serpiente y la mariposa.
*/
/*
  La rana (Giorno convierte cosas en ranas): cuerpo con degradado (luz
  arriba a la izquierda), panza clara, ojos saltones brillantes, manchas y
  mejillas. Los bordes los da un verde mas oscuro, no la tinta.
*/
const FROG = (id: string) => `<svg viewBox="0 0 80 66" width="120" height="99"><defs>
  <radialGradient id="${id}b" cx="0.35" cy="0.25" r="0.85"><stop offset="0" stop-color="#a6dc86"/><stop offset="0.55" stop-color="#5fae4b"/><stop offset="1" stop-color="#2f6b2a"/></radialGradient>
  <radialGradient id="${id}e" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d7e4c6"/></radialGradient>
  <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f6d8"/><stop offset="1" stop-color="#c9dca0"/></linearGradient>
  </defs>
  <ellipse cx="40" cy="64" rx="30" ry="3.2" fill="rgba(0, 0, 0, 0.22)"/>
  <path d="M9 55 Q1 62 7 64.5 Q14 66 21 59Z" fill="#3f8436"/><path d="M71 55 Q79 62 73 64.5 Q66 66 59 59Z" fill="#3f8436"/>
  <path d="M8 46 Q8 24 40 24 Q72 24 72 46 Q72 62 40 62 Q8 62 8 46Z" fill="url(#${id}b)"/>
  <circle cx="24" cy="22" r="11" fill="url(#${id}b)"/><circle cx="56" cy="22" r="11" fill="url(#${id}b)"/>
  <circle cx="24" cy="21" r="7" fill="url(#${id}e)"/><circle cx="56" cy="21" r="7" fill="url(#${id}e)"/>
  <ellipse cx="40" cy="51" rx="18" ry="9" fill="url(#${id}p)"/>
  <path d="M22 56 q-2 6 -8 6 q4 -1 4 -5Z M58 56 q2 6 8 6 q-4 -1 -4 -5Z" fill="#4c9a3f"/>
  <circle class="pupil" cx="25" cy="21.5" r="3.6" fill="#1d2a18"/><circle class="pupil" cx="57" cy="21.5" r="3.6" fill="#1d2a18"/>
  <circle cx="26.5" cy="19.5" r="1.4" fill="#fff"/><circle cx="58.5" cy="19.5" r="1.4" fill="#fff"/>
  <ellipse cx="20" cy="38" rx="4.5" ry="2.6" fill="#f2a3b8" opacity=".7"/><ellipse cx="60" cy="38" rx="4.5" ry="2.6" fill="#f2a3b8" opacity=".7"/>
  <path d="M30 37 Q35 42 40 38 Q45 42 50 37" fill="none" stroke="#24521f" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="31" cy="30" rx="2.4" ry="1.8" fill="#3f8436" opacity=".75"/><ellipse cx="52" cy="29.5" rx="2" ry="1.5" fill="#3f8436" opacity=".75"/><circle cx="45" cy="28" r="1.3" fill="#3f8436" opacity=".75"/>
  <path d="M15 32 Q19 27 26 27.5" stroke="#d4f2bd" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>
</svg>`;

/** Un color hex mas oscuro (k < 1) o mas claro hacia blanco (k > 1). */
function shade(hex: string, k: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(k < 1 ? c * k : c + (255 - c) * (k - 1)));
  return `#${ch.map((c) => Math.min(255, c).toString(16).padStart(2, "0")).join("")}`;
}

/*
  Una mariposa de verdad y no una pegatina: sin contorno de tinta. Cada
  ala tiene volumen (oscura junto al cuerpo, el color en el medio, clara
  hacia la punta), el borde oscuro por DENTRO del ala (un trazo grueso
  recortado a su forma), venas, puntos claros en el margen y un ocelo en
  el ala de atras. El ala izquierda es la derecha en espejo. .wing-l y
  .wing-r son las que aletean (CSS); el espejo va en un grupo de dentro
  para que la animacion no lo pise.
*/
const WING_FORE = "M31 21 C35 12 43 3.5 55 3.5 C58.5 5.5 57.5 13 53 20 C47 23.5 38 24.5 31 24Z";
const WING_HIND = "M31 25 C38 24 46.5 26.5 49.5 33 C51 39.5 46 44.5 40 42.5 C36 41 33 34.5 31 28Z";
export const BUTTERFLY = (id: string, a: string, b: string) => {
  const deep = shade(a, 0.45);
  const rim = shade(a, 0.22);
  const wing =
    `<path d="${WING_HIND}" fill="url(#${id}h)"/><path d="${WING_FORE}" fill="url(#${id}f)"/>` +
    // El margen oscuro, solo por dentro de cada ala.
    `<path d="${WING_FORE}" fill="none" stroke="${rim}" stroke-width="5" clip-path="url(#${id}cf)"/>` +
    `<path d="${WING_HIND}" fill="none" stroke="${rim}" stroke-width="4.4" clip-path="url(#${id}ch)"/>` +
    `<path d="M31.5 21.5 L52 6.5 M31.5 22.5 L55 11 M31.5 23.5 L52 18.5 M31.5 26 L47 31 M31.5 27 L42 40" stroke="${rim}" stroke-width="0.6" opacity="0.45" fill="none"/>` +
    `<circle cx="54" cy="7.5" r="0.9" fill="#fbf7ec"/><circle cx="55" cy="11.5" r="0.75" fill="#fbf7ec"/><circle cx="53.4" cy="15.6" r="0.65" fill="#fbf7ec"/>` +
    `<circle cx="48.5" cy="36" r="0.7" fill="#fbf7ec"/><circle cx="45.5" cy="40.6" r="0.6" fill="#fbf7ec"/>` +
    `<circle cx="43" cy="34" r="2.6" fill="${rim}"/><circle cx="43" cy="34" r="1.5" fill="${b}"/><circle cx="42.5" cy="33.5" r="0.5" fill="#fff"/>` +
    // Brillo de escamas: un velo claro en la mitad de arriba.
    `<path d="M33 20.5 C38 13 45 7 53 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.22" fill="none"/>`;
  return (
    `<svg viewBox="0 0 60 48" width="62" height="50"><defs>` +
    `<linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="31" y1="24" x2="55" y2="4"><stop offset="0" stop-color="${deep}"/><stop offset="0.45" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` +
    `<linearGradient id="${id}h" gradientUnits="userSpaceOnUse" x1="31" y1="26" x2="48" y2="42"><stop offset="0" stop-color="${deep}"/><stop offset="0.55" stop-color="${a}"/><stop offset="1" stop-color="${shade(a, 0.8)}"/></linearGradient>` +
    `<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1e18"/><stop offset="0.5" stop-color="#6b5444"/><stop offset="1" stop-color="#2a1e18"/></linearGradient>` +
    `<clipPath id="${id}cf"><path d="${WING_FORE}"/></clipPath><clipPath id="${id}ch"><path d="${WING_HIND}"/></clipPath>` +
    `</defs>` +
    `<g class="wing-l"><g transform="translate(60 0) scale(-1 1)">${wing}</g></g>` +
    `<g class="wing-r">${wing}</g>` +
    `<path d="M29.4 12 Q26.5 5 23 2.6 M30.6 12 Q33.5 5 37 2.6" fill="none" stroke="#3a2a22" stroke-width="0.8" stroke-linecap="round"/>` +
    `<circle cx="23" cy="2.6" r="1.1" fill="#3a2a22"/><circle cx="37" cy="2.6" r="1.1" fill="#3a2a22"/>` +
    `<circle cx="30" cy="13.2" r="2" fill="#3a2a22"/>` +
    `<ellipse cx="30" cy="18.5" rx="2.3" ry="4" fill="url(#${id}b)"/>` +
    `<path d="M28.4 22 Q30 21 31.6 22 L31 35 Q30 37 29 35Z" fill="url(#${id}b)"/>` +
    `<path d="M28.7 25 h2.6 M28.9 28.5 h2.2 M29.1 32 h1.8" stroke="#1d1410" stroke-width="0.5" opacity="0.6"/>` +
    `</svg>`
  );
};

/** Destello de vida dorado: lo que hace Giorno antes de que algo brote. */
function lifeBurst(x: number, y: number, size = 1) {
  const ring = layer("power-life", true);
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.setProperty("--life", String(size));
  for (let i = 0; i < 6; i++) {
    const spark = document.createElement("i");
    const a = (i / 6) * Math.PI * 2 + rand(-0.3, 0.3);
    spark.style.setProperty("--sx", `${Math.round(Math.cos(a) * rand(40, 80) * size)}px`);
    spark.style.setProperty("--sy", `${Math.round(Math.sin(a) * rand(40, 80) * size)}px`);
    ring.appendChild(spark);
  }
  window.setTimeout(() => ring.remove(), 900);
}

function sprout(node: HTMLElement, html: string, className: string, x: number, y: number, vars: Record<string, string>, delay: number) {
  const item = document.createElement("span");
  item.className = className;
  item.innerHTML = html;
  item.style.left = `${x}px`;
  item.style.top = `${y}px`;
  for (const [key, value] of Object.entries(vars)) item.style.setProperty(key, value);
  item.style.animationDelay = `${delay}ms`;
  node.appendChild(item);
  return item;
}

/** Hace crecer las ramas pintadas (gold-art.ts) trazo a trazo; sin movimiento, ya crecidas. */
function growPainted(painted: Painted, reducedMotion: boolean) {
  for (const { el, delay, ms } of painted.strokes) {
    if (reducedMotion) {
      el.style.strokeDashoffset = "0";
      continue;
    }
    el.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { duration: ms, delay, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "both" });
  }
}

/** Se marchita: las hojas caen girando, flores y frutas se cierran y las ramas se recogen. */
async function witherPainted(painted: Painted) {
  painted.leaves.forEach((el, i) =>
    el.animate(
      [
        { translate: "0 0", rotate: "0deg", opacity: 1 },
        { translate: `${rand(-50, 50).toFixed(0)}px ${rand(120, 280).toFixed(0)}px`, rotate: `${rand(-160, 160).toFixed(0)}deg`, opacity: 0 },
      ],
      { duration: rand(700, 1100), delay: (i % 16) * 22, easing: "cubic-bezier(0.4, 0, 0.8, 0.6)", fill: "forwards" },
    ),
  );
  painted.flowers.forEach((el, i) => el.animate([{ scale: "1" }, { scale: "0" }], { duration: 320, delay: (i % 10) * 30, easing: "ease-in", fill: "forwards" }));
  for (const { el } of painted.strokes) {
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([{ strokeDashoffset: "0" }, { strokeDashoffset: "1" }], { duration: 560, delay: 380, easing: "cubic-bezier(0.6, 0, 0.7, 0.3)", fill: "both" });
  }
  await wait(1000);
}

/** Jardin: de lo que se ve brotan ramitas con hojas y flores, como las de la intro. */
async function geGarden(ctx: PowerContext) {
  const sources = onScreen("main img, main h2, main h3, main p, main a.accent-fill, footer h2", 5);
  const origins = sources.length ? sources.map((el) => el.getBoundingClientRect()) : [new DOMRect(ctx.x - 20, ctx.y - 20, 40, 40)];
  const node = layer("power-ge", true);
  const w = window.innerWidth;
  const h = window.innerHeight;
  const svg = svgEl("svg", { class: "ge-branches power-ge-garden", width: w, height: h });
  node.appendChild(svg);
  const limbs: Limb[] = [];
  const small = w < 640;
  origins.forEach((r, i) => {
    // Brotan del borde de arriba hacia arriba; si no hay sitio, del de abajo hacia abajo.
    const up = r.top > 110;
    const sprigs = Math.random() < 0.5 ? 1 : 2;
    for (let j = 0; j < sprigs; j++) {
      const x = r.left + r.width * rand(0.12, 0.88);
      const y = up ? r.top + 4 : r.bottom - 4;
      const angle = (up ? -Math.PI / 2 : Math.PI / 2) + rand(-0.55, 0.55);
      grow(limbs, x, y, angle, rand(55, 95) * (small ? 0.8 : 1), rand(6, 9), i * 140 + j * 90, 0, 2);
    }
    window.setTimeout(() => lifeBurst(r.left + r.width / 2, r.top + r.height / 2, 0.7), ctx.reducedMotion ? 0 : i * 140);
  });
  const painted = paint(svg, `gegd${++uid}`, "mid", limbs, small ? 16 : 20, { flowers: 0.55, fruits: 0 });
  growPainted(painted, ctx.reducedMotion);
  await wait(ctx.reducedMotion ? 1500 : 3400);
  if (!ctx.reducedMotion) await witherPainted(painted);
  node.remove();
}

/** Un arbol entero que crece desde el borde de abajo, se mece, da flores y fruta, y se marchita. */
async function geTree(ctx: PowerContext) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const node = layer("power-ge", true);
  const size = Math.min(h * 0.74, 540);
  // Del lado contrario al Stand, para que el lo mire crecer.
  const side = ctx.x > w / 2 ? rand(0.14, 0.3) : rand(0.6, 0.8);
  const x0 = w * side;
  const svg = svgEl("svg", { class: "ge-branches power-ge-tree", width: w, height: h });
  svg.style.transformOrigin = `${x0.toFixed(0)}px ${h}px`;
  node.appendChild(svg);
  const limbs: Limb[] = [];
  grow(limbs, x0, h + 8, -Math.PI / 2 + rand(-0.06, 0.06), size * 0.4, size * 0.085, 150, 0, 3);
  const painted = paint(svg, `getr${++uid}`, "mid", limbs, size * 0.07, { flowers: 0.3, fruits: 0.3 });
  growPainted(painted, ctx.reducedMotion);
  lifeBurst(x0, h - 20, 1.4);
  window.setTimeout(() => pop("ニョキニョキ", x0, h - size * 0.92, "power-pop-word is-green", 1000), 700);
  await wait(ctx.reducedMotion ? 1200 : 3800);
  if (!ctx.reducedMotion) await witherPainted(painted);
  node.remove();
}

/** Una caja de la pagina se vuelve rana, salta un rato y vuelve a ser caja. */
async function geFrog(ctx: PowerContext) {
  const candidates = piecesOnScreen(24).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height > 6000 && r.width * r.height < 200000;
  });
  const target = candidates[Math.floor(Math.random() * candidates.length)] ?? centerTarget();
  // Sin nada que convertir, la rana sale igual, de al lado del Stand.
  const r = target?.getBoundingClientRect() ?? new DOMRect(ctx.x - 40, ctx.y - 30, 80, 60);
  const node = layer("power-ge", true);
  const frog = document.createElement("span");
  frog.className = "power-frog";
  frog.innerHTML = `<span class="power-frog-body">${FROG(`frog${++uid}`)}</span>`;
  let fx = r.left + r.width / 2;
  let fy = r.top + r.height / 2;
  frog.style.transform = `translate(${fx}px, ${fy}px)`;
  try {
    lifeBurst(fx, fy, 1.3);
    target?.classList.add("power-ge-morph");
    await wait(450);
    node.appendChild(frog);
    pop("ケロッ", fx + 40, fy - 60, "power-pop-word is-green", 800);
    await wait(500);
    // Saltos por la pantalla, y de vuelta.
    const w = window.innerWidth;
    const hops = 4;
    for (let i = 0; i < hops; i++) {
      const back = i === hops - 1;
      const nx = back ? r.left + r.width / 2 : Math.min(w - 70, Math.max(70, fx + rand(-240, 240)));
      const ny = back ? r.top + r.height / 2 : Math.min(window.innerHeight - 70, Math.max(120, fy + rand(-90, 90)));
      const flip = nx < fx ? -1 : 1;
      frog.animate(
        [
          { transform: `translate(${fx}px, ${fy}px) scale(${1.15 * flip}, 0.8)` },
          { transform: `translate(${(fx + nx) / 2}px, ${Math.min(fy, ny) - 110}px) scale(${0.9 * flip}, 1.15) rotate(${-8 * flip}deg)`, offset: 0.45 },
          { transform: `translate(${nx}px, ${ny}px) scale(${1.2 * flip}, 0.82)`, offset: 0.85 },
          { transform: `translate(${nx}px, ${ny}px) scale(${flip}, 1)` },
        ],
        { duration: ctx.reducedMotion ? 1 : 600, easing: "cubic-bezier(0.3, 0, 0.4, 1)", fill: "forwards" },
      );
      await wait(ctx.reducedMotion ? 120 : 640);
      fx = nx;
      fy = ny;
      if (!back) pop(i % 2 ? "ピョン" : "ケロ", fx, fy - 60, "power-pop-word is-green", 700);
      await wait(220);
    }
    frog.classList.add("is-leaving");
    lifeBurst(fx, fy, 1);
    target?.classList.remove("power-ge-morph");
    target?.classList.add("power-healed-soft");
    await wait(600);
  } finally {
    target?.classList.remove("power-ge-morph", "power-healed-soft");
    node.remove();
  }
}

/** Mariposas que salen de las imagenes y los titulos. */
async function geButterflies(ctx: PowerContext) {
  const sources = onScreen("main img, main h2, main h3, footer h2", 5);
  const origins = sources.length ? sources.map((el) => el.getBoundingClientRect()) : [new DOMRect(ctx.x - 20, ctx.y - 20, 40, 40)];
  const node = layer("power-ge", true);
  const colors = [
    ["#e3b341", "#fff3c4"],
    ["#8fd3f4", "#ece6d8"],
    ["#e891c4", "#fbe1ef"],
    ["#b388eb", "#ece6d8"],
  ];
  origins.forEach((r) => lifeBurst(r.left + r.width / 2, r.top + r.height / 2, 0.9));
  for (let i = 0; i < 14; i++) {
    const r = origins[i % origins.length];
    const [a, b] = colors[i % colors.length];
    sprout(
      node,
      BUTTERFLY(`bf${++uid}`, a, b),
      "power-butterfly",
      r.left + r.width * rand(0.2, 0.8),
      r.top + r.height * rand(0.2, 0.8),
      {
        "--b1x": `${Math.round(rand(-120, 120))}px`,
        "--b1y": `${Math.round(rand(-140, -40))}px`,
        "--b2x": `${Math.round(rand(-260, 260))}px`,
        "--b2y": `${Math.round(rand(-420, -220))}px`,
        "--tilt": `${Math.round(rand(-25, 25))}deg`,
      },
      ctx.reducedMotion ? 0 : i * 90,
    );
  }
  await wait(ctx.reducedMotion ? 1400 : 3800);
  node.classList.add("is-leaving");
  await wait(400);
  node.remove();
}

/** Un titulo se vuelve serpiente: ondula y una serpiente lo cruza. */
async function geSnake(ctx: PowerContext) {
  // Cualquier titulo a la vista, tambien el del hero (arriba de todo no hay h2).
  const target = onScreen("main h1, main h2, main h3, footer h2, main dt", 1)[0];
  if (!target) return geButterflies(ctx);
  const r = target.getBoundingClientRect();
  const node = layer("power-ge", true);
  const snake = document.createElement("span");
  snake.className = "power-snake";
  const len = Math.min(window.innerWidth * 0.5, Math.max(240, r.width * 0.6));
  const id = `sn${++uid}`;
  // Cuerpo en ondas suaves (curvas, no zigzag).
  const waves = 4;
  const seg = len / waves;
  let d = `M0 26`;
  for (let i = 0; i < waves; i++) d += ` q${seg / 2} ${i % 2 ? 22 : -22} ${seg} 0`;
  /*
    Pintada como lo demas de Gold Experience: sin contorno de tinta. El
    cuerpo va en capas (su sombra, el lomo con degradado, la panza clara,
    las escamas y un filo de luz) y la cabeza con volumen y ojo de reptil.
  */
  snake.innerHTML = `<svg width="${len + 60}" height="56" viewBox="0 0 ${len + 60} 56">
    <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#3f8a36"/><stop offset="1" stop-color="#78c25e"/></linearGradient>
    <radialGradient id="${id}h" cx="0.55" cy="0.3" r="0.8"><stop offset="0" stop-color="#a6dc86"/><stop offset="0.6" stop-color="#5fae4b"/><stop offset="1" stop-color="#2f6b2a"/></radialGradient></defs>
    <path d="${d}" fill="none" stroke="rgba(10, 20, 8, 0.3)" stroke-width="14" stroke-linecap="round" transform="translate(2 5)"/>
    <path d="${d}" fill="none" stroke="#2f6b2a" stroke-width="15" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="12" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#d9efb8" stroke-width="3" stroke-linecap="round" transform="translate(0 4)" opacity="0.75"/>
    <path class="scales" d="${d}" fill="none" stroke="#2f6b2a" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round" opacity="0.55"/>
    <path d="${d}" fill="none" stroke="#c6efb0" stroke-width="2" stroke-dasharray="14 10" transform="translate(0 -3.5)" stroke-linecap="round" opacity="0.7"/>
    <g transform="translate(${len} 26)">
      <path class="tongue" d="M24 2 l12 0 l4 -4 m-4 4 l4 4" stroke="#d8443c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M-7 -12.5 Q16 -18 29.5 0 Q16 18 -7 12.5Z" fill="#2f6b2a"/>
      <path d="M-6 -11 Q16 -16 28 0 Q16 16 -6 11Z" fill="url(#${id}h)"/>
      <ellipse cx="12" cy="-5" rx="4.5" ry="3.6" fill="#e3b341"/><ellipse cx="12" cy="-5" rx="1.1" ry="3.1" fill="#1d2a18"/><circle cx="10.6" cy="-6.4" r="0.9" fill="#fff"/>
      <circle cx="23" cy="-2.2" r="0.9" fill="#1d2a18"/>
      <path d="M4 7 Q14 9 24 4" stroke="#24521f" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.6"/>
    </g>
  </svg>`;
  snake.style.left = `${r.left}px`;
  snake.style.top = `${r.bottom - 34}px`;
  snake.style.setProperty("--travel", `${Math.round(r.width + 60)}px`);
  snake.style.setProperty("--start", `${Math.round(-len - 60)}px`);
  lifeBurst(r.left + r.width / 2, r.top + r.height / 2, 1.1);
  node.appendChild(snake);
  target.classList.add("power-ge-wave");
  pop("シャーッ", r.left + r.width * 0.7, r.top - 10, "power-pop-word is-green", 1000);
  try {
    await wait(ctx.reducedMotion ? 1200 : 3200);
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

/** La cinta de VHS rebobinando, como en la intro (CSS .btd-tape). */
function btdTape(seconds: number) {
  const tape = layer("power-btd-bomb btd-tape", true);
  tape.innerHTML =
    `<span class="btd-lines"></span><span class="btd-track"></span>` +
    `<span class="btd-osd"><b>◀◀ REW</b><i>00:00:${String(seconds).padStart(2, "0")}</i></span>` +
    `<span class="btd-title">BITES THE DUST</span>`;
  return tape;
}

/** Cuadro de impacto: destello y negativo, dos cuadros. */
function btdFlash() {
  const flash = layer("power-btd-bomb dust-flash", true);
  window.setTimeout(() => flash.remove(), 170);
}

/**
 * La activacion, como la ultima de Kira en el anime (btd-cut.ts): el Stand
 * grita "¡Bites the Dust!" y el tiempo se lo traga todo antes de que
 * empiece la cinta.
 */
async function btdActivate(parent: HTMLElement, ctx: PowerContext) {
  // Primero lo dice; despues se activa.
  ctx.call?.();
  await wait(1100);
  btdCut(parent);
  playSfx("warudo");
  quake(300, false, true);
  await wait(CUT_MS);
}

/** Bites the Dust: dos formas, al azar (POWER_VARIANTS). */
async function bitesTheDust(ctx: PowerContext) {
  if (ctx.variant === "bomb") return btdBomb(ctx);
  return btdRewind(ctx);
}

/**
 * La bomba, como la entrada del hero (hero-intros/dust.ts): Killer Queen
 * ya toco algo de la pagina cerca del Stand (すでに触っている…), カチッ, y
 * eso explota (boom.ts): lo de alrededor sale volando. Despues, la
 * activacion a pantalla completa (btd-cut.ts) y el rebobinado: donde
 * estaba cada pieza queda su hueco punteado, las piezas vuelven una tras
 * otra por el mismo camino, con su rastro, y la explosion se traga a si
 * misma. Todo queda como estaba.
 */
async function btdBomb(ctx: PowerContext) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const small = w < 640;
  const pieces = piecesOnScreen(36);
  // La bomba: lo mas cercano al Stand que tenga buen tamano.
  let target: HTMLElement | null = null;
  let best = Infinity;
  for (const el of pieces) {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    if (area < 2500 || area > w * h * 0.18) continue;
    const d = Math.hypot(r.left + r.width / 2 - ctx.x, r.top + r.height / 2 - ctx.y);
    if (d < best) {
      best = d;
      target = el;
    }
  }
  if (!target || ctx.reducedMotion) return btdRewind(ctx);
  const tr = target.getBoundingClientRect();
  const spot = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };
  const node = layer("power-btd-bomb", true);
  standInFront(true);
  const flung: { el: HTMLElement; anim: Animation; slot: DOMRect }[] = [];
  const timers: number[] = [];
  let boom: ReturnType<typeof createBoom> | null = null;
  let tape: HTMLElement | null = null;
  let raf = 0;
  try {
    // 1. Ya lo toco.
    target.animate([{ scale: "1" }, { scale: "0.95 1.04" }, { scale: "1" }], { duration: 260, easing: "ease-out", composite: "add" });
    pop("✦", spot.x + rand(-20, 20), spot.y + rand(-14, 14), "power-sparkle", 700);
    pop("すでに触っている…", Math.min(w - 120, Math.max(120, spot.x)), Math.max(90, tr.top - 24), "power-pop-word is-pink", 1200);
    await wait(1000);
    // 2. カチッ.
    pop("カチッ", Math.min(window.innerWidth - 90, Math.max(90, ctx.x)), Math.max(80, ctx.y - 60), "power-pop-word is-pink is-big", 800);
    playSfx("crack");
    await wait(260);

    // 3. La explosion, pintada en su tiempo; antes, los rayos de luz.
    boom = createBoom(node, spot.x, spot.y, true);
    const b = boom;
    const length = PRIME_MS + BOOM_MS * 0.8;
    let shown = -PRIME_MS;
    const t0 = performance.now();
    const play = (now: number) => {
      shown = Math.min(now - t0, length) - PRIME_MS;
      b.draw(shown);
      if (now - t0 < length) raf = requestAnimationFrame(play);
    };
    raf = requestAnimationFrame(play);
    await wait(PRIME_MS);
    playSfx("boom");
    btdFlash();
    pop("ドグォォン!!", Math.min(w - 140, Math.max(140, spot.x)), Math.max(100, spot.y - (small ? 110 : 170)), "power-pop-word is-pink is-big", 1300);
    quake(600, false, true);
    // Lo de alrededor sale volando desde la bomba; la bomba, deshecha.
    const reach = small ? 380 : 620;
    const push = small ? 220 : 400;
    for (const el of pieces) {
      if (flung.some((f) => f.el.contains(el) || el.contains(f.el))) continue;
      const r = el.getBoundingClientRect();
      const ux = r.left + r.width / 2 - spot.x;
      const uy = r.top + r.height / 2 - spot.y;
      const d = Math.max(30, Math.hypot(ux, uy));
      if (el !== target && d > reach) continue;
      const force = push * Math.min(1.6, 260 / d + 0.5);
      const x = (ux / d) * force + rand(-24, 24);
      const y = (uy / d) * force - rand(10, 60);
      const rot = rand(-55, 55);
      const frames: Keyframe[] =
        el === target
          ? [
              { translate: "0 0", scale: "1", opacity: 1 },
              { translate: `0 ${rand(-30, -10).toFixed(0)}px`, scale: "0.3", opacity: 0 },
            ]
          : [
              { translate: "0 0", rotate: "0deg" },
              { translate: `${(x * 0.85).toFixed(0)}px ${(y * 0.85).toFixed(0)}px`, rotate: `${(rot * 0.8).toFixed(0)}deg`, offset: 0.3 },
              { translate: `${x.toFixed(0)}px ${(y + 30).toFixed(0)}px`, rotate: `${rot.toFixed(0)}deg` },
            ];
      const anim = el.animate(frames, { duration: el === target ? 380 : 1100, easing: "cubic-bezier(0.1, 0.85, 0.3, 1)", fill: "both", composite: "add" });
      flung.push({ el, anim, slot: r });
    }
    await wait(1700);

    // 4. バイツァ・ダスト: la activacion a pantalla completa, y la cinta al reves.
    await btdActivate(node, ctx);
    playSfx("rewind");
    tape = btdTape(7);
    const counter = tape.querySelector<HTMLElement>(".btd-osd i");
    const REW = 2000;
    cancelAnimationFrame(raf);
    const from = shown;
    const r0 = performance.now();
    const back = (now: number) => {
      const t = Math.min(1, (now - r0) / (REW * 0.85));
      const k = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      b.draw(from - (from + PRIME_MS) * k);
      if (counter) counter.textContent = `00:00:0${Math.max(0, Math.round(7 * (1 - t)))}`;
      if (t < 1) raf = requestAnimationFrame(back);
    };
    raf = requestAnimationFrame(back);
    // Los huecos: donde estaba cada cosa.
    const slots = flung.map(({ slot }) => {
      const el = document.createElement("span");
      el.className = "btd-slot";
      Object.assign(el.style, { left: `${slot.left}px`, top: `${slot.top}px`, width: `${slot.width}px`, height: `${slot.height}px` });
      node.appendChild(el);
      return el;
    });
    // Una tras otra, por el mismo camino, cada una a su hueco.
    const BACK_MS = 560;
    const order = flung.map((_, i) => i).sort(() => Math.random() - 0.5);
    const spread = Math.max(0, REW - BACK_MS - 260) / Math.max(1, order.length - 1);
    order.forEach((i, k) => {
      timers.push(
        window.setTimeout(() => {
          const { anim, el } = flung[i];
          const total = Number(anim.effect?.getComputedTiming().duration) || 1100;
          anim.pause();
          anim.currentTime = total;
          anim.playbackRate = -total / BACK_MS;
          anim.play();
          let trail = 0;
          const drop = window.setInterval(() => {
            const r = el.getBoundingClientRect();
            const ghost = document.createElement("span");
            ghost.className = "btd-trail";
            Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
            node.appendChild(ghost);
            window.setTimeout(() => ghost.remove(), 380);
            if (++trail > 9) window.clearInterval(drop);
          }, 55);
          timers.push(drop);
          anim.onfinish = () => {
            window.clearInterval(drop);
            slots[i].classList.add("is-filled");
          };
        }, 160 + k * spread),
      );
    });
    await wait(REW + 200);
    tape.classList.add("is-flash");
    await wait(260);
    tape.classList.add("is-leaving");
    await wait(400);
  } finally {
    cancelAnimationFrame(raf);
    timers.forEach((timer) => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    flung.forEach(({ anim }) => anim.cancel());
    boom?.remove();
    tape?.remove();
    node.remove();
    standInFront(false);
  }
}

/**
 * El atraso, como en la Parte 4: カチッ, un destello, la activacion a
 * pantalla completa, y el tiempo se rebobina: la pantalla va para atras a tirones, con la cinta de VHS y
 * las animaciones de la pagina corriendo hacia atras, hasta donde estabas
 * hace un rato. Al volver, el Stand repite lo que habia dicho (deja vu).
 */
async function btdRewind(ctx: PowerContext) {
  const h = window.innerHeight;
  const stage = layer("power-btd-bomb", true);
  standInFront(true);
  let rewind: ReturnType<typeof retime> | null = null;
  let tape: HTMLElement | null = null;
  try {
    if (!ctx.reducedMotion) {
      pop("カチッ", Math.min(window.innerWidth - 90, Math.max(90, ctx.x)), Math.max(80, ctx.y - 60), "power-pop-word is-pink is-big", 800);
      playSfx("crack");
      await wait(420);
      btdFlash();
      await btdActivate(stage, ctx);
      playSfx("rewind");
    }
    // Rebobinar: a tirones, como una cinta.
    tape = btdTape(7);
    const counter = tape.querySelector<HTMLElement>(".btd-osd i");
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
      if (counter) counter.textContent = `00:00:0${steps - i}`;
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
    tape?.remove();
    stage.remove();
  }
}

/* ------------------------------------------------------------------ */
/* King Crimson                                                        */
/* ------------------------------------------------------------------ */

/**
 * King Crimson: se salta el tiempo hasta la siguiente seccion. El Stand se
 * muda mientras la pantalla esta del todo a oscuras (ya en la seccion
 * nueva), asi que al volver la imagen ya esta en otro sitio y no se le ve
 * ir ni queda su silueta.
 */
async function kingCrimson(ctx: PowerContext) {
  const node = layer("power-kc", true);
  await wait(ctx.reducedMotion ? 100 : 380);
  const next = sections().find((el) => el.getBoundingClientRect().top > 60);
  if (next) scrollToY(next.getBoundingClientRect().top + window.scrollY, true);
  if (!ctx.reducedMotion) {
    // Un cuadro despues del salto, aun dentro del tramo oscuro del parpadeo.
    await wait(60);
    ctx.onSkip?.();
  }
  await wait(ctx.reducedMotion ? 300 : 640);
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
