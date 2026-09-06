"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  revealVariants,
  revealVariantsReduced,
  transitionBase,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Retardo en segundos, para escalonar elementos hermanos. */
  delay?: number;
}

/**
 * Entrada al entrar en viewport. Anima solo opacity y transform.
 * Con prefers-reduced-motion el contenido aparece ya visible:
 * nunca se queda contenido oculto detras de una animacion.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={shouldReduceMotion ? revealVariantsReduced : revealVariants}
      transition={{ ...transitionBase, delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
