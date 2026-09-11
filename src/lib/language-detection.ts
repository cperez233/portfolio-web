import type { Language } from "@/data/content";

/**
 * Deteccion del idioma de entrada. Modulo SIN "use client": lo usan
 * tanto `proxy.ts` (servidor) como el store de idioma (cliente).
 *
 * Orden de prioridad, de mayor a menor:
 * 1. La eleccion manual del toggle (cookie `portafolio-language`, y la
 *    misma clave en localStorage para quien eligio antes de que existiera
 *    la cookie). Si alguien eligio, no se le vuelve a adivinar.
 * 2. Lo que detecto el proxy con Accept-Language y el pais de Vercel
 *    (cookie `portafolio-language-detected`).
 * 3. El idioma del navegador, por si el proxy no corrio.
 * 4. Ingles.
 */

/** Preferencia manual del toggle. Misma clave que en localStorage. */
export const LANGUAGE_COOKIE = "portafolio-language";

/** Idioma que dedujo el proxy de las cabeceras de la peticion. */
export const DETECTED_LANGUAGE_COOKIE = "portafolio-language-detected";

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
