/**
 * Constantes del tema, en un modulo SIN "use client".
 *
 * `layout.tsx` es un componente de servidor y necesita el valor real de
 * la clave para incrustarlo en el script que corre antes de la primera
 * pintura. Importarla desde un modulo marcado como cliente devuelve una
 * referencia al bundle, no la cadena: el script acababa preguntando por
 * `localStorage.getItem(undefined)` y no restauraba nada.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "portafolio-theme";

/** Tema con el que se pinta el HTML del servidor. */
export const DEFAULT_THEME: Theme = "dark";
