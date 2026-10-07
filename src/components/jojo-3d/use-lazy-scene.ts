"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

interface Controllable {
  setVisible: (visible: boolean) => void;
  dispose: () => void;
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Monta una escena three.js cuando el canvas esta a 500px de la pantalla
 * (import dinamico: three no entra en el paquete inicial), la pausa fuera
 * de pantalla y la desmonta al salir. `ready` pasa a true cuando hay algo
 * pintado; sin WebGL se queda en false y quien la usa muestra su respaldo.
 */
export function useLazyScene<T extends Controllable>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  create: (canvas: HTMLCanvasElement, reducedMotion: boolean) => Promise<T>,
) {
  const reducedMotion = useReducedMotion();
  const sceneRef = useRef<T | null>(null);
  const [ready, setReady] = useState(false);
  const createRef = useRef(create);

  useEffect(() => {
    createRef.current = create;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;

    const visibility = new IntersectionObserver(([entry]) => {
      sceneRef.current?.setVisible(entry.isIntersecting);
    });
    const loader = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        if (!hasWebGL()) return;
        try {
          const scene = await createRef.current(canvas, reducedMotion);
          if (disposed) {
            scene.dispose();
            return;
          }
          sceneRef.current = scene;
          visibility.observe(canvas);
          setReady(true);
        } catch {
          // Sin contexto WebGL real: queda el respaldo.
        }
      },
      { rootMargin: "500px 0px" },
    );
    loader.observe(canvas);

    return () => {
      disposed = true;
      loader.disconnect();
      visibility.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [canvasRef, reducedMotion]);

  return { ready, scene: sceneRef };
}
