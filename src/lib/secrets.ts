/**
 * Secretos de la pagina. No se explican en ningun lado: solo se cuentan
 * (Secretos 3/10 en el pie) y se avisa al encontrar uno. Asi la gente
 * sabe que existen sin que un personaje se los recite.
 *
 * Se guardan en localStorage: es un detalle de cada visitante, y si el
 * navegador no deja guardar, simplemente no se recuerdan.
 */

export const SECRET_IDS = [
  "timestop",
  "ora",
  "muda",
  "tbc",
  "barrage",
  "arrow",
  "janken",
  "sleep",
  "night",
  "console",
  "kingcrimson",
] as const;

export type SecretId = (typeof SECRET_IDS)[number];

export const SECRETS_KEY = "jojo-secrets";

export interface SecretDetail {
  id: SecretId;
  found: SecretId[];
}

export function readSecrets(): SecretId[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SECRETS_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((id): id is SecretId => SECRET_IDS.includes(id)) : [];
  } catch {
    return [];
  }
}

/** Marca un secreto. Solo avisa (evento jojo:secret) la primera vez. */
export function unlockSecret(id: SecretId) {
  if (typeof window === "undefined") return;
  const found = readSecrets();
  if (found.includes(id)) return;
  found.push(id);
  try {
    localStorage.setItem(SECRETS_KEY, JSON.stringify(found));
  } catch {}
  window.dispatchEvent(new CustomEvent<SecretDetail>("jojo:secret", { detail: { id, found } }));
}
