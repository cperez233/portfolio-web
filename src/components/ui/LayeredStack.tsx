"use client";

import { Children, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface LayeredStackProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Directriz 3 - Scroll lock & layering, estilo fora.so.
 *
 * Cada hijo se fija con `sticky top-0` y las capas siguientes se montan
 * encima como cartas apiladas. El "bloqueo" es aparente: el scroll nativo
 * nunca se intercepta ni se secuestra, solo se lee su progreso.
 *
 * Un unico `useScroll` sobre el contenedor alimenta a todas las capas;
 * medir cada capa por separado es fragil cuando ya esta pegada al viewport.
 *
 * Con prefers-reduced-motion se degrada a una pila vertical plana.
 */
export function LayeredStack({ children, className }: LayeredStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const layers = Children.toArray(children);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (shouldReduceMotion) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>{layers}</div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {layers.map((layer, index) => (
        <StackLayer
          key={index}
          index={index}
          total={layers.length}
          progress={scrollYProgress}
        >
          {layer}
        </StackLayer>
      ))}
    </div>
  );
}

interface StackLayerProps {
  children: React.ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function StackLayer({ children, index, total, progress }: StackLayerProps) {
  // La capa empieza a ceder cuando la siguiente entra a cubrirla.
  const start = index / total;
  const layersAbove = total - index - 1;

  // Solo transform y opacity: nada que dispare layout o paint.
  const scale = useTransform(progress, [start, 1], [1, 1 - layersAbove * 0.04]);
  const opacity = useTransform(progress, [start, 1], [1, 1 - layersAbove * 0.15]);

  return (
    <div
      className="sticky top-0 flex h-svh items-center justify-center"
      // Escalonado estatico: da el borde visible de la pila. No se anima.
      style={{ paddingTop: `${index * 1.75}rem` }}
    >
      <motion.div
        style={{ scale, opacity, willChange: "transform, opacity" }}
        className="w-full origin-top"
      >
        {children}
      </motion.div>
    </div>
  );
}
