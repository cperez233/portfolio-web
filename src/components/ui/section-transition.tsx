"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Filo superior de seccion: una linea de acento que se dibuja de dentro
 * hacia fuera cuando la seccion llega.
 *
 * Marca el corte entre bloques sin mover nada de sitio: solo escala en
 * X, asi que no puede provocar scroll horizontal ni desplazar contenido.
 * Es decorativo, de ahi el aria-hidden.
 */
export function SectionEdge({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-center",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, transparent, var(--color-accent-ink), transparent)",
      }}
      initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Envoltorio de entrada y salida para una seccion.
 *
 * Entrando: el contenido sube y aparece. Saliendo por arriba: retrocede
 * en escala y opacidad, encadenando con el retroceso del hero para que
 * la profundidad sea continua de una seccion a la siguiente.
 *
 * IMPORTANTE: no envolver secciones con `sticky` dentro. Un `transform`
 * en un ancestro convierte a ese ancestro en el bloque contenedor y el
 * sticky de los hijos deja de pegarse al viewport. Services y Projects
 * dependen de sticky, asi que ahi solo se anima la cabecera.
 */
export function SectionTransition({
  children,
  className,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Entra entre 0 y 0.25; se mantiene; retrocede a partir de 0.75.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    [0, 1, 1, 0.55],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    [0.97, 1, 1, 0.97],
  );
  const y = useTransform(scrollYProgress, [0, 0.22], [32, 0]);

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale, y, willChange: "transform, opacity" }}
      className={cn("origin-center", className)}
    >
      {children}
    </motion.div>
  );
}
