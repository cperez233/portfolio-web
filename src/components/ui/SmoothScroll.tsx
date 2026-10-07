"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/smooth-scroll";

/**
 * Scroll con inercia (estilo fora.so).
 *
 * Lenis intercepta la rueda para interpolar el desplazamiento, asi que
 * se desactiva por completo con prefers-reduced-motion: quien pide
 * menos movimiento recupera el scroll nativo, sin inercia.
 *
 * Sigue moviendo el scroll real de la ventana (no traslada un wrapper),
 * asi que `position: sticky` y el `useScroll` de Framer Motion siguen
 * funcionando sin cambios.
 */
export function SmoothScroll() {
  useEffect(() => {
    // React arranco: la red de seguridad de root-shell no hace falta.
    window.__hydrated = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) return;

    const lenis = new Lenis({
      // Inercia pesada pero corta de cola: se siente refinada sin
      // dejar la pagina "resbalando" despues de soltar.
      lerp: 0.085,
      smoothWheel: true,
      autoRaf: true,
      /*
        Los enlaces ancla los gestiona SectionCurtain: cerca, desliza con
        esta misma instancia; lejos, salta detras de un telon. Con
        `anchors: true` Lenis tambien los capturaria y recorreria la
        pagina entera.
      */
      anchors: false,
    });

    registerLenis(lenis);

    return () => {
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
