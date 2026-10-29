/* editorial-ui · Cristian Pérez · cristianperez.me */

import type { IntroDef } from "./kit";
import { crimson } from "./crimson";
import { dust } from "./dust";
import { gold } from "./gold";
import { finger } from "./finger";
import { echoes } from "./echoes";
import { tbc } from "./tbc";
import { door } from "./door";

export type { IntroDef, IntroKit } from "./kit";
export { nextIntro, type IntroId } from "./bag";
export { finishEntrance } from "./entrance";

/*
  Las entradas del hero que viven en esta carpeta. Crazy Diamond y ZA
  WARUDO (las dos primeras) siguen en portfolio-hero.tsx: comparten mas
  con el efecto del relevo (el vidrio, el tiempo detenido).
*/
export const INTROS = { crimson, dust, gold, finger, echoes, tbc, door } satisfies Record<string, IntroDef>;
