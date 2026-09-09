"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query como estado de React.
 *
 * En el servidor devuelve `false` a proposito: el HTML se genera con la
 * variante mas simple, la de movil, que es tambien la que nunca recorta
 * contenido. Si la consulta si se cumple, React repinta justo despues de
 * hidratar.
 *
 * Hace falta en JS y no basta con clases `md:` porque hay decisiones que
 * no son CSS: en las tarjetas de proyecto determina si se monta el
 * apilado con `sticky` y su transformacion de escala, o si las tarjetas
 * fluyen una tras otra.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
