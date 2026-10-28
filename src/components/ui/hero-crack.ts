/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pop, rand } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";

/*
  Grietas en la pantalla cuando el Stand se manifiesta, y Crazy Diamond que
  las repara cuando se hace chico (ver el efecto del relevo en
  portfolio-hero.tsx). Es la version barata del poder de Crazy Diamond del
  mini Stand (powers.ts): solo la telarana de grietas, sin romper ni mover
  ninguna pieza de la pagina, sin filtros y sin tocar el DOM del resto.

  Una sola capa fija con el SVG ya dibujado: no se anima nada dentro. Lo
  unico que se mueve es el `clip-path` de la capa, un circulo que crece
  desde el golpe (las grietas se propagan) y que luego se encoge hacia
  donde aterriza el Stand (se reparan, con el rosa de Crazy Diamond). El
  SVG se rasteriza una vez; el recorte lo resuelve el compositor.

  Hay dos trazos por grieta, uno de halo (el color del fondo) y otro de
  tinta (el color del texto), para que se lean sobre el tema claro y el
  oscuro sin un `drop-shadow`.
*/

const GROW_MS = 380;

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
    lines.push(`M${points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" L")}`);
  }
  // Anillos entre ramas vecinas: lo que hace que parezca vidrio roto.
  for (const ring of [1, 2, 4]) {
    for (let i = 0; i < branches; i++) {
      const a = rays[i][ring];
      const b = rays[(i + 1) % branches][ring];
      if (a && b && Math.random() < 0.8) lines.push(`M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`);
    }
  }
  // Una grieta cruza cada letra del nombre, de arriba abajo, en zigzag: la
  // pantalla se rompe por donde mas se ve.
  for (const box of letters) {
    const top = box.top - 4;
    const bottom = box.bottom + 4;
    const pts: [number, number][] = [[box.left + box.width * rand(0.15, 0.4), top]];
    for (const t of [0.33, 0.66]) pts.push([box.left + box.width * rand(0.2, 0.8), top + (bottom - top) * t]);
    pts.push([box.left + box.width * rand(0.6, 0.85), bottom]);
    lines.push(`M${pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" L")}`);
  }
  const d = lines.join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path class="hero-crack-halo" d="${d}"/><path class="hero-crack-line" d="${d}"/></svg>`;
}

export interface HeroCrack {
  /** Repara las grietas hacia (x, y) en `ms` y se retira. */
  heal: (x: number, y: number, ms: number) => void;
  /** Quita todo ya, sin animar. */
  cancel: () => void;
}

/** Agrieta la pantalla desde (x, y); `letters` son las cajas de las letras que tambien se parten. */
export function playHeroCrack(x: number, y: number, letters: DOMRect[] = []): HeroCrack {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const reach = Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y)));
  const node = document.createElement("div");
  node.className = "hero-crack";
  node.setAttribute("aria-hidden", "true");
  node.innerHTML = web(x, y, w, h, letters);
  node.style.clipPath = `circle(0px at ${x}px ${y}px)`;
  document.body.appendChild(node);

  const animations: Animation[] = [];
  const timers: number[] = [];
  playSfx("crack");
  const grow = node.animate(
    [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${reach}px at ${x}px ${y}px)` }],
    { duration: GROW_MS, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" },
  );
  animations.push(grow);

  // ドラ ドラ ドラ: el grito de Crazy Diamond, en rosa, alrededor del golpe.
  for (let i = 0; i < 3; i++) {
    timers.push(
      window.setTimeout(() => {
        const angle = rand(0, Math.PI * 2);
        const dist = rand(60, 130);
        pop("ドラ", x + Math.cos(angle) * dist, y + Math.sin(angle) * dist * 0.7, "power-pop-word is-pink", 650);
      }, i * 90),
    );
  }

  const cancel = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    animations.forEach((animation) => animation.cancel());
    node.remove();
  };

  return {
    heal(tx, ty, ms) {
      node.classList.add("is-healing");
      playSfx("heal");
      grow.commitStyles();
      const heal = node.animate(
        [{ clipPath: `circle(${reach}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${tx}px ${ty}px)` }],
        { duration: ms, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      animations.push(heal);
      heal.onfinish = () => {
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
  /** Las letras vuelven a su sitio, una tras otra (Crazy Diamond las arregla). */
  mend: (ms: number) => void;
  cancel: () => void;
}

/**
 * Las letras del nombre saltan un poco de su sitio, torcidas, como piezas
 * de vidrio roto, y vuelven con un rebote cuando Crazy Diamond las arregla.
 * Solo `translate` y `rotate` (compositor): se suman al `transform` de la
 * animacion de entrada de las letras sin pisarla.
 */
export function shatterLetters(letters: HTMLElement[]): Shattered {
  const states = letters.map((el) => ({ el, x: rand(-9, 9), y: rand(2, 13), r: rand(-8, 8) }));
  const animations: Animation[] = states.map(({ el, x, y, r }) =>
    el.animate(
      [
        { translate: "0px 0px", rotate: "0deg" },
        { translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`, rotate: `${r.toFixed(1)}deg` },
      ],
      { duration: 150, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.3)", fill: "forwards" },
    ),
  );
  return {
    mend(ms) {
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
