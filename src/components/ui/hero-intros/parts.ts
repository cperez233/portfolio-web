/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  Las piezas del hero que las entradas mueven, ademas de las letras del
  nombre: el retrato (solo la foto: el Stand va aparte), cada cosa del
  copy por separado (el h1, la descripcion, cada placa, cada boton, cada
  enlace) y el menu flotante.

  Se mueven con translate / rotate / scale, que no pisan el transform de
  la entrada CSS (hero-rise, hero-paste): asi una entrada puede rebobinar
  o repetir la animacion CSS mientras las piezas vuelan. El menu es la
  excepcion: su envoltorio fijo ya usa translate para centrarse, asi que
  a el se le anima el transform.
*/

export interface Piece {
  el: HTMLElement;
  /** El menu va con transform (ver arriba). */
  nav: boolean;
}

function visible(el: Element) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/** El copy del hero, pieza por pieza. */
export function copyPieces(stage: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const rise of stage.querySelectorAll<HTMLElement>(".hero-rise")) {
    const items = [...rise.querySelectorAll<HTMLElement>("span.rounded-full, a.rounded-full, li")];
    out.push(...(items.length ? items : [rise]));
  }
  return out.filter(visible);
}

/** El retrato (la foto pegada, sin el Stand). */
export function portraitPiece(stage: HTMLElement) {
  return stage.querySelector<HTMLElement>(".hero-paste");
}

/** El envoltorio fijo del menu flotante. */
export function navPiece() {
  const nav = document.querySelector<HTMLElement>("nav[aria-label]");
  const wrap = nav?.parentElement;
  return wrap && getComputedStyle(wrap).position === "fixed" && visible(wrap) ? wrap : null;
}

/** Todo lo que se puede mover: copy, retrato y menu (sin las letras). */
export function pieces(stage: HTMLElement): Piece[] {
  const list: Piece[] = copyPieces(stage).map((el) => ({ el, nav: false }));
  const photo = portraitPiece(stage);
  if (photo) list.push({ el: photo, nav: false });
  const nav = navPiece();
  if (nav) list.push({ el: nav, nav: true });
  return list;
}

export interface Pose {
  x?: number;
  y?: number;
  r?: number;
  s?: number | [number, number];
  opacity?: number;
  offset?: number;
  easing?: string;
}

/** Un cuadro clave para una pieza, en las propiedades que le tocan. */
export function poseFrame(piece: Piece | HTMLElement, pose: Pose): Keyframe {
  const nav = "nav" in piece ? piece.nav : false;
  const { x = 0, y = 0, r = 0, s = 1, opacity, offset, easing } = pose;
  const [sx, sy] = Array.isArray(s) ? s : [s, s];
  const frame: Keyframe = nav
    ? { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${sx}, ${sy})` }
    : { translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`, rotate: `${r.toFixed(1)}deg`, scale: `${sx} ${sy}` };
  if (opacity !== undefined) frame.opacity = opacity;
  if (offset !== undefined) frame.offset = offset;
  if (easing) frame.easing = easing;
  return frame;
}

/** Anima una pieza entre poses. */
export function movePiece(piece: Piece | HTMLElement, poses: Pose[], options: KeyframeAnimationOptions) {
  const el = "el" in piece ? piece.el : piece;
  return el.animate(
    poses.map((pose) => poseFrame(piece, pose)),
    options,
  );
}

/** El centro de un elemento en la ventana. */
export function center(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
}
