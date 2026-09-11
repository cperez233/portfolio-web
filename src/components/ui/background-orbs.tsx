"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
  Posiciones fijas y no aleatorias: con Math.random() el servidor y el
  cliente generarian valores distintos y React avisaria de hidratacion.
*/
interface Orb {
  id: string;
  size: number;
  /** Posicion en porcentaje dentro de la seccion contenedora. */
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const layouts: Record<string, Orb[]> = {
  top: [
    { id: "a", size: 460, x: 12, y: 8, duration: 11, delay: 0 },
    { id: "b", size: 320, x: 78, y: 22, duration: 9, delay: 1.5 },
    { id: "c", size: 380, x: 46, y: 78, duration: 12, delay: 0.8 },
  ],
  middle: [
    { id: "a", size: 420, x: 84, y: 12, duration: 10, delay: 0.4 },
    { id: "b", size: 300, x: 8, y: 46, duration: 8, delay: 1.2 },
    { id: "c", size: 500, x: 62, y: 88, duration: 12, delay: 0 },
  ],
  wide: [
    { id: "a", size: 500, x: 6, y: 14, duration: 12, delay: 0 },
    { id: "b", size: 340, x: 92, y: 34, duration: 9, delay: 1.8 },
    { id: "c", size: 400, x: 30, y: 62, duration: 10.5, delay: 0.6 },
    { id: "d", size: 460, x: 74, y: 86, duration: 11, delay: 1 },
  ],
};

interface BackgroundOrbsProps {
  variant?: keyof typeof layouts;
  className?: string;
}

/**
 * Capa escenica de fondo: esferas radiales vino, muy difuminadas. Color,
 * opacidad y desvanecido en los bordes viven en `.bg-orb` y `.orb-field`
 * (globals.css), para que sigan al tema.
 *
 * Es puramente decorativa (aria-hidden, pointer-events-none) y vive
 * DETRAS del contenido: la seccion que la aloja debe ser `relative` y
 * su contenido ir en `relative z-10`.
 *
 * El propio contenedor recorta con overflow-hidden. Los orbes se salen
 * del ancho a proposito y, sin ese recorte, arrastrarian scroll
 * horizontal a toda la pagina.
 */
export function BackgroundOrbs({
  variant = "middle",
  className,
}: BackgroundOrbsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "orb-field pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      {layouts[variant].map((orb) => (
        <motion.span
          key={orb.id}
          className="bg-orb absolute rounded-full blur-3xl"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            marginLeft: -orb.size / 2,
            marginTop: -orb.size / 2,
            willChange: shouldReduceMotion ? undefined : "transform",
          }}
          animate={shouldReduceMotion ? undefined : { y: [-15, 15, -15] }}
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: orb.duration,
                  delay: orb.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}
