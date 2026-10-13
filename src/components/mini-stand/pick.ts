/**
 * Azar sin repeticiones, como un mazo: cada lista se baraja entera y se
 * reparte carta por carta; no vuelve a salir ninguna frase hasta que
 * salieron todas, y solo entonces se baraja otra vez. Al rebarajar, la
 * primera nunca es la ultima que salio, asi que tampoco hay repeticion
 * en la costura.
 *
 * El mazo se recuerda en sessionStorage: recargar la pagina o cambiar de
 * idioma no reinicia el orden, y quien vuelve a preguntar no recibe lo
 * mismo que acaba de leer. Sin storage (modo privado) sigue funcionando
 * en memoria.
 *
 * La memoria va por lista (por su texto, no por la referencia), asi que
 * sirve igual tras volver a montar el chat.
 */

interface Deck {
  /** Frases que aun no salieron en esta vuelta. */
  left: string[];
  /** La ultima que salio (para no abrir el siguiente mazo con ella). */
  last: string;
}

const STORAGE_KEY = "jojo-stand-decks";
const decks = new Map<string, Deck>();
let loaded = false;

function hash(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

function keyOf(list: readonly string[]) {
  return `${list.length}:${hash(list.join("\u0001"))}`;
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, Deck>;
    for (const [key, deck] of Object.entries(raw)) {
      if (Array.isArray(deck?.left) && typeof deck.last === "string") decks.set(key, deck);
    }
  } catch {}
}

function save() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(decks)));
  } catch {}
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickLine(list: readonly string[]): string {
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  load();
  const key = keyOf(list);
  const deck = decks.get(key) ?? { left: [], last: "" };
  // Solo cuentan las frases que siguen en la lista (el filtro de celular
  // cambia la lista, y con ella su mazo).
  let left = deck.left.filter((line) => list.includes(line));
  if (!left.length) {
    left = shuffle(list as string[]);
    if (left[left.length - 1] === deck.last) {
      // Se reparte desde el final: que la ultima no sea la que acaba de salir.
      const swap = Math.floor(Math.random() * (left.length - 1));
      [left[left.length - 1], left[swap]] = [left[swap], left[left.length - 1]];
    }
  }
  const line = left[left.length - 1];
  decks.set(key, { left: left.slice(0, -1), last: line });
  save();
  return line;
}

/** Lo mismo para cualquier valor (variantes de un poder, etc.). */
export function pickFrom<T extends string>(list: readonly T[]): T {
  return pickLine(list) as T;
}
