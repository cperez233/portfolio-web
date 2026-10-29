/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  La entrada CSS del hero (lineas, letras que caen, retrato que se pega,
  ドン, copy que sube) como animaciones de verdad, para manejarlas desde
  JS: Bites the Dust la rebobina y la repite, To Be Continued la repite
  como el episodio siguiente, y saltar la entrada la lleva al final.

  Sin el Stand grande (hero-stand, hero-stand-idle: el que rebobina no se
  rebobina) ni los bucles infinitos (ゴゴゴ, la flecha que rebota).
*/
const ENTRANCE = /^hero-(lines-in|tone-in|slam|impact|paste|don|pop|rise)$/;

export function entrance(stage: HTMLElement): CSSAnimation[] {
  return stage
    .getAnimations({ subtree: true })
    .filter((a): a is CSSAnimation => a instanceof CSSAnimation && ENTRANCE.test(a.animationName));
}

/** Donde termina la ultima pieza, en ms del reloj de cada animacion. */
function endOf(list: CSSAnimation[]) {
  return Math.max(0, ...list.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0)));
}

/** Rebobina la entrada a `rate` veces la velocidad; devuelve cuanto tarda, en ms. */
export function rewindEntrance(stage: HTMLElement, rate: number) {
  const list = entrance(stage);
  for (const a of list) {
    a.playbackRate = -rate;
    a.play();
  }
  return endOf(list) / rate;
}

/** La repite desde el primer cuadro; devuelve cuanto dura, en ms. */
export function replayEntrance(stage: HTMLElement, rate = 1) {
  const list = entrance(stage);
  for (const a of list) {
    a.playbackRate = rate;
    a.currentTime = 0;
    a.play();
  }
  return endOf(list) / rate;
}

/** Pausa la entrada donde va (sin perder donde estaba). */
export function holdEntrance(stage: HTMLElement) {
  for (const a of entrance(stage)) a.pause();
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
