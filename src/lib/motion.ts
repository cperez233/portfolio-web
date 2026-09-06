import type { Transition, Variants } from "framer-motion";

/** Easing compartido. Espeja --ease-premium de globals.css. */
export const easePremium = [0.22, 1, 0.36, 1] as const;

export const transitionBase: Transition = {
  duration: 0.6,
  ease: easePremium,
};

/**
 * Entrada estandar de seccion. Solo anima transform y opacity
 * (directriz 3) para no disparar layout ni paint.
 */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/** Variante sin desplazamiento, para prefers-reduced-motion. */
export const revealVariantsReduced: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};
