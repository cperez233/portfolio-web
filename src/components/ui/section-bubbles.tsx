"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Bubble {
  /** Porcentaje horizontal dentro del separador. */
  left: number;
  size: number;
  duration: number;
  delay: number;
  blur: string;
  opacity: number;
}

/*
  Posiciones fijas y no aleatorias: con Math.random() el servidor y el
  cliente generarian valores distintos y React avisaria de hidratacion.
*/
const bubbles: Bubble[] = [
  { left: 8, size: 180, duration: 7, delay: 0, blur: "blur-xl", opacity: 0.9 },
  { left: 26, size: 110, duration: 5, delay: 0.8, blur: "blur-lg", opacity: 0.7 },
  { left: 47, size: 220, duration: 6.5, delay: 0.3, blur: "blur-xl", opacity: 1 },
  { left: 68, size: 130, duration: 4, delay: 1.2, blur: "blur-md", opacity: 0.6 },
  { left: 86, size: 170, duration: 6, delay: 0.5, blur: "blur-xl", opacity: 0.85 },
];

interface SectionBubblesProps {
  className?: string;
  /** Alto del separador. */
  height?: "sm" | "md";
}

/**
 * Separador ambiental entre secciones: orbes borgona muy tenues que
 * flotan en vertical.
 *
 * Es decorativo puro (aria-hidden, pointer-events-none) y va recortado
 * con overflow-hidden: los orbes se salen del ancho a proposito, y sin
 * el recorte arrastrarian scroll horizontal.
 */
export function SectionBubbles({
  className,
  height = "md",
}: SectionBubblesProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative w-full overflow-hidden bg-canvas transition-colors duration-500",
        height === "sm" ? "h-24 sm:h-32" : "h-32 sm:h-44",
        className,
      )}
    >
      {bubbles.map((bubble) => (
        <motion.span
          key={bubble.left}
          className={cn("absolute rounded-full", bubble.blur)}
          style={{
            left: `${bubble.left}%`,
            width: bubble.size,
            height: bubble.size,
            top: "50%",
            marginTop: -bubble.size / 2,
            marginLeft: -bubble.size / 2,
            opacity: bubble.opacity,
            background:
              "radial-gradient(circle, rgba(101, 42, 49, 0.25) 0%, transparent 70%)",
            willChange: shouldReduceMotion ? undefined : "transform",
          }}
          animate={
            shouldReduceMotion ? undefined : { translateY: [-8, 8, -8] }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: bubble.duration,
                  delay: bubble.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}
