/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pop, rand } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";

/*
  El vidrio de la pantalla en la entrada de Crazy Diamond (ver el efecto
  del relevo en portfolio-hero.tsx): cada puno de la rafaga que choca
  contra la pantalla deja una estrella de grietas donde pega, el golpe
  final la parte entera en una telarana (que tambien cruza cada letra del
  nombre) y suelta trozos de vidrio que caen. Despues Crazy Diamond lo
  arregla: los trozos vuelven a su sitio y todo se repara hacia su puno.

  Es la version barata del poder de Crazy Diamond del mini Stand
  (powers.ts): no rompe ni mueve ninguna pieza de la pagina, sin filtros y
  sin tocar el DOM del resto. Una capa fija con SVG ya dibujado; lo unico
  que se anima son recortes (clip-path) y transform. La telarana crece
  con un circulo que nace en el golpe, y la reparacion es otro circulo que
  se encoge hacia donde esta el Stand, con el rosa de Crazy Diamond.

  Hay dos trazos por grieta, uno de halo (el color del fondo) y otro de
  tinta (el color del texto), para que se lean sobre el tema claro y el
  oscuro sin un `drop-shadow`.
*/

const GROW_MS = 380;

const pts = (list: [number, number][]) => list.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" L");

/*
  Una grieta de vidrio de verdad no es una raya recta: avanza a saltos
  cortos que cambian un poco de direccion (un paseo al azar alrededor del
  angulo de salida). Devuelve los puntos, del centro hacia afuera.
*/
function ray(x: number, y: number, angle: number, len: number, steps: number): [number, number][] {
  const out: [number, number][] = [[x, y]];
  let a = angle;
  let px = x;
  let py = y;
  for (let i = 0; i < steps; i++) {
    a += rand(-0.22, 0.22);
    // Sin alejarse demasiado de su direccion: la grieta corre hacia afuera.
    a = angle + Math.max(-0.35, Math.min(0.35, a - angle));
    const step = (len / steps) * rand(0.6, 1.4);
    px += Math.cos(a) * step;
    py += Math.sin(a) * step;
    out.push([px, py]);
  }
  return out;
}

/** El punto de la grieta a una fraccion de su largo (por indice). */
const at = (points: [number, number][], f: number) => points[Math.min(points.length - 1, Math.max(1, Math.round(f * (points.length - 1))))];

/*
  Un anillo entre dos rayos vecinos: la grieta concentrica que une los
  radiales y hace que se lea como vidrio roto. Curvada (hacia afuera o
  hacia adentro) y con un quiebre en el medio, no una cuerda recta.
*/
function ring(a: [number, number], b: [number, number], cx: number, cy: number) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const k = rand(0.04, 0.14) * (Math.random() < 0.7 ? 1 : -1);
  const kink: [number, number] = [mx + (mx - cx) * k + rand(-3, 3), my + (my - cy) * k + rand(-3, 3)];
  return `M${pts([a, kink, b])}`;
}

/*
  Tres grosores por grieta: halo (el color del fondo, para que se lea en
  los dos temas), tinta y un filo de luz corrido un pixel, el brillo del
  canto del vidrio. Los radiales son gruesos cerca del golpe y finos hacia
  la punta: el tramo de adentro va otra vez, mas grueso.
*/
function paths(thick: string[], thin: string[], glint: string[]) {
  const t = thick.join(" ");
  const f = thin.join(" ");
  return (
    `<path class="hero-crack-halo is-fine" d="${f}"/><path class="hero-crack-halo" d="${t}"/>` +
    `<path class="hero-crack-line is-fine" d="${f}"/><path class="hero-crack-line" d="${t}"/>` +
    `<path class="hero-crack-glint" d="${glint.join(" ")}"/>`
  );
}

/** Los radiales de un golpe, con sus ramas y sus anillos. */
function shatterPattern(x: number, y: number, reach: number, count: number, rings: number[], crush: number) {
  const thick: string[] = [];
  const thin: string[] = [];
  const glint: string[] = [];
  const rays: [number, number][][] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand(-0.25, 0.25);
    // Unos pocos radiales llegan mucho mas lejos que el resto.
    const len = reach * (Math.random() < 0.3 ? rand(0.9, 1.15) : rand(0.45, 0.85));
    const points = ray(x, y, angle, len, Math.max(4, Math.round(len / 22)));
    rays.push(points);
    thin.push(`M${pts(points)}`);
    thick.push(`M${pts(points.slice(0, Math.ceil(points.length * 0.4)))}`);
    if (i % 3 === 0) glint.push(`M${pts(points.slice(1, Math.ceil(points.length * 0.6)).map(([px, py]) => [px + 1.2, py - 1.2]))}`);
    // Una rama que se abre del radial.
    if (Math.random() < 0.55) {
      const from = at(points, rand(0.35, 0.7));
      const side = Math.random() < 0.5 ? -1 : 1;
      thin.push(`M${pts(ray(from[0], from[1], angle + side * rand(0.4, 0.8), len * rand(0.18, 0.35), 3))}`);
    }
  }
  for (const [n, f] of rings.entries()) {
    for (let i = 0; i < count; i++) {
      if (Math.random() > 0.8 - n * 0.18) continue;
      const a = at(rays[i], f * rand(0.85, 1.15));
      const b = at(rays[(i + 1) % count], f * rand(0.85, 1.15));
      (n === 0 ? thick : thin).push(ring(a, b, x, y));
    }
  }
  // El centro, molido: astillas diminutas alrededor del golpe.
  const chips: string[] = [];
  for (let i = 0; i < 9; i++) {
    const a = rand(0, Math.PI * 2);
    const d = crush * rand(0.25, 1);
    const cx = x + Math.cos(a) * d;
    const cy = y + Math.sin(a) * d;
    const s = crush * rand(0.25, 0.5);
    const tri: [number, number][] = [0, 1, 2].map((k) => {
      const b = a + (k * Math.PI * 2) / 3 + rand(-0.4, 0.4);
      return [cx + Math.cos(b) * s, cy + Math.sin(b) * s];
    });
    chips.push(`M${pts(tri)} Z`);
  }
  return { thick, thin, glint, chips: chips.join(" ") };
}

function web(x: number, y: number, w: number, h: number, letters: DOMRect[]) {
  const reach = Math.hypot(w, h);
  const { thick, thin, glint, chips } = shatterPattern(x, y, reach, 13, [0.05, 0.12, 0.22, 0.38], 26);
  // Una grieta cruza cada letra del nombre, de arriba abajo, en zigzag: la
  // pantalla se rompe por donde mas se ve.
  for (const box of letters) {
    const top = box.top - 4;
    const bottom = box.bottom + 4;
    const zig: [number, number][] = [[box.left + box.width * rand(0.15, 0.4), top]];
    for (const t of [0.25, 0.5, 0.75]) zig.push([box.left + box.width * rand(0.2, 0.8), top + (bottom - top) * t]);
    zig.push([box.left + box.width * rand(0.6, 0.85), bottom]);
    thin.push(`M${pts(zig)}`);
  }
  return (
    `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<path class="hero-crack-chips" d="${chips}"/>` +
    paths(thick, thin, glint) +
    `<circle class="hero-crack-dot" cx="${x}" cy="${y}" r="9"/></svg>`
  );
}

/* Estrella de grietas de un golpe: radiales quebrados, ramas, anillos y el centro molido. */
function star(r: number) {
  const { thick, thin, glint, chips } = shatterPattern(r, r, r, Math.round(rand(9, 13)), [0.16, 0.34, 0.58], r * 0.13);
  const size = r * 2;
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<path class="hero-crack-chips" d="${chips}"/>` +
    paths(thick, thin, glint) +
    `<circle class="hero-crack-dot" cx="${r}" cy="${r}" r="${(r * 0.07).toFixed(1)}"/></svg>`
  );
}

/* Un trozo de vidrio: triangulo irregular, casi transparente, con borde de tinta y un brillo. */
function shard(size: number) {
  const a = [rand(0, 0.3) * size, rand(0, 0.35) * size];
  const b = [rand(0.7, 1) * size, rand(0, 0.5) * size];
  const c = [rand(0.2, 0.8) * size, rand(0.75, 1) * size];
  const poly = [a, b, c].map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><polygon class="hero-shard-glass" points="${poly}"/>` +
    `<path class="hero-shard-shine" d="M${(a[0] + 4).toFixed(1)},${(a[1] + 4).toFixed(1)} L${((a[0] + b[0]) / 2).toFixed(1)},${((a[1] + b[1]) / 2 + 3).toFixed(1)}"/></svg>`
  );
}

export interface HeroGlass {
  /** Un puno choca contra la pantalla en (x, y): estrella de grietas de radio r. */
  hit: (x: number, y: number, r: number) => void;
  /** El golpe final: telarana por toda la pantalla y trozos de vidrio que caen. */
  shatter: (x: number, y: number, letters: DOMRect[]) => void;
  /** Lo repara todo hacia (x, y) en `ms` y se retira. Solo la primera vez. */
  heal: (x: number, y: number, ms: number) => void;
  /** Quita todo ya, sin animar. */
  cancel: () => void;
}

/** El vidrio de la pantalla: nace vacio y se va rompiendo golpe a golpe. */
export function createGlass(): HeroGlass {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const node = document.createElement("div");
  node.className = "hero-crack";
  node.setAttribute("aria-hidden", "true");
  document.body.appendChild(node);

  const animations: Animation[] = [];
  const timers: number[] = [];
  const shards: Animation[] = [];
  // Donde nacio la rotura mas grande: el circulo de la reparacion sale de ahi.
  let center = { x: w / 2, y: h / 2 };

  const cancel = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    animations.forEach((animation) => animation.cancel());
    node.remove();
  };

  let healed = false;
  return {
    hit(x, y, r) {
      if (healed) return;
      const crack = document.createElement("div");
      crack.className = "hero-crack-star";
      crack.style.left = `${(x - r).toFixed(0)}px`;
      crack.style.top = `${(y - r).toFixed(0)}px`;
      crack.innerHTML = star(r);
      node.appendChild(crack);
      // La grieta corre desde el golpe hacia afuera, en un parpadeo.
      animations.push(
        crack.animate([{ clipPath: "circle(4% at 50% 50%)" }, { clipPath: "circle(72% at 50% 50%)" }], {
          duration: 120,
          easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
          fill: "both",
        }),
      );
      playSfx("crack");
    },
    shatter(x, y, letters) {
      if (healed) return;
      center = { x, y };
      const reach = Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y)));
      const big = document.createElement("div");
      big.className = "hero-crack-web";
      big.innerHTML = web(x, y, w, h, letters);
      node.appendChild(big);
      animations.push(
        big.animate(
          [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${reach}px at ${x}px ${y}px)` }],
          { duration: GROW_MS, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" },
        ),
      );
      playSfx("crack");

      // El vidrio se suelta: trozos que saltan del golpe y caen girando.
      const count = w < 640 ? 9 : 15;
      for (let i = 0; i < count; i++) {
        const size = rand(w < 640 ? 26 : 36, w < 640 ? 58 : 92);
        const piece = document.createElement("div");
        piece.className = "hero-shard";
        const angle = rand(0, Math.PI * 2);
        const near = rand(10, w < 640 ? 70 : 130);
        const sx = x + Math.cos(angle) * near - size / 2;
        const sy = y + Math.sin(angle) * near - size / 2;
        piece.style.left = `${sx.toFixed(0)}px`;
        piece.style.top = `${sy.toFixed(0)}px`;
        piece.innerHTML = shard(size);
        node.appendChild(piece);
        const out = Math.cos(angle) * rand(60, 220);
        const pop = Math.sin(angle) * rand(30, 90) - rand(20, 70);
        const fall = h - sy + size + rand(0, 120);
        const spin = rand(-260, 260);
        const fly = piece.animate(
          [
            { translate: "0px 0px", rotate: "0deg", offset: 0 },
            { translate: `${(out * 0.4).toFixed(0)}px ${pop.toFixed(0)}px`, rotate: `${(spin * 0.2).toFixed(0)}deg`, offset: 0.22, easing: "cubic-bezier(0.4, 0, 1, 1)" },
            { translate: `${out.toFixed(0)}px ${fall.toFixed(0)}px`, rotate: `${spin.toFixed(0)}deg`, offset: 1 },
          ],
          { duration: rand(900, 1400), delay: rand(0, 90), easing: "cubic-bezier(0.2, 0.7, 0.4, 1)", fill: "both" },
        );
        animations.push(fly);
        shards.push(fly);
      }
      // ドラ ドラ ドラ: el grito de Crazy Diamond, en rosa, alrededor del golpe.
      for (let i = 0; i < 3; i++) {
        timers.push(
          window.setTimeout(() => {
            const angle = rand(0, Math.PI * 2);
            const dist = rand(70, 150);
            pop("ドラ", x + Math.cos(angle) * dist, y + Math.sin(angle) * dist * 0.7, "power-pop-word is-pink", 650);
          }, i * 90),
        );
      }
    },
    heal(tx, ty, ms) {
      if (healed) return;
      healed = true;
      node.classList.add("is-healing");
      playSfx("heal");
      // Los trozos vuelven volando a donde se soltaron, mas rapido que al caer.
      shards.forEach((fly) => {
        fly.updatePlaybackRate(-Math.max(1, (Number(fly.effect?.getComputedTiming().duration) || 1000) / (ms * 0.55)));
        fly.play();
      });
      const reach = Math.ceil(Math.hypot(Math.max(center.x, w - center.x), Math.max(center.y, h - center.y))) + 200;
      const close = node.animate(
        [
          { clipPath: `circle(${reach}px at ${center.x}px ${center.y}px)` },
          { clipPath: `circle(${reach}px at ${center.x}px ${center.y}px)`, offset: 0.35 },
          { clipPath: `circle(0px at ${tx}px ${ty}px)` },
        ],
        { duration: ms, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      animations.push(close);
      close.onfinish = () => {
        // Un destello donde cae: reparado.
        playSfx("thud");
        pop("ドラ", tx, ty - 28, "power-pop-word is-pink", 700);
        for (let i = 0; i < 3; i++) {
          timers.push(window.setTimeout(() => pop("✦", tx + rand(-34, 34), ty + rand(-30, 6), "power-sparkle", 800), i * 70));
        }
        node.remove();
      };
    },
    cancel,
  };
}

export interface Shattered {
  /** Las letras vuelven a su sitio, una tras otra (Crazy Diamond las arregla). Solo la primera vez. */
  mend: (ms: number) => void;
  cancel: () => void;
}

/**
 * Las letras del nombre saltan de su sitio, torcidas, como piezas de vidrio
 * roto, y vuelven con un rebote cuando Crazy Diamond las arregla. Con
 * `from` (el punto del golpe) salen despedidas desde ahi: las de cerca,
 * mas lejos. Solo `translate` y `rotate` (compositor): se suman al
 * `transform` de la animacion de entrada de las letras sin pisarla.
 */
export function shatterLetters(letters: HTMLElement[], from?: { x: number; y: number }): Shattered {
  const states = letters.map((el) => {
    if (!from) return { el, x: rand(-9, 9), y: rand(2, 13), r: rand(-8, 8) };
    const box = el.getBoundingClientRect();
    const dx = box.left + box.width / 2 - from.x;
    const dy = box.top + box.height / 2 - from.y;
    const d = Math.max(40, Math.hypot(dx, dy));
    const push = rand(10, 18) * Math.min(2.4, 260 / d + 0.7);
    return { el, x: (dx / d) * push + rand(-3, 3), y: (dy / d) * push + rand(2, 8), r: rand(-13, 13) };
  });
  const animations: Animation[] = states.map(({ el, x, y, r }) =>
    el.animate(
      [
        { translate: "0px 0px", rotate: "0deg" },
        { translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`, rotate: `${r.toFixed(1)}deg` },
      ],
      { duration: 150, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.3)", fill: "forwards" },
    ),
  );
  let mended = false;
  return {
    mend(ms) {
      if (mended) return;
      mended = true;
      states.forEach(({ el, x, y, r }, i) => {
        animations.push(
          el.animate(
            [
              { translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`, rotate: `${r.toFixed(1)}deg` },
              { translate: "0px 0px", rotate: "0deg" },
            ],
            { duration: ms, delay: i * 16, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "both" },
          ),
        );
      });
    },
    cancel() {
      animations.forEach((animation) => animation.cancel());
    },
  };
}
