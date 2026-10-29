/* editorial-ui · Cristian Pérez · cristianperez.me */

import { rand } from "@/components/mini-stand/power-kit";

/*
  Las ramas, hojas y flores de Gold Experience (gold.ts), pintadas en SVG
  sin contorno de tinta: volumen con luz y sombra, como ilustracion y no
  como pegatina. Van en tres planos, para que haya profundidad:

  - back: detras del nombre, mas oscuro y desenfocado (lo lejano).
  - mid: delante del nombre y detras del retrato y del Stand; las ramas
    proyectan sombra sobre las letras.
  - front: unas pocas hojas grandes, muy desenfocadas, en los bordes de la
    pantalla (lo que esta pegado a la camara).

  Cada rama es una curva que crece con stroke-dashoffset: un trazo fino
  de punta a punta y otro grueso solo en la base, asi se afina hacia la
  punta. Encima, un filo de luz; debajo, su sombra corrida.
*/

export interface Limb {
  d: string;
  width: number;
  delay: number;
  /** Puntos de la curva: inicio, control y punta. */
  p: [number, number, number, number, number, number];
  depth: number;
}

/** Ramas que salen de (x, y) hacia `angle`, y se abren en otras mas finas. */
export function grow(out: Limb[], x: number, y: number, angle: number, len: number, width: number, delay: number, depth: number, maxDepth = 2) {
  const bend = rand(-0.5, 0.5);
  const x1 = x + Math.cos(angle) * len;
  const y1 = y + Math.sin(angle) * len;
  const cx = (x + x1) / 2 + Math.cos(angle + Math.PI / 2) * len * bend * 0.45;
  const cy = (y + y1) / 2 + Math.sin(angle + Math.PI / 2) * len * bend * 0.45;
  const ms = 200 + len * 0.6;
  out.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`, width, delay, p: [x, y, cx, cy, x1, y1], depth });
  if (depth >= maxDepth) return;
  const [mx, my] = along({ p: [x, y, cx, cy, x1, y1] } as Limb, 0.55);
  const side = Math.random() < 0.5 ? -1 : 1;
  grow(out, mx, my, angle + side * rand(0.5, 0.85), len * rand(0.45, 0.6), width * 0.5, delay + ms * 0.55, depth + 1, maxDepth);
  grow(out, x1, y1, angle - rand(0.3, 0.6), len * rand(0.55, 0.72), width * 0.6, delay + ms, depth + 1, maxDepth);
  grow(out, x1, y1, angle + rand(0.3, 0.6), len * rand(0.5, 0.68), width * 0.58, delay + ms + 40, depth + 1, maxDepth);
}

/** Un punto de la rama (t de 0 a 1) y su direccion ahi. */
export function along(limb: Limb, t: number): [number, number, number] {
  const [x0, y0, cx, cy, x1, y1] = limb.p;
  const u = 1 - t;
  const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
  const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
  const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx);
  const dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
  return [x, y, Math.atan2(dy, dx)];
}

const NS = "http://www.w3.org/2000/svg";

export function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Los degradados que usan hojas, flores y ramas de un plano. */
export function defs(svg: SVGSVGElement, id: string, tone: "back" | "mid" | "front") {
  const leaf = tone === "back" ? ["#1f3a24", "#2f5532"] : ["#3f7a34", "#8fcc63"];
  const petal = tone === "back" ? ["#6b4a5e", "#8e6a7f"] : ["#f7d6e8", "#e891c4"];
  svg.insertAdjacentHTML(
    "afterbegin",
    `<defs>` +
      `<linearGradient id="${id}-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${leaf[1]}"/><stop offset="1" stop-color="${leaf[0]}"/></linearGradient>` +
      `<radialGradient id="${id}-petal" cx="0.5" cy="0.15" r="0.95"><stop offset="0" stop-color="${petal[0]}"/><stop offset="1" stop-color="${petal[1]}"/></radialGradient>` +
      `<radialGradient id="${id}-heart" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#d99a2b"/></radialGradient>` +
      `</defs>`,
  );
}

/** Colores de la corteza por plano: sombra, cuerpo y filo de luz. */
const BARK = {
  back: ["rgba(10, 8, 6, 0.25)", "#3b2a1c", "#54402c"],
  mid: ["rgba(8, 6, 4, 0.42)", "#6e4526", "#b9864f"],
  front: ["rgba(0, 0, 0, 0)", "#5a3a20", "#8a6038"],
} as const;

/**
 * Pinta una rama y devuelve sus trazos con la fraccion que cubre cada uno
 * (para animar el crecimiento: dasharray `f 2`, dashoffset de 1 a 0).
 */
export function branch(group: SVGGElement, limb: Limb, tone: "back" | "mid" | "front") {
  const [shadow, body, light] = BARK[tone];
  const w = limb.width;
  const strokes: { el: SVGPathElement; f: number }[] = [];
  const add = (stroke: string, width: number, f: number, dx = 0, dy = 0) => {
    const el = svgEl("path", { d: limb.d, pathLength: 1, fill: "none", stroke, "stroke-width": width.toFixed(1), "stroke-linecap": "round" });
    if (dx || dy) el.setAttribute("transform", `translate(${dx} ${dy})`);
    el.style.strokeDasharray = `${f} 2`;
    el.style.strokeDashoffset = "1";
    group.appendChild(el);
    strokes.push({ el, f });
  };
  // La sombra sobre lo de abajo (solo la parte gruesa), el cuerpo afinandose y la luz.
  if (tone === "mid") add(shadow, w * 1.1, 0.7, w * 0.25 + 2, w * 0.4 + 3);
  add(body, Math.max(1.6, w * 0.42), 1);
  add(body, w * 0.75, 0.62);
  add(body, w, 0.3);
  if (w > 3) add(light, Math.max(1, w * 0.18), 0.8, -w * 0.16, -w * 0.2);
  return strokes;
}

/** Una hoja con la base en (0, 0), apuntando a +x: degradado, media sombra y nervio. */
export function leaf(id: string, len: number, tone: "back" | "mid" | "front") {
  const w = len * rand(0.28, 0.36);
  const g = svgEl("g", { class: "ge-leaf" });
  g.appendChild(svgEl("path", { d: `M0 0 C${len * 0.28} ${-w} ${len * 0.72} ${-w} ${len} 0 C${len * 0.72} ${w} ${len * 0.28} ${w} 0 0Z`, fill: `url(#${id}-leaf)` }));
  // La mitad de abajo, un tono mas oscura: la hoja tiene volumen.
  g.appendChild(svgEl("path", { d: `M0 0 Q${len * 0.5} ${w * 0.08} ${len} 0 C${len * 0.72} ${w} ${len * 0.28} ${w} 0 0Z`, fill: "rgba(12, 30, 10, 0.32)" }));
  if (tone !== "back") g.appendChild(svgEl("path", { d: `M${len * 0.06} 0 Q${len * 0.5} ${-w * 0.12} ${len * 0.94} 0`, fill: "none", stroke: "rgba(230, 248, 200, 0.55)", "stroke-width": Math.max(0.8, len * 0.035).toFixed(1), "stroke-linecap": "round" }));
  return g;
}

/** Una flor de cinco petalos, centrada en (0, 0), con su corazon dorado. */
export function flower(id: string, r: number) {
  const g = svgEl("g", { class: "ge-flower" });
  for (let i = 0; i < 5; i++) {
    g.appendChild(
      svgEl("ellipse", {
        cx: 0,
        cy: (-r * 0.52).toFixed(1),
        rx: (r * 0.36).toFixed(1),
        ry: (r * 0.56).toFixed(1),
        fill: `url(#${id}-petal)`,
        transform: `rotate(${i * 72})`,
      }),
    );
  }
  g.appendChild(svgEl("circle", { r: (r * 0.24).toFixed(1), fill: `url(#${id}-heart)` }));
  return g;
}
