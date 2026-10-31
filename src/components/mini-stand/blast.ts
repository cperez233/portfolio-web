/* editorial-ui · Cristian Pérez · cristianperez.me */

import { playSfx } from "@/lib/sfx";
import { layer, onScreen, pop, rand } from "./power-kit";

/*
  La explosion de Killer Queen, compartida por el poder Bites the Dust y su
  entrada en el hero. Lo que toca la bomba se hace pedazos, lo que esta
  pegado queda mordido y chamuscado, lo de al lado sale empujado por la onda
  (primero lo cercano) y en el suelo queda un crater con grietas y humo. El
  fuego y la onda de choque los pinta boom.ts, encima de todo esto.

  En el poder, ademas: reaccion en cadena (otras piezas revientan una tras
  otra, cada una con su crater y su onda), lo chico que queda dentro de la
  mordida se destruye, los titulares estallan letra por letra, al texto
  cercano se le caen letras que se apilan abajo y el menu queda colgando de
  una punta.

  Nada se borra de verdad: la pagina solo recibe animaciones de script, que
  se suman a las suyas y no dejan rastro al cancelarse (ver nudge en
  power-kit), y los trozos son copias en una capa aparte. Por eso rewind()
  puede correr todo hacia atras: Bites the Dust.
*/

export interface Blast {
  /** Todo vuelve atras en `ms` y se limpia. */
  rewind: (ms: number) => Promise<void>;
  /** Donde estaba cada cosa que se movio (para marcar su hueco al rebobinar). */
  moved: DOMRect[];
  /** Quita todo ya, sin animar. */
  clear: () => void;
}

export interface BlastOptions {
  x: number;
  y: number;
  /** Radio del crater, en px. */
  radius: number;
  /** Hasta donde llega la onda, en px. */
  reach: number;
  /** Lo que tenia la bomba: se hace pedazos. */
  target?: HTMLElement | null;
  /** Lo que hay alrededor: se muerde, se chamusca y sale empujado segun la distancia. */
  neighbors: HTMLElement[];
  /** Lo que tiembla con el golpe. */
  shake?: Element | null;
  small: boolean;
  /** Capa donde va el crater; sin ella, una fija por debajo del Stand. */
  ground?: HTMLElement;
  /** Lo que revienta despues, una pieza tras otra. */
  chain?: HTMLElement[];
  /** Lo que queda colgando de una punta (el menu flotante). */
  hang?: HTMLElement[];
  /** Al texto cercano se le caen letras. */
  tearText?: boolean;
}

type Point = [number, number];

const INK = "#050405";
/** Cuando revienta la primera pieza de la cadena, y cada cuanto la siguiente. */
const CHAIN_START = 420;
const CHAIN_GAP = 310;
let uid = 0;

const poly = (points: Point[]) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Borde irregular: un circulo con bultos grandes y dientes chicos. */
function jagged(cx: number, cy: number, r: number, count: number, tooth = 0.1): Point[] {
  const lump = rand(0, 6.28);
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    const k = 1 + Math.sin(a * 3 + lump) * 0.06 + rand(-tooth, tooth);
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k] as Point;
  });
}

/** Una grieta que sale del borde del crater, con un quiebre en cada tramo y a veces una rama. */
function crackRay(c: number, r: number, reach: number) {
  const angle = rand(0, Math.PI * 2);
  const points: Point[] = [[c + Math.cos(angle) * r, c + Math.sin(angle) * r]];
  let at = r;
  let dir = angle;
  const branches: Point[][] = [];
  while (at < reach) {
    at += rand(r * 0.28, r * 0.6);
    dir += rand(-0.32, 0.32);
    const last = points[points.length - 1];
    const step = at - Math.hypot(last[0] - c, last[1] - c);
    const next: Point = [last[0] + Math.cos(dir) * step, last[1] + Math.sin(dir) * step];
    points.push(next);
    if (Math.random() < 0.4) {
      const side = dir + rand(0.5, 0.9) * (Math.random() < 0.5 ? -1 : 1);
      const len = rand(r * 0.2, r * 0.45);
      branches.push([next, [next[0] + Math.cos(side) * len, next[1] + Math.sin(side) * len]]);
    }
  }
  return { points, branches };
}

const lineOf = (points: Point[]) => `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}`;

/** El crater, en SVG ya dibujado: solo se anima su transform. */
function craterSvg(r: number) {
  const id = `blast${++uid}`;
  const size = r * 6.4;
  const c = size / 2;
  const rays = Array.from({ length: 13 }, () => crackRay(c, r * 1.02, r * rand(1.9, 3)));
  const cracks = rays.flatMap(({ points, branches }) => [lineOf(points), ...branches.map(lineOf)]).join(" ");
  // El tramo que sale del crater sigue al rojo.
  const hot = rays.map(({ points }) => lineOf(points.slice(0, 2))).join(" ");
  const streaks = Array.from({ length: 20 }, () => {
    const a = rand(0, Math.PI * 2);
    const w = rand(0.05, 0.14);
    const len = r * rand(1.5, 2.5);
    return `<polygon points="${poly([
      [c + Math.cos(a - w) * r, c + Math.sin(a - w) * r],
      [c + Math.cos(a) * len, c + Math.sin(a) * len],
      [c + Math.cos(a + w) * r, c + Math.sin(a + w) * r],
    ])}"/>`;
  }).join("");
  const hatch = Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 2 + rand(-0.05, 0.05);
    const from = r * rand(0.48, 0.62);
    const to = r * rand(0.74, 0.92);
    return `M${(c + Math.cos(a) * from).toFixed(1)} ${(c + Math.sin(a) * from).toFixed(1)} L${(c + Math.cos(a) * to).toFixed(1)} ${(c + Math.sin(a) * to).toFixed(1)}`;
  }).join(" ");
  const rubble = Array.from({ length: 18 }, () => {
    const a = rand(0, Math.PI * 2);
    const d = r * rand(1.02, 1.5);
    const s = r * rand(0.05, 0.13);
    const shade = ["#6b5c5a", "#4a3f40", "#37302f", "#826f68"][Math.floor(rand(0, 4))];
    return `<polygon points="${poly(jagged(c + Math.cos(a) * d, c + Math.sin(a) * d, s, 5, 0.3))}" fill="${shade}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }).join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="${id}s"><stop offset="0.36" stop-color="#050304" stop-opacity="0.92"/><stop offset="0.62" stop-color="#050304" stop-opacity="0.5"/><stop offset="1" stop-color="#050304" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d5f5c"/><stop offset="1" stop-color="#1b1617"/></linearGradient>
      <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#060506"/><stop offset="1" stop-color="#4a3c3b"/></linearGradient>
      <radialGradient id="${id}g"><stop offset="0" stop-color="#ffb35c"/><stop offset="0.4" stop-color="#ff5a2b" stop-opacity="0.75"/><stop offset="1" stop-color="#7a1414" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="${c}" cy="${c}" r="${r * 2.75}" fill="url(#${id}s)"/>
    <g fill="#050304" opacity="0.72">${streaks}</g>
    <path d="${cracks}" fill="none" stroke="${INK}" stroke-width="${Math.max(2.5, r * 0.035)}" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${cracks}" fill="none" stroke="#f3e6d0" stroke-opacity="0.32" stroke-width="1" transform="translate(1.2 1.2)" stroke-linejoin="round" stroke-linecap="round"/>
    <path class="blast-hot" d="${hot}" fill="none" stroke="#ff8a3c" stroke-width="${Math.max(1.5, r * 0.022)}" stroke-linecap="round"/>
    <polygon points="${poly(jagged(c, c, r * 1.13, 30))}" fill="url(#${id}l)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <polygon points="${poly(jagged(c, c, r * 0.97, 30))}" fill="url(#${id}w)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <polygon points="${poly(jagged(c, c, r * 0.68, 24, 0.07))}" fill="#150f10"/>
    <path d="${hatch}" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>
    <polygon points="${poly(jagged(c, c, r * 0.42, 18, 0.08))}" fill="#030202"/>
    <circle class="blast-hot" cx="${c}" cy="${c}" r="${r * 0.4}" fill="url(#${id}g)"/>
    ${rubble}
  </svg>`;
}

/** Tiro con roce y gravedad, muestreado: los WAAPI no tienen parabolas. */
function ballistic(vx: number, vy: number, spin: number, seconds: number, gravity: number): Keyframe[] {
  const drag = 1.9;
  return Array.from({ length: 9 }, (_, i) => {
    const t = (i / 8) * seconds;
    const eased = (1 - Math.exp(-drag * t)) / drag;
    const x = vx * eased;
    const y = vy * eased + 0.5 * gravity * t * t;
    return { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(spin * eased).toFixed(1)}deg)` };
  });
}

/** Como ballistic, pero rebota en los lados, cae al suelo de la pantalla, da un botecito y se queda ahi. */
function tumble(rect: DOMRect, vx: number, vy: number, spin: number, seconds: number, gravity: number): Keyframe[] {
  const floor = Math.max(12, window.innerHeight - rect.bottom - rand(2, 26));
  const minX = 4 - rect.left;
  const maxX = window.innerWidth - rect.right - 4;
  const drag = 1.9;
  const steps = 18;
  let landed = -1;
  let restX = 0;
  let restTurn = 0;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * seconds;
    const eased = (1 - Math.exp(-drag * t)) / drag;
    let x = Math.max(minX, Math.min(maxX, vx * eased));
    let y = vy * eased + 0.5 * gravity * t * t;
    let turn = spin * eased;
    if (landed < 0 && y >= floor && t > 0) {
      landed = t;
      restX = x;
      restTurn = turn;
    }
    if (landed >= 0) {
      const after = (t - landed) / 0.22;
      x = restX;
      turn = restTurn;
      y = floor - (after < 1 ? Math.sin(after * Math.PI) * 16 : 0);
    }
    return { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${turn.toFixed(1)}deg)` };
  });
}

interface Glyph {
  char: string;
  rect: DOMRect;
  style: CSSStyleDeclaration;
}

/** Cada letra visible de un elemento, con su sitio en pantalla. */
function glyphs(el: HTMLElement, max: number) {
  const out: Glyph[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node && out.length < max; node = walker.nextNode() as Text | null) {
    const style = node.parentElement && getComputedStyle(node.parentElement);
    if (!style) continue;
    for (let i = 0; i < node.data.length && out.length < max; i++) {
      const code = node.data.codePointAt(i) ?? 0;
      const size = code > 0xffff ? 2 : 1;
      const char = node.data.slice(i, i + size);
      if (char.trim()) {
        range.setStart(node, i);
        range.setEnd(node, i + size);
        const rect = range.getBoundingClientRect();
        const seen = rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight;
        if (seen && rect.width >= 2 && rect.height >= 4) out.push({ char, rect, style });
      }
      i += size - 1;
    }
  }
  return out;
}

/** Una letra suelta, igual a la del original. */
function letterNode({ char, rect, style }: Glyph) {
  const el = document.createElement("span");
  el.className = "blast-letter";
  el.textContent = char;
  const clear = (color: string) => color === "transparent" || color === "rgba(0, 0, 0, 0)";
  Object.assign(el.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    lineHeight: `${rect.height}px`,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textTransform: style.textTransform,
    color: clear(style.color) || clear(style.webkitTextFillColor) ? "var(--color-ink)" : style.color,
  });
  return el;
}

/*
  Agujero con forma de mordida, en coordenadas del elemento: el contorno
  del rectangulo mas el circulo dentado, con evenodd.
*/
function biteClip(rect: DOMRect, x: number, y: number, r: number) {
  const { width: w, height: h } = rect;
  const hole = jagged(x - rect.left, y - rect.top, r, 22, 0.13);
  const outer = `-40px -40px, ${w + 40}px -40px, ${w + 40}px ${h + 40}px, -40px ${h + 40}px, -40px -40px`;
  const inner = [...hole, hole[0]].map(([px, py]) => `${px.toFixed(1)}px ${py.toFixed(1)}px`).join(", ");
  return `polygon(evenodd, ${outer}, ${inner}, -40px -40px)`;
}

/** Huecos con la forma de las letras que se cayeron. */
function lettersClip(rect: DOMRect, holes: DOMRect[]) {
  const { width: w, height: h } = rect;
  const corner = "-40px -40px";
  const outer = `${corner}, ${w + 40}px -40px, ${w + 40}px ${h + 40}px, -40px ${h + 40}px, ${corner}`;
  const inner = holes.map((hole) => {
    const l = (hole.left - rect.left).toFixed(1);
    const t = (hole.top - rect.top).toFixed(1);
    const r = (hole.right - rect.left).toFixed(1);
    const b = (hole.bottom - rect.top).toFixed(1);
    return `${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px, ${l}px ${t}px, ${corner}`;
  });
  return `polygon(evenodd, ${outer}, ${inner.join(", ")})`;
}

/** Copia de `el` recortada a un trozo. Sin ids ni nada que la pagina confunda con el original. */
function fragment(el: HTMLElement, rect: DOMRect, clip: Point[], style: CSSStyleDeclaration) {
  const wrap = document.createElement("div");
  wrap.className = "blast-frag";
  wrap.inert = true;
  const copy = el.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll<HTMLElement>("*")]) {
    node.removeAttribute("id");
    node.removeAttribute("data-spot");
  }
  // Un canvas se copia en blanco: se le pasa lo que tiene pintado.
  const painted = el.querySelectorAll("canvas");
  copy.querySelectorAll("canvas").forEach((canvas, i) => {
    try {
      canvas.getContext("2d")?.drawImage(painted[i], 0, 0);
    } catch {
      // Sin acceso a sus pixeles se va en blanco.
    }
  });
  copy.style.margin = "0";
  copy.style.position = "relative";
  copy.style.inset = "0";
  if (style.display === "inline") copy.style.display = "inline-block";
  copy.style.width = "100%";
  copy.style.height = "100%";
  copy.style.translate = "none";
  copy.style.transform = "none";
  Object.assign(wrap.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    clipPath: `polygon(${clip.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`,
    color: style.color,
    font: style.font,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    textTransform: style.textTransform,
    textShadow: style.textShadow,
  });
  wrap.appendChild(copy);
  return wrap;
}

export function detonate({ x, y, radius, reach, target, neighbors, shake, small, ground: given, chain = [], hang = [], tearText = false }: BlastOptions): Blast {
  const ground = given ?? layer("blast-ground", true);
  const moved: DOMRect[] = [];
  const animations: Animation[] = [];
  const timers: number[] = [];
  /** Lo que ya no va a estar: ni se empuja ni se muerde. */
  const doomed = new Set<HTMLElement>(chain);
  if (target) doomed.add(target);
  const noted = new Set<HTMLElement>();
  const bitten = new Set<HTMLElement>();
  const burnt = new Map<HTMLElement, number>();
  const note = (el: HTMLElement, rect: DOMRect) => {
    if (noted.has(el)) return;
    noted.add(el);
    moved.push(rect);
  };
  const run = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = el.animate(frames, { fill: "both", ...options });
    animations.push(animation);
    return animation;
  };
  /** Con retraso: no se ve hasta su momento, ni delante del original mientras tiembla. */
  const appear = (el: HTMLElement, delay: number) => {
    if (!delay) return;
    el.style.visibility = "hidden";
    run(el, [{ visibility: "visible" }, { visibility: "visible" }], { duration: 1, delay, fill: "forwards" });
  };
  const place = (el: HTMLElement, cx: number, cy: number, size: number) => {
    Object.assign(el.style, { left: `${cx - size / 2}px`, top: `${cy - size / 2}px`, width: `${size}px`, height: `${size}px` });
    return el;
  };
  const spawn = (parent: HTMLElement, className: string) => {
    const el = document.createElement("div");
    el.className = className;
    parent.appendChild(el);
    return el;
  };

  // --- El crater ------------------------------------------------------
  const craterAt = (cx: number, cy: number, r: number, delay: number) => {
    const crater = spawn(ground, "blast-crater");
    place(crater, cx, cy, r * 6.4);
    crater.innerHTML = craterSvg(r);
    run(
      crater,
      [
        { transform: "scale(0.2)", opacity: 0 },
        { transform: "scale(1.08)", opacity: 1, offset: 0.55 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 300, delay: delay + 40, easing: "cubic-bezier(0.1, 0.9, 0.2, 1)" },
    );
  };

  // --- Lo que explota: en pedazos, y el original deja de estar. ---------
  const shatter = (el: HTMLElement, cx: number, cy: number, delay: number, most: number) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    doomed.add(el);
    note(el, rect);
    // Un titular revienta letra por letra.
    const letters = /^H[1-4]$/.test(el.tagName) ? glyphs(el, small ? 46 : 80) : [];
    if (letters.length && letters.length < (small ? 46 : 80)) {
      for (const glyph of letters) {
        const piece = letterNode(glyph);
        ground.appendChild(piece);
        appear(piece, delay);
        const px = glyph.rect.left + glyph.rect.width / 2;
        const py = glyph.rect.top + glyph.rect.height / 2;
        const dist = Math.max(20, Math.hypot(px - cx, py - cy));
        const speed = rand(small ? 300 : 460, small ? 720 : 1050);
        run(
          piece,
          tumble(glyph.rect, ((px - cx) / dist) * speed + rand(-70, 70), ((py - cy) / dist) * speed - rand(220, 480), rand(-620, 620), 1.5, 1500),
          { duration: 1500, delay, easing: "linear" },
        );
      }
    } else {
      const cols = Math.max(2, Math.min(most, Math.round(rect.width / 90)));
      const rows = Math.max(2, Math.min(most, Math.round(rect.height / 60)));
      // Rejilla con los vertices corridos: los trozos encajan entre si.
      const vertex: Point[][] = Array.from({ length: rows + 1 }, (_, r) =>
        Array.from({ length: cols + 1 }, (_, c) => {
          const edgeX = c === 0 || c === cols;
          const edgeY = r === 0 || r === rows;
          const px = (c / cols) * rect.width + (edgeX ? 0 : rand(-0.28, 0.28) * (rect.width / cols));
          const py = (r / rows) * rect.height + (edgeY ? 0 : rand(-0.28, 0.28) * (rect.height / rows));
          return [px, py] as Point;
        }),
      );
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const clip = [vertex[r][c], vertex[r][c + 1], vertex[r + 1][c + 1], vertex[r + 1][c]];
          const piece = fragment(el, rect, clip, style);
          ground.appendChild(piece);
          appear(piece, delay);
          const px = rect.left + (clip[0][0] + clip[2][0]) / 2;
          const py = rect.top + (clip[0][1] + clip[2][1]) / 2;
          const dist = Math.max(20, Math.hypot(px - cx, py - cy));
          const speed = rand(small ? 420 : 620, small ? 820 : 1250);
          run(
            piece,
            ballistic(((px - cx) / dist) * speed + rand(-90, 90), ((py - cy) / dist) * speed - rand(180, 420), rand(-520, 520), 1.15, 1500),
            { duration: 1150, delay, easing: "linear" },
          );
        }
      }
    }
    run(el, [{ opacity: 0 }, { opacity: 0 }], { duration: 50, delay, fill: "forwards" });
  };

  // --- Lo de alrededor: la onda llega primero a lo cercano. -------------
  let wrecked = 0;
  const wave = (cx: number, cy: number, r: number, far: number, base: number, maxPush: number) => {
    for (const el of neighbors) {
      if (doomed.has(el) || target?.contains(el)) continue;
      // La tarjeta donde estaba la bomba: mordida, pero no sale volando entera.
      const holds = !!target && el.contains(target);
      const rect = el.getBoundingClientRect();
      const nx = Math.max(rect.left, Math.min(cx, rect.right));
      const ny = Math.max(rect.top, Math.min(cy, rect.bottom));
      const d = Math.hypot(nx - cx, ny - cy);
      if (d > far) continue;
      const delay = base + Math.round(d / (small ? 1.5 : 2.4));
      const bite = r * rand(1.2, 1.42);
      const farthest = Math.hypot(Math.max(cx - rect.left, rect.right - cx), Math.max(cy - rect.top, rect.bottom - cy));
      // Lo chico que queda dentro de la mordida no sobrevive.
      if (!holds && farthest <= bite * 1.25 && wrecked < (small ? 6 : 10)) {
        wrecked += 1;
        shatter(el, cx, cy, delay, 2);
        continue;
      }
      note(el, rect);
      const force = (1 - d / far) ** 1.4 * (holds ? 0.4 : 1);
      const mx = rect.left + rect.width / 2 - cx;
      const my = rect.top + rect.height / 2 - cy;
      const len = Math.max(1, Math.hypot(mx, my));
      const push = maxPush * force * rand(0.85, 1.15);
      const dx = (mx / len) * push;
      const dy = (my / len) * push * 0.82;
      const turn = rand(0.5, 1) * force * (mx >= 0 ? 1 : -1) * (small ? 16 : 13);
      run(
        el,
        [
          { translate: "0px 0px", rotate: "0deg" },
          { translate: `${(dx * 1.2).toFixed(1)}px ${(dy * 1.2).toFixed(1)}px`, rotate: `${(turn * 1.3).toFixed(1)}deg`, offset: 0.22, easing: "cubic-bezier(0.2, 0, 0.3, 1)" },
          { translate: `${dx.toFixed(1)}px ${dy.toFixed(1)}px`, rotate: `${turn.toFixed(1)}deg` },
        ],
        { duration: 620, delay, easing: "cubic-bezier(0.05, 0.9, 0.2, 1)", composite: "add" },
      );
      const burn = Math.min(1, force * 1.5);
      // La segunda onda no aclara lo que la primera ya quemo.
      if (burn > (burnt.get(el) ?? 0)) {
        burnt.set(el, burn);
        run(
          el,
          [
            { filter: "brightness(1) sepia(0) saturate(1)" },
            { filter: `brightness(${(1 - burn * 0.58).toFixed(2)}) sepia(${(burn * 0.75).toFixed(2)}) saturate(${(1 - burn * 0.25).toFixed(2)})` },
          ],
          { duration: 160, delay, fill: "forwards" },
        );
      }
      if (d < bite && !bitten.has(el)) {
        bitten.add(el);
        run(el, Array(2).fill({ clipPath: biteClip(rect, cx, cy, bite) }), { duration: 60, delay, fill: "forwards" });
      }
    }
  };

  // Cascajo, en todas direcciones.
  const swatch = ["#2c2527", "#4a3f40", "#6b5c5a", "var(--color-surface-2)", "var(--color-ink)"];
  const debris = (cx: number, cy: number, r: number, far: number, count: number, delay: number) => {
    for (let i = 0; i < count; i++) {
      const chip = spawn(ground, "blast-chip");
      place(chip, cx, cy, rand(r * 0.05, r * 0.2));
      chip.style.backgroundColor = swatch[Math.floor(rand(0, swatch.length))];
      chip.style.clipPath = `polygon(${rand(0, 40)}% 0%, 100% ${rand(0, 40)}%, ${rand(60, 100)}% 100%, 0% ${rand(60, 100)}%)`;
      appear(chip, delay);
      const a = rand(0, Math.PI * 2);
      const speed = rand(far * 0.8, far * 2.7);
      run(chip, ballistic(Math.cos(a) * speed, Math.sin(a) * speed - rand(120, 420), rand(-900, 900), 1.05, 1700), { duration: 1050, delay, easing: "linear" });
    }
  };

  // Humo que sigue saliendo del crater mientras dure.
  const smoke = (cx: number, cy: number, r: number, count: number, delay: number) => {
    for (let i = 0; i < count; i++) {
      const puff = spawn(ground, "blast-smoke");
      place(puff, cx, cy, r * rand(0.9, 1.7));
      puff.style.marginLeft = `${rand(-r * 0.55, r * 0.55).toFixed(0)}px`;
      puff.style.setProperty("--rise", `${(-r * rand(1.6, 2.8)).toFixed(0)}px`);
      puff.style.setProperty("--drift", `${rand(-r * 0.6, r * 0.6).toFixed(0)}px`);
      puff.style.animationDelay = `${Math.round(delay + 120 + i * 210)}ms`;
      puff.style.animationDuration = `${Math.round(rand(1500, 2300))}ms`;
    }
  };

  // Temblor que se apaga poco a poco, con su medio grado de giro.
  const quakeAt = (amp: number, delay: number, ms: number) => {
    if (!shake) return;
    const frames: Keyframe[] = Array.from({ length: 15 }, (_, i) => {
      const fade = (1 - i / 14) ** 1.7;
      const sign = i % 2 ? 1 : -1;
      // En celular solo vertical: de lado, la pagina se saldria de la pantalla.
      return {
        translate: `${small ? 0 : (sign * amp * fade * rand(0.7, 1)).toFixed(1)}px ${(-sign * amp * 0.8 * fade * rand(0.6, 1)).toFixed(1)}px`,
        rotate: `${small ? 0 : (sign * 0.7 * fade).toFixed(2)}deg`,
        scale: i === 0 && !small ? "1.02" : "1",
      };
    });
    frames[14] = { translate: "0px 0px", rotate: "0deg", scale: "1" };
    run(shake, frames, { duration: ms, delay, easing: "linear", composite: "add", fill: "forwards" });
  };

  // --- La bomba ---------------------------------------------------------
  const maxPush = small ? 92 : 210;
  craterAt(x, y, radius, 0);
  if (target) shatter(target, x, y, 0, small ? 3 : 4);
  wave(x, y, radius, reach, 0, maxPush);
  debris(x, y, radius, reach, small ? 24 : 44, 0);
  smoke(x, y, radius, small ? 6 : 9, 0);
  quakeAt(small ? 15 : 26, 0, 860);

  // --- La cadena: una pieza tras otra, cada una con su crater y su onda. -
  const origins = [{ x, y, far: reach, delay: 0 }];
  chain.forEach((el, i) => {
    const delay = CHAIN_START + i * CHAIN_GAP;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const r = Math.max(radius * 0.32, Math.min(radius * 0.62, Math.min(rect.width, rect.height) * 0.42));
    const far = r * (small ? 3.6 : 4.2);
    origins.push({ x: cx, y: cy, far, delay });
    craterAt(cx, cy, r, delay);
    shatter(el, cx, cy, delay, small ? 2 : 3);
    const fire = spawn(ground, "blast-fire");
    place(fire, cx, cy, r * 3.6);
    appear(fire, delay);
    run(
      fire,
      [
        { transform: "scale(0.15)", opacity: 1 },
        { transform: "scale(1)", opacity: 1, offset: 0.34 },
        { transform: "scale(1.22)", opacity: 0 },
      ],
      { duration: 620, delay, easing: "cubic-bezier(0.1, 0.8, 0.3, 1)" },
    );
    wave(cx, cy, r, far, delay, maxPush * 0.5);
    debris(cx, cy, r, far, small ? 8 : 14, delay);
    smoke(cx, cy, r, small ? 2 : 3, delay);
    quakeAt(small ? 7 : 11, delay, 420);
    timers.push(
      window.setTimeout(() => {
        playSfx("thud");
        pop("ドン!", Math.min(window.innerWidth - 60, Math.max(60, cx)), Math.max(90, cy - r * 1.3), "power-pop-word is-pink", 700);
      }, delay),
    );
  });

  // --- El menu: queda colgando de la punta que la onda no alcanzo. ------
  for (const el of hang) {
    if (doomed.has(el)) continue;
    const rect = el.getBoundingClientRect();
    note(el, rect);
    const fromLeft = x < rect.left + rect.width / 2;
    const origin = fromLeft ? "100% 50%" : "0% 50%";
    const angle = (fromLeft ? -1 : 1) * (small ? 11 : 9);
    const delay = Math.round(Math.hypot(rect.left + rect.width / 2 - x, rect.top - y) / 2.4);
    run(el, [{ transformOrigin: origin }, { transformOrigin: origin }], { duration: 1 });
    const swing = [0, 1.35, 0.72, 1.14, 0.93, 1];
    run(
      el,
      swing.map((k, i) => ({ rotate: `${(angle * k).toFixed(2)}deg`, offset: [0, 0.16, 0.36, 0.56, 0.78, 1][i] })),
      { duration: 1250, delay, easing: "ease-in-out", composite: "add" },
    );
  }

  // --- El texto: las letras se sueltan y se apilan abajo. ----------------
  if (tearText) {
    let budget = small ? 44 : 90;
    const hosts = onScreen("main h1, main h2, main h3, main h4, main p, main li, footer p, footer li, footer h2, footer h3", 40);
    for (const host of hosts) {
      if (budget <= 0) break;
      if (bitten.has(host) || [...doomed].some((el) => el.contains(host))) continue;
      const rect = host.getBoundingClientRect();
      if (!origins.some((o) => Math.hypot(Math.max(rect.left - o.x, 0, o.x - rect.right), Math.max(rect.top - o.y, 0, o.y - rect.bottom)) < o.far)) continue;
      const loose: Glyph[] = [];
      let delay = Infinity;
      for (const glyph of glyphs(host, 240)) {
        const gx = glyph.rect.left + glyph.rect.width / 2;
        const gy = glyph.rect.top + glyph.rect.height / 2;
        for (const o of origins) {
          const force = 1 - Math.hypot(gx - o.x, gy - o.y) / o.far;
          if (force <= 0 || budget <= 0 || Math.random() > force ** 0.8 * 0.8) continue;
          loose.push(glyph);
          budget -= 1;
          delay = Math.min(delay, o.delay + Math.round(Math.hypot(gx - o.x, gy - o.y) / 2.4));
          break;
        }
      }
      if (!loose.length) continue;
      run(host, Array(2).fill({ clipPath: lettersClip(rect, loose.map((g) => g.rect)) }), { duration: 60, delay, fill: "forwards" });
      for (const glyph of loose) {
        const piece = letterNode(glyph);
        ground.appendChild(piece);
        appear(piece, delay);
        run(piece, tumble(glyph.rect, rand(-110, 110), rand(-240, -40), rand(-360, 360), 1.5, 1300), { duration: 1500, delay, easing: "linear" });
      }
    }
  }

  let cleared = false;
  const clear = () => {
    if (cleared) return;
    cleared = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    animations.forEach((animation) => animation.cancel());
    ground.remove();
  };

  return {
    clear,
    moved,
    rewind: (ms) =>
      new Promise((resolve) => {
        ground.classList.add("is-rewinding");
        for (const animation of animations) {
          // Las que aun no empiezan no tienen nada que devolver.
          const at = Number(animation.currentTime ?? 0);
          const end = Number(animation.effect?.getComputedTiming().endTime ?? 0);
          if (at <= 0 || end <= 0) continue;
          animation.updatePlaybackRate(-Math.min(at, end) / ms);
          animation.play();
        }
        timers.push(
          window.setTimeout(() => {
            clear();
            resolve();
          }, ms),
        );
      }),
  };
}
