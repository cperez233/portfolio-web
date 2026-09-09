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
        Sin esto los enlaces ancla del menu no llegan a ninguna parte.
        Lenis reescribe la posicion de scroll en cada frame, asi que el
        salto nativo del navegador se deshace al frame siguiente. Con
        `anchors` los gestiona Lenis y el salto se respeta.
      */
      anchors: true,
    });

    registerLenis(lenis);

    return () => {
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
