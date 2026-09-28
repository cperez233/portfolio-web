"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const list = window.matchMedia(QUERY);
  list.addEventListener("change", onStoreChange);
  return () => list.removeEventListener("change", onStoreChange);
}

/**
 * `prefers-reduced-motion` como estado de React, seguro para hidratar.
 *
 * Sustituye al `useReducedMotion` de Framer Motion, que en el cliente lee
 * la preferencia ya en el primer render. El servidor no la conoce, asi
 * que quien tenia "Reducir movimiento" activado recibia un HTML distinto
 * del que pintaba su navegador: React descartaba la pagina entera y la
 * rehacia en el cliente, y en algunos celulares las secciones de debajo
 * del hero se quedaban invisibles (su opacidad 0 inicial del servidor).
 *
 * Con useSyncExternalStore el primer render del cliente usa el valor del
 * servidor (`false`), la hidratacion coincide, y justo despues React
 * vuelve a pintar con la preferencia real.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
