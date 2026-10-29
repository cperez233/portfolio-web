/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  La entrada CSS del hero (lineas, letras que caen, retrato que se pega,
  ドン, copy que sube) como animaciones de verdad, para manejarlas desde
  JS: saltar la entrada la lleva al final.

  Sin el Stand grande (hero-stand, hero-stand-idle: el que rebobina no se
  rebobina) ni los bucles infinitos (ゴゴゴ, la flecha que rebota).
*/
const ENTRANCE = /^hero-(lines-in|tone-in|slam|impact|paste|don|pop|rise)$/;

export function entrance(stage: HTMLElement): CSSAnimation[] {
  return stage
    .getAnimations({ subtree: true })
    .filter((a): a is CSSAnimation => a instanceof CSSAnimation && ENTRANCE.test(a.animationName));
}

/** La lleva al final, quieta y en su sitio (saltar la entrada). */
export function finishEntrance(stage: HTMLElement) {
  for (const a of entrance(stage)) {
    a.playbackRate = 1;
    try {
      a.finish();
    } catch {}
  }
}
