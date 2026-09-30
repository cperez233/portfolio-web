"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
  Posicion, tamano y giro de cada ゴ, sacados de la portada del README:
  una columna irregular que tiembla a destiempo.
*/
const GLYPHS = [
  { x: "0%", y: "0%", size: 1, rotate: -12, delay: 0 },
  { x: "38%", y: "20%", size: 1.25, rotate: -6, delay: 0.25 },
  { x: "6%", y: "44%", size: 1.45, rotate: -14, delay: 0.5 },
  { x: "46%", y: "70%", size: 1.05, rotate: -8, delay: 0.75 },
];

interface MenacingProps {
  className?: string;
  /** Tamano base de cada ゴ, en cualquier unidad CSS. */
  size?: string;
}

/**
 * El ゴゴゴ de JoJo ("menacing"). Puramente decorativo: aria-hidden y sin
 * eventos, asi que no aporta texto ni cambia el orden de lectura. La
 * animacion (.menacing-glyph) queda quieta con reduced motion, y se pausa
 * cuando el grupo sale de pantalla: hay varios por pagina y seguian
 * temblando sin que nadie los viera, gastando bateria en celulares.
 */
export function Menacing({ className, size = "3rem" }: MenacingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none select-none", paused && "is-paused", className)}
      style={{ width: `calc(${size} * 2.2)`, height: `calc(${size} * 3.4)` }}
    >
      {GLYPHS.map((glyph, i) => (
        <span
          key={i}
          className="menacing-glyph absolute"
          style={
            {
              left: glyph.x,
              top: glyph.y,
              fontSize: `calc(${size} * ${glyph.size})`,
              "--menacing-rotate": `${glyph.rotate}deg`,
              animationDelay: `${glyph.delay}s`,
            } as React.CSSProperties
          }
        >
          ゴ
        </span>
      ))}
    </div>
  );
}
