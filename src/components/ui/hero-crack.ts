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

function web(x: number, y: number, w: number, h: number, letters: DOMRect[]) {
  const reach = Math.hypot(w, h);
  const branches = 11;
  const rays: [number, number][][] = [];
  const lines: string[] = [];
  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * Math.PI * 2 + rand(-0.2, 0.2);
    const points: [number, number][] = [[x, y]];
    let r = 0;
    while (r < reach) {
      r += rand(45, 120);
      const jitter = rand(-0.14, 0.14);
      points.push([x + Math.cos(angle + jitter) * r, y + Math.sin(angle + jitter) * r]);
    }
    rays.push(points);
    lines.push(`M${pts(points)}`);
  }
  // Anillos entre ramas vecinas: lo que hace que parezca vidrio roto.
  for (const ring of [1, 2, 4]) {
    for (let i = 0; i < branches; i++) {
      const a = rays[i][ring];
      const b = rays[(i + 1) % branches][ring];
      if (a && b && Math.random() < 0.8) lines.push(`M${pts([a, b])}`);
    }
  }
  // Una grieta cruza cada letra del nombre, de arriba abajo, en zigzag: la
  // pantalla se rompe por donde mas se ve.
  for (const box of letters) {
    const top = box.top - 4;
    const bottom = box.bottom + 4;
    const zig: [number, number][] = [[box.left + box.width * rand(0.15, 0.4), top]];
    for (const t of [0.33, 0.66]) zig.push([box.left + box.width * rand(0.2, 0.8), top + (bottom - top) * t]);
    zig.push([box.left + box.width * rand(0.6, 0.85), bottom]);
    lines.push(`M${pts(zig)}`);
  }
  const d = lines.join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path class="hero-crack-halo" d="${d}"/><path class="hero-crack-line" d="${d}"/></svg>`;
}

/* Estrella de grietas de un golpe: rayos cortos, un anillo y el punto blanco del impacto. */
function star(r: number) {
  const rays = Math.round(rand(6, 9));
  const lines: string[] = [];
  const ends: [number, number][] = [];
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2 + rand(-0.3, 0.3);
    const len = r * rand(0.55, 1);
    const bend = rand(-0.25, 0.25);
    const mid: [number, number] = [r + Math.cos(angle) * len * 0.5, r + Math.sin(angle) * len * 0.5];
    const end: [number, number] = [r + Math.cos(angle + bend) * len, r + Math.sin(angle + bend) * len];
    ends.push([r + Math.cos(angle) * len * 0.38, r + Math.sin(angle) * len * 0.38]);
    lines.push(`M${pts([[r, r], mid, end])}`);
  }
  lines.push(`M${pts(ends)} Z`);
  const d = lines.join(" ");
  const size = r * 2;
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle class="hero-crack-dot" cx="${r}" cy="${r}" r="${(r * 0.16).toFixed(1)}"/>` +
    `<path class="hero-crack-halo" d="${d}"/><path class="hero-crack-line" d="${d}"/></svg>`
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
      animations.push(
        crack.animate([{ scale: "0.4", opacity: 0.4 }, { scale: "1", opacity: 1 }], {
          duration: 90,
          easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
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
