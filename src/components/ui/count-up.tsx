"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Cifra que cuenta desde cero al entrar en pantalla. Solo la parte
 * numerica inicial ("32" de "32K+"); lo que no empieza por numero se
 * pinta tal cual. El HTML del servidor trae el valor final, que es lo
 * que leen buscadores y lectores de pantalla.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shouldReduceMotion = useReducedMotion();
  const match = /^(\d+)(.*)$/.exec(value);

  // Al hidratar arranca en cero, para que no se vea la cifra final
  // saltar a 0 justo cuando empieza la cuenta.
  useEffect(() => {
    const element = ref.current;
    if (!element || !match || inView || shouldReduceMotion) return;
    element.textContent = `0${match[2]}`;
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
        element.textContent = `${Math.round(latest)}${suffix}`;
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
