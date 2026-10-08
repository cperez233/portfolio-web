/**
 * Azar sin repeticiones cercanas: de cada lista no vuelve a salir ninguna
 * de las ultimas 3 frases elegidas (si dijo A, B y C, ninguna sale hasta
 * que salga una D). Con listas cortas la ventana se achica para que
 * siempre quede algo para elegir.
 *
 * La memoria va por lista (por su texto, no por la referencia), asi que
 * sirve igual tras cambiar de idioma o volver a montar el chat.
 */

const RECENT = 3;
const memory = new Map<string, string[]>();

function keyOf(list: readonly string[]) {
  return list.join("\u0001");
}

export function pickLine(list: readonly string[]): string {
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  const key = keyOf(list);
  const recent = memory.get(key) ?? [];
  const span = Math.min(RECENT, list.length - 1);
  const blocked = new Set(recent.slice(-span));
  const pool = list.filter((line) => !blocked.has(line));
  const line = pool[Math.floor(Math.random() * pool.length)];
  memory.set(key, [...recent, line].slice(-RECENT));
  return line;
}

/** Lo mismo para cualquier valor (variantes de un poder, etc.). */
export function pickFrom<T extends string>(list: readonly T[]): T {
  return pickLine(list) as T;
}
