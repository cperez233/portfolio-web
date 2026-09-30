"use client";

import { useEffect } from "react";

/**
 * Pausa las animaciones en bucle (lineas de flujo de los diagramas, el
 * sello del retrato, la flecha del hero, la tira de paginas publicadas)
 * de cada seccion mientras esta fuera de pantalla. Seguian corriendo sin
 * que nadie las viera y gastaban bateria en celulares baratos.
 *
 * Observa las secciones y no cada bucle: son pocas, fijas, y cualquier
 * bucle que aparezca despues dentro de ellas (un diagrama que cambia) ya
 * queda cubierto por la clase del contenedor (ver globals.css).
 */
export function PauseOffscreenLoops() {
  useEffect(() => {
    const targets = document.querySelectorAll("main > *, main section, footer");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
        }
      },
      { rootMargin: "100px 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return null;
}
