/* editorial-ui · Cristian Pérez · cristianperez.me */

import { PALETTE, standMap } from "@/components/mini-stand/sprite";
import { cn } from "@/lib/utils";

/*
  El Stand gigante del hero: el mismo Paranoid Android del mini Stand, en
  la pose JoJo y con su misma paleta, pero a tamano de viñeta. Es el
  mismo personaje a proposito: se manifiesta grande detras del retrato y
  se condensa en el chico que acompana la pagina.

  Se dibuja en SVG y no en canvas para que salga en el HTML del servidor:
  no hay hueco ni salto mientras hidrata. Los trazados se calculan una vez
  al cargar el modulo (el mapa es fijo), un <path> por color, y el SVG no
  anima nada por dentro: lo que se mueve es su envoltorio.
*/
/*
  La pose JoJo con la mirada fija hacia delante (cuadro "stand" del
  sprite): la pose trae los ojos felices (^ ^), y un Stand que se
  manifiesta mira, no sonrie. Es el mismo cuadro con el que el mini Stand
  recibe el relevo, asi que el cambio es pixel por pixel. Espejado en CSS,
  mira hacia el retrato.
*/
const MAP = standMap("stand", 0, 1);
const COLS = MAP[0].length;
const ROWS = MAP.length;

function cells(test: (ch: string) => boolean, grow = 0) {
  let d = "";
  const size = 1 + grow * 2;
  MAP.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (test(row[c])) d += `M${c - grow} ${r - grow}h${size}v${size}h-${size}z`;
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
const RIM = cells((ch) => ch !== ".");
const LAYERS = Object.entries(PALETTE)
  .map(([ch, color]) => ({ ch, color, d: cells((cell) => cell === ch) }))
  .filter((layer) => layer.d);

export function HeroStand({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`-0.5 -0.5 ${COLS + 1} ${ROWS + 1}`}
      shapeRendering="crispEdges"
      className={cn("block h-full w-auto", className)}
      style={{ aspectRatio: `${COLS + 1} / ${ROWS + 1}` }}
    >
      <path
        d={RIM}
        className="hero-stand-rim"
        fill={PALETTE.k}
        stroke={PALETTE.k}
        strokeWidth={0.6}
        strokeLinejoin="miter"
      />
      {LAYERS.map((layer) => (
        <path key={layer.ch} d={layer.d} fill={layer.color} />
      ))}
    </svg>
  );
}
