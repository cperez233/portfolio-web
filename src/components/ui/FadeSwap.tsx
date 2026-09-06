"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

interface FadeSwapProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Cruce de idioma con AnimatePresence en `mode="wait"`: el bloque
 * saliente termina su animacion antes de que entre el nuevo.
 *
 * `mode="wait"` deja un instante sin contenido, asi que el contenedor
 * reserva la altura con `grid` y una fila implicita: el hueco no se
 * colapsa y no hay salto de layout mientras se hace el relevo.
 */
export function FadeSwap({ children, className }: FadeSwapProps) {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 grid-rows-1", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={language}
          className="col-start-1 row-start-1"
          initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
