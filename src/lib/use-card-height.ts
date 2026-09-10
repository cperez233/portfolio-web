"use client";

import { useEffect, type RefObject } from "react";

/**
 * Publica el alto real de `content` en la variable CSS `--card-h` de
 * `wrapper`. La lee `.stack-sticky` (globals.css) para decidir donde
 * fijar una tarjeta apilada: bajo la navbar si cabe en el viewport, o
 * por su borde inferior si no cabe.
 *
 * ResizeObserver y no una medida al montar: el alto cambia con el idioma
 * y con el ancho. `offsetHeight` es el alto de layout, sin la escala del
 * transform que anima la tarjeta.
 */
export function useCardHeight(
  wrapperRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const observer = new ResizeObserver(() => {
      wrapper.style.setProperty("--card-h", `${content.offsetHeight}px`);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [wrapperRef, contentRef]);
}
