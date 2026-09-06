"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

interface FadeSwapProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Funde el contenido al cambiar de idioma.
 *
 * La `key` es el idioma, asi que React remonta el bloque y arranca el
 * fade. Solo se anima `opacity` y no hay `AnimatePresence`: el texto
 * nuevo ocupa su sitio de inmediato, asi que no hay salto de layout ni
 * colapso de altura mientras sale el anterior.
 */
export function FadeSwap({ children, className }: FadeSwapProps) {
  const { language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={language}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
