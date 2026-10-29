/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  Que entrada toca. Una por visita, al azar, sin repetir ninguna hasta que
  salieron todas: una bolsa en localStorage con las que faltan. Cuando se
  vacia se llena otra vez con todas, y la primera de la bolsa nueva nunca
  es la ultima que salio (no hay repeticion en la costura).

  La entrada solo se saca de la bolsa cuando de verdad se ve (commit): si
  el hero hidrato tarde o la pagina se abrio ya bajada, sigue ahi para la
  proxima.

  `?intro=crimson` (o cualquier id) fuerza una, para verlas o probarlas.
*/
export const INTRO_IDS = ["diamond", "world", "crimson", "dust", "gold", "finger", "echoes", "tbc", "door"] as const;
export type IntroId = (typeof INTRO_IDS)[number];

const BAG_KEY = "jojo-intro-bag";
/** La ultima que salio. La misma clave que usaba la alternancia de antes. */
const LAST_KEY = "jojo-intro";

const isIntro = (value: unknown): value is IntroId => INTRO_IDS.includes(value as IntroId);

export function nextIntro(): { id: IntroId; commit: () => void } {
  try {
    const forced = new URLSearchParams(window.location.search).get("intro");
    if (isIntro(forced)) return { id: forced, commit: () => {} };

    const last = window.localStorage.getItem(LAST_KEY);
    let bag: IntroId[] = [];
    try {
      const raw: unknown = JSON.parse(window.localStorage.getItem(BAG_KEY) ?? "[]");
      if (Array.isArray(raw)) bag = [...new Set(raw.filter(isIntro))];
    } catch {}
    if (!bag.length) bag = [...INTRO_IDS];
    // En la costura entre dos bolsas, nunca la misma dos veces seguidas.
    const options = bag.length > 1 ? bag.filter((other) => other !== last) : bag;
    const id = options[Math.floor(Math.random() * options.length)];
    return {
      id,
      commit() {
        try {
          const left = bag.filter((other) => other !== id);
          window.localStorage.setItem(BAG_KEY, JSON.stringify(left));
          window.localStorage.setItem(LAST_KEY, id);
        } catch {}
      },
    };
  } catch {
    return { id: INTRO_IDS[Math.floor(Math.random() * INTRO_IDS.length)], commit: () => {} };
  }
}
