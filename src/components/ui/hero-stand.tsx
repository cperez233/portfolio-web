/* editorial-ui · Cristian Pérez · cristianperez.me */

import { PALETTE, standMap, type Frame, type Look } from "@/components/mini-stand/sprite";
import { cn } from "@/lib/utils";

/*
  El Stand gigante del hero: el mismo Paranoid Android del mini Stand, con
  su misma paleta, pero a tamano de viñeta. Es el mismo personaje a
  proposito: se manifiesta grande junto al retrato y se condensa en el
  chico que acompana la pagina.

  Se dibuja en SVG y no en canvas para que salga en el HTML del servidor:
  no hay hueco ni salto mientras hidrata. El servidor solo manda el cuadro
  de entrada (la pose JoJo con la mirada fija, el mismo con el que el mini
  Stand recibe el relevo, asi que el cambio es pixel por pixel). Los demas
  (los golpes de la rafaga, las poses de ZA WARUDO, la risa) los arma
  showHeroFrame en el navegador la primera vez que se piden: cada uno es un
  <g> mas dentro del mismo SVG y solo se ve uno a la vez.

  Cada fila de celdas del mismo color va en un solo rectangulo (M x y h n
  v1 h-n z): un trazado por color y por cuadro, sin una caja por pixel.
*/
const BASE = standMap("stand", 0, 1);
const COLS = BASE[0].length;
const ROWS = BASE.length;

function runs(map: string[], test: (ch: string) => boolean) {
  let d = "";
  map.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      if (!test(row[c])) {
        c++;
        continue;
      }
      let end = c;
      while (end < row.length && test(row[end])) end++;
      d += `M${c} ${r}h${end - c}v1h-${end - c}z`;
      c = end;
    }
  });
  return d;
}

/*
  Contorno de tinta: el borde extra que dibuja drawStand alrededor de la
  silueta. Es un trazo y no celdas ensanchadas para poder animar su grosor:
  grande se ve fino, y al hacerse chico crece hasta los px de contorno del
  mini Stand (portfolio-hero.tsx), que si no el chico apareceria mas
  oscuro de borde que el grande (.hero-stand-rim).
*/
function layers(map: string[]) {
  const rim = runs(map, (ch) => ch !== ".");
  const colors = Object.entries(PALETTE)
    .map(([ch, color]) => ({ ch, color, d: runs(map, (cell) => cell === ch) }))
    .filter((layer) => layer.d);
  return { rim, colors };
}

const RIM_PROPS = { fill: PALETTE.k, stroke: PALETTE.k, strokeWidth: 0.6, strokeLinejoin: "miter" } as const;
const BASE_LAYERS = layers(BASE);

/** El nombre de un cuadro con su pose y su cara: "stand", "jab|angry", "stand|wide|laugh"... */
export function frameKey(frame: Frame, extra?: Look) {
  return [frame, extra?.body, extra?.face].filter(Boolean).join("|");
}

/**
 * Muestra un cuadro del Stand gigante (y lo arma si es la primera vez).
 * Solo cambia que <g> se ve: nada se mueve ni se repinta fuera del SVG.
 */
export function showHeroFrame(svg: SVGSVGElement, frame: Frame, extra?: Look) {
  const key = frameKey(frame, extra);
  let group = svg.querySelector<SVGGElement>(`g[data-f="${key}"]`);
  if (!group) {
    const { rim, colors } = layers(standMap(frame, 0, 1, extra));
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.dataset.f = key;
    group.innerHTML =
      `<path d="${rim}" class="hero-stand-rim" fill="${RIM_PROPS.fill}" stroke="${RIM_PROPS.stroke}" stroke-width="${RIM_PROPS.strokeWidth}" stroke-linejoin="miter"/>` +
      colors.map(({ d, color }) => `<path d="${d}" fill="${color}"/>`).join("");
    svg.appendChild(group);
  }
  for (const g of svg.querySelectorAll<SVGGElement>("g[data-f]")) g.style.display = g === group ? "" : "none";
  return key;
}

export function HeroStand({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`-0.5 -0.5 ${COLS + 1} ${ROWS + 1}`}
      shapeRendering="crispEdges"
      className={cn("block h-full w-auto", className)}
      style={{ aspectRatio: `${COLS + 1} / ${ROWS + 1}` }}
    >
      <g data-f="stand">
        <path d={BASE_LAYERS.rim} className="hero-stand-rim" {...RIM_PROPS} />
        {BASE_LAYERS.colors.map((layer) => (
          <path key={layer.ch} d={layer.d} fill={layer.color} />
        ))}
      </g>
    </svg>
  );
}

/*
  El puno de la rafaga de Crazy Diamond visto de frente, en pixel art como
  el Stand: los cuatro nudillos hacia quien mira, los dedos doblados y el
  pulgar cruzado abajo. Va como
  cadena SVG porque lo crea el JS de la entrada, no React.
*/
const FRONT_FIST = [
  "..kkkkkkkkkkkk..",
  ".kwwgwwgwwgwwgk.",
  "kwggggggggggggdk",
  "kggdgggdgggdggdk",
  "kggdgggdgggdggdk",
  "kggdgggdgggdggdk",
  "kdddddddddddggdk",
  "kggggggggggkdgdk",
  "kgwwwggggggkddk.",
  "kdgggggggggdkk..",
  ".kddddddddddk...",
  "..kkkkkkkkkk....",
];

export const FRONT_FIST_SVG = (() => {
  const w = FRONT_FIST[0].length;
  const h = FRONT_FIST.length;
  const { rim, colors } = layers(FRONT_FIST);
  return (
    `<svg viewBox="-0.5 -0.5 ${w + 1} ${h + 1}" shape-rendering="crispEdges" aria-hidden="true">` +
    `<path d="${rim}" fill="${PALETTE.k}" stroke="${PALETTE.k}" stroke-width="0.5"/>` +
    colors.map(({ d, color }) => `<path d="${d}" fill="${color}"/>`).join("") +
    `</svg>`
  );
})();
