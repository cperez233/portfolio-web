/* editorial-ui · Cristian Pérez · cristianperez.me */

import { layer, rand } from "./power-kit";

/*
  La explosion de Killer Queen, compartida por el poder Bites the Dust y su
  entrada en el hero. Lo que toca la bomba se hace pedazos, lo que esta
  pegado queda mordido y chamuscado, lo de al lado sale empujado por la onda
  (primero lo cercano) y en el suelo queda un crater con grietas y humo. El
  fuego y la onda de choque los pinta boom.ts, encima de todo esto.

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
}

type Point = [number, number];

const INK = "#050405";
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
  copy.style.margin = "0";
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

export function detonate({ x, y, radius, reach, target, neighbors, shake, small, ground: given }: BlastOptions): Blast {
  const ground = given ?? layer("blast-ground", true);
  const moved: DOMRect[] = [];
  const animations: Animation[] = [];
  const timers: number[] = [];
  const run = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    const animation = el.animate(frames, { fill: "both", ...options });
    animations.push(animation);
    return animation;
  };
  const place = (el: HTMLElement, size: number) => {
    Object.assign(el.style, { left: `${x - size / 2}px`, top: `${y - size / 2}px`, width: `${size}px`, height: `${size}px` });
    return el;
  };
  const spawn = (parent: HTMLElement, className: string) => {
    const el = document.createElement("div");
    el.className = className;
    parent.appendChild(el);
    return el;
  };

  // --- El crater ------------------------------------------------------
  const crater = spawn(ground, "blast-crater");
  const craterSize = radius * 6.4;
  place(crater, craterSize);
  crater.innerHTML = craterSvg(radius);
  run(
    crater,
    [
      { transform: "scale(0.2)", opacity: 0 },
      { transform: "scale(1.08)", opacity: 1, offset: 0.55 },
      { transform: "scale(1)", opacity: 1 },
    ],
    { duration: 300, delay: 40, easing: "cubic-bezier(0.1, 0.9, 0.2, 1)" },
  );

  // --- Lo que tenia la bomba: en pedazos, y el original deja de estar. --
  if (target) {
    const rect = target.getBoundingClientRect();
    const style = getComputedStyle(target);
    const cols = Math.max(2, Math.min(small ? 3 : 4, Math.round(rect.width / 90)));
    const rows = Math.max(2, Math.min(small ? 3 : 4, Math.round(rect.height / 60)));
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
        const piece = fragment(target, rect, clip, style);
        ground.appendChild(piece);
        const px = rect.left + (clip[0][0] + clip[2][0]) / 2;
        const py = rect.top + (clip[0][1] + clip[2][1]) / 2;
        const dist = Math.max(20, Math.hypot(px - x, py - y));
        const speed = rand(small ? 420 : 620, small ? 820 : 1250);
        run(
          piece,
          ballistic(((px - x) / dist) * speed + rand(-90, 90), ((py - y) / dist) * speed - rand(180, 420), rand(-520, 520), 1.15, 1500),
          { duration: 1150, easing: "linear" },
        );
      }
    }
    run(target, [{ opacity: 0 }, { opacity: 0 }], { duration: 50 });
    moved.push(rect);
  }

  // --- Lo de alrededor: la onda llega primero a lo cercano. -------------
  const maxPush = small ? 92 : 210;
  for (const el of neighbors) {
    if (el === target || (target && (target.contains(el) || el.contains(target)))) continue;
    const rect = el.getBoundingClientRect();
    const nx = Math.max(rect.left, Math.min(x, rect.right));
    const ny = Math.max(rect.top, Math.min(y, rect.bottom));
    const d = Math.hypot(nx - x, ny - y);
    if (d > reach) continue;
    moved.push(rect);
    const force = (1 - d / reach) ** 1.4;
    const cx = rect.left + rect.width / 2 - x;
    const cy = rect.top + rect.height / 2 - y;
    const len = Math.max(1, Math.hypot(cx, cy));
    const push = maxPush * force * rand(0.85, 1.15);
    const dx = (cx / len) * push;
    const dy = (cy / len) * push * 0.82;
    const turn = rand(0.5, 1) * force * (cx >= 0 ? 1 : -1) * (small ? 16 : 13);
    const delay = Math.round(d / (small ? 1.5 : 2.4));
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
    run(
      el,
      [
        { filter: "brightness(1) sepia(0) saturate(1)" },
        { filter: `brightness(${(1 - burn * 0.58).toFixed(2)}) sepia(${(burn * 0.75).toFixed(2)}) saturate(${(1 - burn * 0.25).toFixed(2)})` },
      ],
      { duration: 160, delay },
    );
    // Mordido, salvo que la mordida se lo coma entero (lo chico sale empujado y ya).
    const bite = radius * rand(1.2, 1.42);
    const farthest = Math.hypot(Math.max(x - rect.left, rect.right - x), Math.max(y - rect.top, rect.bottom - y));
    if (d < bite && farthest > bite * 1.25) run(el, Array(2).fill({ clipPath: biteClip(rect, x, y, bite) }), { duration: 60, delay });
  }

  // Cascajo, en todas direcciones.
  const chips = small ? 24 : 44;
  const swatch = ["#2c2527", "#4a3f40", "#6b5c5a", "var(--color-surface-2)", "var(--color-ink)"];
  for (let i = 0; i < chips; i++) {
    const chip = spawn(ground, "blast-chip");
    const size = rand(radius * 0.05, radius * 0.2);
    place(chip, size);
    chip.style.backgroundColor = swatch[Math.floor(rand(0, swatch.length))];
    chip.style.clipPath = `polygon(${rand(0, 40)}% 0%, 100% ${rand(0, 40)}%, ${rand(60, 100)}% 100%, 0% ${rand(60, 100)}%)`;
    const a = rand(0, Math.PI * 2);
    const speed = rand(reach * 0.8, reach * 2.7);
    run(chip, ballistic(Math.cos(a) * speed, Math.sin(a) * speed - rand(120, 420), rand(-900, 900), 1.05, 1700), { duration: 1050, easing: "linear" });
  }

  // Humo que sigue saliendo del crater mientras dure.
  for (let i = 0; i < (small ? 6 : 9); i++) {
    const puff = spawn(ground, "blast-smoke");
    const size = radius * rand(0.9, 1.7);
    place(puff, size);
    puff.style.marginLeft = `${rand(-radius * 0.55, radius * 0.55).toFixed(0)}px`;
    puff.style.setProperty("--rise", `${(-radius * rand(1.6, 2.8)).toFixed(0)}px`);
    puff.style.setProperty("--drift", `${rand(-radius * 0.6, radius * 0.6).toFixed(0)}px`);
    puff.style.animationDelay = `${Math.round(120 + i * 210)}ms`;
    puff.style.animationDuration = `${Math.round(rand(1500, 2300))}ms`;
  }

  // Temblor que se apaga poco a poco, con su medio grado de giro.
  if (shake) {
    const amp = small ? 15 : 26;
    const frames: Keyframe[] = Array.from({ length: 15 }, (_, i) => {
      const fade = (1 - i / 14) ** 1.7;
      const sign = i % 2 ? 1 : -1;
      return {
        translate: `${(sign * amp * fade * rand(0.7, 1)).toFixed(1)}px ${(-sign * amp * 0.8 * fade * rand(0.6, 1)).toFixed(1)}px`,
        rotate: `${(sign * 0.7 * fade).toFixed(2)}deg`,
        scale: i === 0 ? "1.02" : "1",
      };
    });
    frames[14] = { translate: "0px 0px", rotate: "0deg", scale: "1" };
    run(shake, frames, { duration: 860, easing: "linear", composite: "add" });
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
