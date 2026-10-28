"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Cifra que cuenta desde cero al entrar en pantalla. Solo la parte
 * numerica inicial ("35" de "35K+", "8.5" de "8.5K+", con sus decimales);
 * lo que no empieza por numero se pinta tal cual. El HTML del servidor trae el valor final, que es lo
 * que leen buscadores y lectores de pantalla.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shouldReduceMotion = useReducedMotion();
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  // "8.5K+" cuenta de 0.0 a 8.5 con un decimal, no de 0 a 8 pegado a ".5K+".
  const decimals = match?.[1].split(".")[1]?.length ?? 0;

  // Al hidratar arranca en cero, para que no se vea la cifra final
  // saltar a 0 justo cuando empieza la cuenta.
  useEffect(() => {
    const element = ref.current;
    if (!element || !match || inView || shouldReduceMotion) return;
    element.textContent = `${(0).toFixed(decimals)}${match[2]}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !match || !inView || shouldReduceMotion) return;

    const target = Number(match[1]);
    const suffix = match[2];
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        element.textContent = `${latest.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
    // match se recalcula en cada render; basta con el valor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, shouldReduceMotion, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
