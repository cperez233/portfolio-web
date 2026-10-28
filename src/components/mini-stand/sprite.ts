/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Sprite en pixel art del mini Stand (Paranoid Android en chiquito),
 * dibujado en canvas desde mapas de caracteres. Mira a la derecha; para
 * mirar a la izquierda se espeja.
 *
 * Paleta: . vacio · k tinta · c crema · s sombra crema · g oro ·
 * d oro oscuro · v visor · e ojo · p pupila · w brillo · r enojo ·
 * b sudor y lagrimas · h rosa (corazones y mejillas)
 *
 * El nucleo del pecho es un diamante: Diamond is Unbreakable.
 */

/*
  Los mapas miden 18 columnas, pero el puno derecho toca el borde: rows()
  agrega una columna 19 para cerrarle el contorno de tinta.
*/
export const SPRITE_W = 19;

export const PALETTE: Record<string, string> = {
  k: "#161418",
  c: "#ece6d8",
  s: "#c9bfae",
  g: "#e3b341",
  d: "#a87a1f",
  v: "#2a2530",
  e: "#ece6d8",
  p: "#e3b341",
  w: "#ffffff",
  r: "#e2483b",
  b: "#8fd3f4",
  h: "#e891c4",
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

/**
 * La cara: lo que se ve en el visor. Va aparte del cuerpo para combinar
 * cualquier pose con cualquier gesto (la pose JoJo con risa, el golpe
 * con enojo...).
 */
export type Face =
  | "open"
  | "blink"
  | "happy"
  | "smug"
  | "angry"
  | "sad"
  | "starry"
  | "dizzy"
  | "shock"
  /** Ojos apretados de risa (> <). */
  | "laugh"
  /** Corazones rosas. */
  | "love"
  /** Un ojo abierto y el otro cerrado. */
  | "wink"
  /** Sonrisa con las mejillas rosas. */
  | "blush";

/**
 * El cuerpo: donde van los punos. Las poses JoJo son varias para que no
 * salga siempre la misma (ZA WARUDO elige una cada vez).
 */
export type Body =
  | "idle"
  | "punch"
  /** Pose clasica: el puno izquierdo junto al visor. */
  | "pose"
  /** Los dos punos arriba, a los lados de la cabeza. */
  | "arms"
  /** Apunta con el brazo estirado y el otro puno arriba (la de Jotaro). */
  | "point"
  /** Los dos brazos abiertos, estirados a los lados (WRYYY). */
  | "wide"
  /** Un puno en alto, por encima de la cabeza. */
  | "high"
  /** Golpe hacia quien mira: el puno derecho, enorme, tapa medio pecho. */
  | "jab"
  /** El mismo golpe con el puno izquierdo. */
  | "jabL";

/** Las poses JoJo, para elegir una al azar. */
export const POSES: Body[] = ["pose", "arms", "point", "wide", "high"];

export type Frame =
  | "idle"
  | "blink"
  | "look"
  | "punch"
  | "sleep"
  | "happy"
  | "shock"
  | "pose"
  /** La pose JoJo con la mirada fija: el Stand que se manifiesta en el hero. */
  | "stand"
  | "dizzy"
  | "smug"
  | "angry"
  | "sweat"
  | "starry"
  | "sad"
  | "laugh"
  | "love"
  | "wink"
  | "think"
  | "blush"
  /** Golpes hacia la pantalla, alternados en la rafaga. */
  | "jab"
  | "jabL";

/** Cuerpo y cara de cada cuadro con nombre. */
function partsOf(frame: Frame): { body: Body; face: Face } {
  switch (frame) {
    case "blink":
    case "sleep":
      return { body: "idle", face: "blink" };
    case "punch":
      return { body: "punch", face: "open" };
    case "pose":
      return { body: "pose", face: "happy" };
    case "stand":
      return { body: "pose", face: "open" };
    case "jab":
    case "jabL":
      return { body: frame, face: "angry" };
    case "think":
      return { body: "idle", face: "open" };
    case "sweat":
      return { body: "idle", face: "open" };
    case "idle":
    case "look":
      return { body: "idle", face: "open" };
    default:
      return { body: "idle", face: frame };
  }
}

/*
  Ojos. Abiertos ocupan dos filas del visor y la pupila se corre hacia
  donde mira: look en x (-1, 0, 1) y lookY en y (-1 arriba, 1 abajo).
*/
function eyes(face: Face, look: number, lookY: number) {
  if (face === "blink") {
    return [VISOR, put(VISOR, [5, 6, 7, 10, 11, 12], "e"), VISOR];
  }
  if (face === "happy") {
    return [put(VISOR, [6, 11], "e"), put(VISOR, [5, 7, 10, 12], "e"), VISOR];
  }
  if (face === "smug") {
    // Parpado a media asta: el que sabe algo que tu no.
    return [VISOR, put(VISOR, [5, 6, 7, 10, 11, 12], "e"), put(VISOR, [6, 7, 11, 12], "p")];
  }
  if (face === "angry") {
    // Cejas en V hacia adentro, en rojo.
    return [put(VISOR, [5, 12], "r"), put(VISOR, [6, 7, 10, 11], "r"), VISOR];
  }
  if (face === "sad") {
    return [VISOR, put(VISOR, [6, 7, 10, 11], "e"), put(VISOR, [5, 12], "e")];
  }
  if (face === "starry") {
    return [put(VISOR, [6, 11], "p"), put(put(VISOR, [5, 7, 10, 12], "p"), [6, 11], "w"), put(VISOR, [6, 11], "p")];
  }
  if (face === "dizzy") {
    // Ojos en X: lo lanzaron por la pagina.
    return [put(VISOR, [5, 7, 10, 12], "e"), put(VISOR, [6, 11], "e"), put(VISOR, [5, 7, 10, 12], "e")];
  }
  if (face === "laugh") {
    // > <: se rie tan fuerte que aprieta los ojos.
    return [put(VISOR, [5, 12], "e"), put(VISOR, [6, 7, 10, 11], "e"), put(VISOR, [5, 12], "e")];
  }
  if (face === "love") {
    return [put(VISOR, [5, 7, 10, 12], "h"), put(VISOR, [5, 6, 7, 10, 11, 12], "h"), put(VISOR, [6, 11], "h")];
  }
  if (face === "blush") {
    return [put(VISOR, [6, 11], "e"), put(VISOR, [5, 7, 10, 12], "e"), put(VISOR, [4, 13], "h")];
  }
  if (face === "shock") {
    return [
      put(VISOR, [5, 6, 7, 10, 11, 12], "e"),
      put(put(VISOR, [5, 7, 10, 12], "e"), [6, 11], "k"),
      put(VISOR, [5, 6, 7, 10, 11, 12], "e"),
    ];
  }
  const shift = Math.max(-1, Math.min(1, Math.round(look)));
  const dx = shift > 0 ? 1 : shift < 0 ? -1 : 0;
  const pupil = shift > 0 ? 1 : shift < 0 ? -2 : 0;
  const open = (row: string, withPupil: boolean, only?: "left") => {
    const cols = only ? [6, 7] : [6, 7, 11, 12];
    let next = put(row, cols.map((c) => c + dx), "e");
    if (withPupil) next = put(next, (only ? [7] : [7, 12]).map((c) => c + pupil), "p");
    return next;
  };
  if (face === "wink") {
    // Ojo izquierdo abierto, el derecho una raya.
    return [open(VISOR, false, "left"), put(open(VISOR, true, "left"), [10, 11, 12], "e"), VISOR];
  }
  const y = Math.max(-1, Math.min(1, Math.round(lookY)));
  if (y < 0) return [open(VISOR, true), open(VISOR, false), VISOR];
  if (y > 0) return [VISOR, open(VISOR, false), open(VISOR, true)];
  return [open(VISOR, false), open(VISOR, true), VISOR];
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

// Brazos abiertos: el golpe de BODY_PUNCH a los dos lados.
const BODY_WIDE = [
  "kkkkkkgggcgggkkkkk",
  "kgggggggcwcggggggg",
  "kggkkkgggcgggkkggg",
  "kkk..kdgggggdk.kkk",
  "......kgggggk.....",
  ".......kcccck.....",
];

// Cola de espiritu: los Stands no tienen piernas.
const TAILS = [
  ["........kcck......", ".........kck......", "..........k......."],
  [".......kcck.......", "......kck.........", "......k..........."],
];

const FIST = [".kk.", "kggk", "kggk", ".kk."];
/*
  El puno visto de frente, enorme por la perspectiva: va hacia quien mira.
  Nudillos arriba, el pulgar cruzado abajo.
*/
const BIG_FIST = [
  ".kkkkkkkk.",
  "kwwgwwgwwk",
  "kggdggdggk",
  "kggdggdggk",
  "kddddddggk",
  "kgwwggkdgk",
  ".kkkkkkkk.",
];
const BIG_FIST_L = BIG_FIST.map((row) => [...row].reverse().join(""));

const BODY_START = HEAD.length + 3 + NECK.length;

/** Pinta `block` desde (r, c); los puntos del bloque son transparentes. */
function stamp(map: string[], r: number, c: number, block: string[]) {
  block.forEach((line, i) => {
    const row = map[r + i];
    if (row === undefined) return;
    const chars = row.split("");
    for (let j = 0; j < line.length; j++) if (line[j] !== "." && c + j < chars.length) chars[c + j] = line[j];
    map[r + i] = chars.join("");
  });
}

/** Vacia un rectangulo (donde estaba un puno que se fue a otro sitio). */
function clear(map: string[], r: number, c: number, h: number, w: number) {
  for (let i = r; i < r + h; i++) {
    const chars = map[i].split("");
    for (let j = c; j < c + w; j++) chars[j] = ".";
    map[i] = chars.join("");
  }
}

function shape(map: string[], body: Body) {
  const leftUp = () => {
    clear(map, BODY_START, 0, 4, 4);
    stamp(map, 8, 0, FIST);
  };
  const rightAway = () => clear(map, BODY_START, 14, 4, 4);
  switch (body) {
    case "pose":
      leftUp();
      break;
    case "arms":
      leftUp();
      rightAway();
      stamp(map, 8, 14, FIST);
      break;
    case "point":
      leftUp();
      break;
    case "high":
      rightAway();
      stamp(map, 1, 13, FIST);
      break;
    case "jab":
      rightAway();
      stamp(map, BODY_START - 1, 8, BIG_FIST);
      break;
    case "jabL":
      clear(map, BODY_START, 0, 4, 4);
      stamp(map, BODY_START - 1, 0, BIG_FIST_L);
      break;
  }
}

export interface Look {
  /** Cuerpo distinto al del cuadro (una pose JoJo en particular). */
  body?: Body;
  /** Cara distinta a la del cuadro. */
  face?: Face;
  /** Mirada vertical: -1 arriba, 1 abajo. */
  lookY?: number;
}

function rows(frame: Frame, tail: number, look: number, extra: Look = {}) {
  return mapRows(frame, tail, look, extra).map((row) => row + (row[17] === "." || row[17] === "k" ? "." : "k"));
}

function mapRows(frame: Frame, tail: number, look: number, extra: Look) {
  const parts = partsOf(frame);
  const body = extra.body ?? parts.body;
  const face = extra.face ?? parts.face;
  const lookY = extra.lookY ?? (frame === "think" ? -1 : 0);
  const torso = body === "punch" || body === "point" ? BODY_PUNCH : body === "wide" ? BODY_WIDE : BODY_IDLE;
  const map = [...HEAD, ...eyes(face, frame === "think" ? 1 : look, lookY), ...NECK, ...torso, ...TAILS[tail % 2]];
  if (frame === "sweat") {
    // Gota de sudor al costado de la cabeza.
    map[3] = put(map[3], [15], "b");
    map[4] = put(map[4], [15, 16], "b");
    map[5] = put(map[5], [16], "b");
  }
  if (face === "sad") {
    // Una lagrima bajo el ojo.
    map[11] = put(map[11], [5], "b");
    map[12] = put(map[12], [5], "b");
  }
  shape(map, body);
  return map;
}

export const SPRITE_H = rows("idle", 0, 0).length;

/**
 * El mapa de caracteres de un cuadro, ya cerrado a 19 columnas. Lo usa el
 * Stand gigante del hero (hero-stand.tsx), que lo dibuja en SVG.
 */
export function standMap(frame: Frame, tail = 0, look = 0, extra?: Look): string[] {
  return rows(frame, tail, look, extra);
}

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
  /** Aplastado (positivo, al aterrizar) o estirado (negativo, al volar), desde la base. */
  squash?: number;
  /** Pose o cara distintas a las del cuadro, y la mirada vertical. */
  extra?: Look;
}

export function drawStand(ctx: CanvasRenderingContext2D, options: DrawOptions) {
  const { x, y, scale, face, frame, tail, look = 0, tilt = 0, spin = 0, squash = 0, extra } = options;
  const map = rows(frame, tail, look, extra);
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
  if (squash) ctx.scale(1 + squash * 0.6, 1 - squash);
  ctx.scale(face, 1);
  ctx.translate(-w / 2, -h);
  /*
    Contorno extra de tinta: medio pixel del sprite alrededor de la
    silueta. Con uno entero (mas el de tinta del mapa) quedaba muy grueso;
    sin nada, muy fino.
  */
  const rim = Math.max(1, Math.round(scale / 2));
  ctx.fillStyle = PALETTE.k;
  for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
      if (map[r][c] !== ".") ctx.fillRect(c * scale - rim, r * scale - rim, scale + rim * 2, scale + rim * 2);
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
