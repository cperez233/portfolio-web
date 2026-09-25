import type Lenis from "lenis";

/*
  Lenis reescribe la posicion de scroll en cada frame, asi que cualquier
  `window.scrollTo` externo se deshace al frame siguiente. Todo salto
  programatico tiene que pasar por la propia instancia.

  La referencia vive en `window` y no en una variable de modulo: el
  proveedor y los consumidores son componentes de cliente distintos, y
  Next puede repartirlos en chunks separados. Con una variable de modulo
  cada chunk se quedaba con su propia copia en `null`, y el salto no
  llegaba nunca a Lenis. `window` es el unico ambito que ambos comparten
  con certeza.
*/
declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

export function registerLenis(lenis: Lenis | null) {
  window.__lenis = lenis;
}

/** Salta a una posicion. Cae a scroll nativo si Lenis no esta activo. */
export function smoothScrollTo(target: number) {
  const lenis = typeof window === "undefined" ? null : window.__lenis;

  if (lenis) {
    lenis.scrollTo(target);
    return;
  }

  window.scrollTo({ top: target });
}

/**
 * Salto instantaneo, sin animacion. Para mover el scroll dentro de un
 * tramo fijado (sticky), donde el salto no se ve pero el progreso si.
 */
export function jumpScrollTo(target: number) {
  const lenis = typeof window === "undefined" ? null : window.__lenis;

  if (lenis) {
    lenis.scrollTo(target, { immediate: true, force: true });
    return;
  }

  window.scrollTo({ top: target, behavior: "instant" });
}
