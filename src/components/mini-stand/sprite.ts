/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Sprite en pixel art del mini Stand (Paranoid Android en chiquito),
 * dibujado en canvas desde mapas de caracteres. Mira a la derecha; para
 * mirar a la izquierda se espeja.
 *
 * Paleta: . vacio · k tinta · c crema · s sombra crema · g oro ·
 * d oro oscuro · v visor · e ojo · p pupila · w brillo
 *
 * El nucleo del pecho es un diamante: Diamond is Unbreakable.
 */

export const SPRITE_W = 18;

const PALETTE: Record<string, string> = {
  k: "#161418",
  c: "#ece6d8",
  s: "#c9bfae",
  g: "#e3b341",
  d: "#a87a1f",
  v: "#2a2530",
  e: "#ece6d8",
  p: "#e3b341",
  w: "#ffffff",
};

const VISOR = "..kcvvvvvvvvvvvck.";

function put(row: string, cols: number[], ch: string) {
  const chars = row.split("");
  for (const col of cols) chars[col] = ch;
  return chars.join("");
}

const HEAD = [
  "........kk........",
  ".......kggk.......",
  "........kk........",
  "........kk........",
  "....kkkkkkkkkk....",
  "...kwcccccccccck..",
  "..kcgggggggggggck.",
  "..kcvvvvvvvvvvvck.",
];

export type Frame = "idle" | "blink" | "look" | "punch" | "sleep" | "happy" | "shock" | "pose" | "dizzy";

function eyes(frame: Frame, look: number) {
  const L = [6, 7];
  const R = [11, 12];
  if (frame === "blink" || frame === "sleep") {
    return [VISOR, put(VISOR, [5, 6, 7, 10, 11, 12], "e"), VISOR];
  }
  if (frame === "happy") {
    return [put(VISOR, [6, 11], "e"), put(VISOR, [5, 7, 10, 12], "e"), VISOR];
  }
  if (frame === "dizzy") {
    // Ojos en X: lo lanzaron por la pagina.
    return [put(VISOR, [5, 7, 10, 12], "e"), put(VISOR, [6, 11], "e"), put(VISOR, [5, 7, 10, 12], "e")];
  }
  if (frame === "shock") {
    return [
      put(VISOR, [5, 6, 7, 10, 11, 12], "e"),
      put(put(VISOR, [5, 7, 10, 12], "e"), [6, 11], "k"),
      put(VISOR, [5, 6, 7, 10, 11, 12], "e"),
    ];
  }
  // Abiertos: la pupila se corre hacia donde mira (-1, 0, 1).
  const shift = Math.max(-1, Math.min(1, look));
  const top = put(VISOR, [...L, ...R].map((c) => c + (shift > 0 ? 1 : shift < 0 ? -1 : 0)), "e");
  const mid = put(
    put(VISOR, [...L, ...R].map((c) => c + (shift > 0 ? 1 : shift < 0 ? -1 : 0)), "e"),
    [L[1], R[1]].map((c) => c + (shift > 0 ? 1 : shift < 0 ? -2 : 0)),
    "p",
  );
  return [top, mid, VISOR];
}

const NECK = ["...kscccccccccsk..", "....kkkkkkkkkkk..."];

// Torso con el diamante y los dos punos flotando a los lados.
const BODY_IDLE = [
  ".kk..kgggcgggk..kk",
  "kggk.kggcwcggk.kgg",
  "kggk.kgggcgggk.kgg",
  ".kk..kdgggggdk..kk",
  "......kgggggk.....",
  ".......kcccck.....",
];
// Golpe: el puno derecho sale disparado.
const BODY_PUNCH = [
  ".kk..kgggcgggkkkkk",
  "kggk.kggcwcggggggg",
  "kggk.kgggcgggkkggg",
  ".kk..kdgggggdk.kkk",
  "......kgggggk.....",
  ".......kcccck.....",
];

// Cola de espiritu: los Stands no tienen piernas.
const TAILS = [
  ["........kcck......", ".........kck......", "..........k......."],
  [".......kcck.......", "......kck.........", "......k..........."],
];

function rows(frame: Frame, tail: number, look: number) {
  const body = frame === "punch" ? BODY_PUNCH : BODY_IDLE;
  const map = [...HEAD, ...eyes(frame === "pose" ? "happy" : frame, look), ...NECK, ...body, ...TAILS[tail % 2]];
  if (frame !== "pose") return map;
  /*
    Pose JoJo: el puno izquierdo sube junto al visor (filas 8-11) y el
    hueco que deja en el torso se vacia.
  */
  const fist = [".kk.", "kggk", "kggk", ".kk."];
  const bodyStart = HEAD.length + 3 + NECK.length;
  return map.map((row, r) => {
    if (r >= bodyStart && r < bodyStart + 4) return "...." + row.slice(4);
    const i = r - 8;
    if (i >= 0 && i < 4) return fist[i] + row.slice(4);
    return row;
  });
}

export const SPRITE_H = rows("idle", 0, 0).length;

export interface DrawOptions {
  /** Punta de la cola, en px del contexto. */
  x: number;
  y: number;
  scale: number;
  face: 1 | -1;
  frame: Frame;
  tail: number;
  /** Hacia donde mira la pupila: -1 atras, 0 frente, 1 adelante. */
  look?: number;
  tilt?: number;
  /** Giro completo alrededor del centro del cuerpo (piruetas). */
  spin?: number;
  /** Contorno de pegatina alrededor de la silueta (null: sin contorno). */
  rim?: string | null;
}

export function drawStand(ctx: CanvasRenderingContext2D, options: DrawOptions) {
  const { x, y, scale, face, frame, tail, look = 0, tilt = 0, spin = 0, rim = null } = options;
  const map = rows(frame, tail, look);
  const w = SPRITE_W * scale;
  const h = map.length * scale;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(tilt);
  if (spin) {
    ctx.translate(0, -h / 2);
    ctx.rotate(spin);
    ctx.translate(0, h / 2);
  }
  ctx.scale(face, 1);
  ctx.translate(-w / 2, -h);
  if (rim) {
    ctx.fillStyle = rim;
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === ".") continue;
        ctx.fillRect((c - 1) * scale, (r - 1) * scale, scale * 3, scale * 3);
      }
    }
  }
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      const color = PALETTE[map[r][c]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }
  }
  ctx.restore();
}
