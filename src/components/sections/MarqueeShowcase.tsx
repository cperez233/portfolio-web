"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { marqueeRowOne, marqueeRowTwo } from "@/data/site";

/**
 * Dos filas que se desplazan en sentidos opuestos segun la posicion
 * del scroll. Listener pasivo, y solo se toca transform.
 *
 * Cada fila se recorta con overflow-x-clip: sin eso, las filas
 * trasladadas generarian scroll horizontal en toda la pagina.
 */
export function MarqueeShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(200);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleScroll = () => {
      const element = sectionRef.current;
      if (!element) return;

      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      setOffset(
        (window.scrollY - sectionTop + window.innerHeight) * 0.3,
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldReduceMotion]);

  const shift = offset - 200;

  return (
    <section
      ref={sectionRef}
      aria-label="Motion showcase"
      className="overflow-x-clip bg-[#0c0c0c] pb-10 pt-24 sm:pt-32 md:pt-40"
    >
      <MarqueeRow
        sources={[...marqueeRowOne, ...marqueeRowOne, ...marqueeRowOne]}
        translateX={shift}
      />
      <div className="h-3" />
      <MarqueeRow
        sources={[...marqueeRowTwo, ...marqueeRowTwo, ...marqueeRowTwo]}
        translateX={-shift}
      />
    </section>
  );
}

interface MarqueeRowProps {
  sources: string[];
  translateX: number;
}

function MarqueeRow({ sources, translateX }: MarqueeRowProps) {
  return (
    <div className="overflow-x-clip">
      <div
        className="flex w-max gap-3"
        style={{
          transform: `translateX(${translateX}px)`,
          willChange: "transform",
        }}
      >
        {sources.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative h-[270px] w-[420px] shrink-0 overflow-hidden rounded-2xl bg-white/5"
          >
            <Image
              src={src}
              alt=""
              aria-hidden="true"
              fill
              // GIF animado: optimizarlo lo congelaria en el primer frame.
              unoptimized
              loading="lazy"
              sizes="420px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
