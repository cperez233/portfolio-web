import type { Variants } from "framer-motion";

/**
 * Entrada escalonada de los diagramas: los nodos y las lineas del
 * terminal aparecen en orden de lectura, con la misma curva que el resto
 * del sitio. Los hijos solo declaran `variants={revealItem}`; el orden
 * lo marca el contenedor.
 */
export const revealContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};
