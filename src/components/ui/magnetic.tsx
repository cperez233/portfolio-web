"use client";

import { useEffect, useState, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const spring = { stiffness: 260, damping: 18, mass: 0.6 };

/**
 * Envoltorio magnetico: el hijo se inclina hacia el cursor mientras esta
 * encima y vuelve con un resorte al salir. Solo con raton de verdad
 * (hover: hover); en tactil y con movimiento reducido es un span quieto.
 *
 * `strength` es la fraccion de la distancia al centro que se desplaza:
 * 0.3 se nota sin que el boton se escape del dedo.
 */
export function Magnetic({
  children,
  strength = 0.3,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const active = canHover && !shouldReduceMotion;

  const handleMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className="inline-flex"
      style={active ? { x: springX, y: springY } : undefined}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
