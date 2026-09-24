import type { Language } from "@/data/content";

/**
 * Idiomas por URL y deteccion del idioma de entrada. Modulo SIN
 * "use client": lo usan tanto `proxy.ts` (servidor) como el store de
 * idioma y el toggle (cliente).
 *
 * Quien entra en "/" sin haber elegido idioma y pide espanol (por
 * Accept-Language o por venir de un pais hispanohablante) va a "/es".
 * La eleccion manual del toggle (cookie `portafolio-language`) manda
 * sobre la deteccion. "/es" nunca se redirige: es la URL que indexa
 * Google para la version en espanol.
 */

/** URL de cada version. Sin barra final en /es: asi la sirve Next. */
export const LANGUAGE_PATHS: Record<Language, string> = {
  en: "/",
  es: "/es",
};

/** Preferencia manual del toggle. */
export const LANGUAGE_COOKIE = "portafolio-language";

/** Paises hispanohablantes (ISO 3166-1 alfa-2, como x-vercel-ip-country). */
const SPANISH_SPEAKING_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ", "GT",
  "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export function isLanguage(value: unknown): value is Language {
  return value === "es" || value === "en";
}

/**
 * Etiqueta de mayor preferencia de una cabecera Accept-Language:
 * "en-US,es;q=0.9" -> "en-us". Con pesos iguales gana la primera, que es
 * el orden en que el usuario las configuro.
 */
export function preferredLanguageTag(acceptLanguage: string | null): string | null {
  if (!acceptLanguage) return null;

  let best: { tag: string; q: number } | null = null;
  for (const part of acceptLanguage.split(",")) {
    const [rawTag, ...params] = part.trim().split(";");
    const tag = rawTag.trim().toLowerCase();
    if (!tag || tag === "*") continue;

    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
    if (!Number.isFinite(q) || q <= 0) continue;

    if (!best || q > best.q) best = { tag, q };
  }
  return best?.tag ?? null;
}

/**
 * Espanol si el navegador lo pide como primera opcion o si la visita
 * llega desde un pais hispanohablante; ingles en cualquier otro caso.
 */
export function detectLanguage({
  acceptLanguage,
  country,
}: {
  acceptLanguage: string | null;
  country: string | null;
}): Language {
  if (preferredLanguageTag(acceptLanguage)?.startsWith("es")) return "es";
  if (country && SPANISH_SPEAKING_COUNTRIES.has(country.trim().toUpperCase())) {
    return "es";
  }
  return "en";
}
